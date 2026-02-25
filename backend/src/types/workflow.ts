export type WorkflowStatus =
  | 'fetching_transcript'
  | 'pending_context'
  | 'generating_summary'
  | 'pending_company'
  | 'creating_note'
  | 'completed'
  | 'failed';

export interface Workflow {
  id: string;
  status: WorkflowStatus;
  zoom_meeting_id: string;
  organizer_email: string;
  meeting_topic: string;
  transcript: string | null;
  user_context: string | null;
  summary: string | null;
  selected_company_id: string | null;
  selected_company_name: string | null;
  teams_conversation_ref: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ZoomRecordingFile {
  id: string;
  file_type: string;
  download_url: string;
  recording_type: string;
  status: string;
}

export interface ZoomWebhookEvent {
  event: string;
  event_ts: number;
  payload: {
    account_id: string;
    object: {
      id: number;
      uuid: string;
      host_id: string;
      host_email: string;
      topic: string;
      start_time: string;
      duration: number;
      recording_files: ZoomRecordingFile[];
    };
  };
}

export interface HubSpotCompany {
  id: string;
  name: string;
  domain: string;
}
