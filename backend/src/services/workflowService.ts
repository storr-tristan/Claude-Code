import { v4 as uuidv4 } from 'uuid';
import type { ZoomWebhookEvent } from '../types/index.js';
import {
  createWorkflow,
  getWorkflow,
  getWorkflowByMeetingId,
  updateWorkflow,
  getTeamsUser,
} from './database.js';
import { fetchTranscript } from './zoomService.js';
import { summarizeMeeting } from './claudeService.js';
import {
  searchCompanies,
  getCompaniesByContactEmail,
  createNote,
} from './hubspotService.js';
import {
  setCardSubmitHandler,
  sendContextRequestCard,
  sendCompanySelectionCard,
  sendConfirmationCard,
  sendErrorCard,
} from './teamsService.js';

export function initWorkflowHandlers(): void {
  setCardSubmitHandler(async (sessionId, action, data) => {
    switch (action) {
      case 'submitContext':
        await handleUserContext(sessionId, data.userContext || '');
        break;
      case 'skipContext':
        await handleUserContextSkipped(sessionId);
        break;
      case 'selectCompany': {
        const selection = data.companySelection;
        if (selection) {
          const [companyId, companyName] = selection.split('|');
          await handleCompanySelected(sessionId, companyId, companyName);
        }
        break;
      }
      case 'searchCompany':
        await handleCompanySearch(sessionId, data.companySearch || '');
        break;
      case 'cancel':
        updateWorkflow(sessionId, { status: 'completed' });
        break;
    }
  });
}

export async function handleNewTranscript(event: ZoomWebhookEvent): Promise<void> {
  const meetingId = event.payload.object.uuid;
  const organizerEmail = event.payload.object.host_email;
  const meetingTopic = event.payload.object.topic;

  // Dedup check
  const existing = getWorkflowByMeetingId(meetingId);
  if (existing) {
    console.log(`[Workflow] Duplicate webhook for meeting ${meetingId}, skipping`);
    return;
  }

  const sessionId = uuidv4();
  const workflow = createWorkflow({
    id: sessionId,
    zoom_meeting_id: meetingId,
    organizer_email: organizerEmail,
    meeting_topic: meetingTopic,
  });

  try {
    // Find transcript file
    const transcriptFile = event.payload.object.recording_files.find(
      (f) => f.file_type === 'TRANSCRIPT'
    );
    if (!transcriptFile) {
      throw new Error('No transcript file found in recording');
    }

    const transcript = await fetchTranscript(transcriptFile.download_url);
    updateWorkflow(sessionId, {
      status: 'pending_context',
      transcript,
    });

    // Look up Teams conversation reference
    const conversationRef = getTeamsUser(organizerEmail.toLowerCase());
    if (conversationRef) {
      updateWorkflow(sessionId, { teams_conversation_ref: conversationRef });
      await sendContextRequestCard(
        conversationRef,
        meetingTopic,
        event.payload.object.start_time,
        sessionId
      );
    } else {
      console.log(`[Workflow] No Teams conversation ref for ${organizerEmail}, proceeding without context`);
      await handleUserContextSkipped(sessionId);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Workflow] Error processing transcript for ${meetingId}:`, message);
    updateWorkflow(sessionId, { status: 'failed', error_message: message });

    const ref = workflow.teams_conversation_ref;
    if (ref) {
      await sendErrorCard(ref, message).catch(() => {});
    }
  }
}

async function handleUserContext(sessionId: string, context: string): Promise<void> {
  const workflow = getWorkflow(sessionId);
  if (!workflow || workflow.status !== 'pending_context') return;

  updateWorkflow(sessionId, {
    status: 'generating_summary',
    user_context: context,
  });

  await generateAndSendSummary(sessionId);
}

async function handleUserContextSkipped(sessionId: string): Promise<void> {
  const workflow = getWorkflow(sessionId);
  if (!workflow) return;

  updateWorkflow(sessionId, { status: 'generating_summary' });
  await generateAndSendSummary(sessionId);
}

async function generateAndSendSummary(sessionId: string): Promise<void> {
  const workflow = getWorkflow(sessionId);
  if (!workflow || !workflow.transcript) return;

  try {
    const summary = await summarizeMeeting(
      workflow.transcript,
      workflow.user_context,
      workflow.meeting_topic,
      workflow.created_at,
      0
    );

    updateWorkflow(sessionId, {
      status: 'pending_company',
      summary,
    });

    // Try to find companies related to the organizer
    let companies = await getCompaniesByContactEmail(workflow.organizer_email).catch(() => []);

    // Fallback: search by meeting topic keywords
    if (companies.length === 0) {
      const topicWords = workflow.meeting_topic.split(/\s+/).slice(0, 3).join(' ');
      companies = await searchCompanies(topicWords).catch(() => []);
    }

    const conversationRef = workflow.teams_conversation_ref;
    if (conversationRef) {
      await sendCompanySelectionCard(
        conversationRef,
        companies.map((c) => ({ id: c.id, name: c.name })),
        summary,
        sessionId
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Workflow] Error generating summary for ${sessionId}:`, message);
    updateWorkflow(sessionId, { status: 'failed', error_message: message });

    const ref = workflow.teams_conversation_ref;
    if (ref) {
      await sendErrorCard(ref, message).catch(() => {});
    }
  }
}

async function handleCompanySelected(
  sessionId: string,
  companyId: string,
  companyName: string
): Promise<void> {
  const workflow = getWorkflow(sessionId);
  if (!workflow || workflow.status !== 'pending_company' || !workflow.summary) return;

  updateWorkflow(sessionId, {
    status: 'creating_note',
    selected_company_id: companyId,
    selected_company_name: companyName,
  });

  try {
    await createNote(companyId, workflow.summary, workflow.created_at);

    updateWorkflow(sessionId, { status: 'completed' });

    const conversationRef = workflow.teams_conversation_ref;
    if (conversationRef) {
      await sendConfirmationCard(conversationRef, companyName);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Workflow] Error creating HubSpot note for ${sessionId}:`, message);
    updateWorkflow(sessionId, { status: 'failed', error_message: message });

    const ref = workflow.teams_conversation_ref;
    if (ref) {
      await sendErrorCard(ref, message).catch(() => {});
    }
  }
}

async function handleCompanySearch(sessionId: string, searchQuery: string): Promise<void> {
  const workflow = getWorkflow(sessionId);
  if (!workflow || !workflow.summary) return;

  try {
    const companies = await searchCompanies(searchQuery);
    const conversationRef = workflow.teams_conversation_ref;
    if (conversationRef) {
      await sendCompanySelectionCard(
        conversationRef,
        companies.map((c) => ({ id: c.id, name: c.name })),
        workflow.summary,
        sessionId
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Workflow] Error searching companies for ${sessionId}:`, message);
  }
}
