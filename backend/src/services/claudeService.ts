import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/index.js';

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const SYSTEM_PROMPT = `You are an expert meeting summarizer for a business CRM. Produce concise, professional summaries that capture the essential information from meeting transcripts. Format your output in clean markdown.`;

function truncateTranscript(transcript: string, maxChars: number): string {
  if (transcript.length <= maxChars) return transcript;

  const keepChars = Math.floor(maxChars * 0.25);
  const start = transcript.slice(0, keepChars);
  const end = transcript.slice(-keepChars);
  return `${start}\n\n[... transcript truncated for length — middle section omitted ...]\n\n${end}`;
}

export async function summarizeMeeting(
  transcript: string,
  userContext: string | null,
  meetingTopic: string,
  meetingDate: string,
  duration: number
): Promise<string> {
  // ~4 chars per token, keep well under 200k context
  const truncated = truncateTranscript(transcript, 500000);

  let userPrompt = `Please summarize the following meeting transcript.

**Meeting Topic:** ${meetingTopic}
**Date:** ${meetingDate}
**Duration:** ${duration} minutes

`;

  if (userContext) {
    userPrompt += `**Additional Context from Organizer:**
${userContext}

`;
  }

  userPrompt += `**Transcript:**
${truncated}

Please provide a summary with the following sections:
## Meeting Summary
A brief 2-3 sentence overview.

## Attendees
List the participants identified in the transcript.

## Key Discussion Points
Bullet points of the main topics discussed.

## Decisions Made
Any decisions or agreements reached.

## Action Items
Specific next steps with owners if identifiable.

## Notes
Any other relevant observations.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find(block => block.type === 'text');
  return textBlock?.text ?? '';
}
