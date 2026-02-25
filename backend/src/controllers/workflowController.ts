import type { Request, Response } from 'express';
import { handleUrlValidation, verifySignature } from '../services/zoomService.js';
import { processActivity } from '../services/teamsService.js';
import { handleNewTranscript } from '../services/workflowService.js';
import type { ZoomWebhookEvent } from '../types/index.js';

interface RawBodyRequest extends Request {
  rawBody?: string;
}

export async function handleZoomWebhook(req: RawBodyRequest, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>;

  // Handle Zoom URL validation challenge
  if (body.event === 'endpoint.url_validation') {
    const payload = body.payload as { plainToken: string };
    const response = handleUrlValidation(payload.plainToken);
    res.status(200).json(response);
    return;
  }

  // Verify webhook signature
  const timestamp = req.headers['x-zm-request-timestamp'] as string;
  const signature = req.headers['x-zm-signature'] as string;
  const rawBody = req.rawBody;

  if (!timestamp || !signature || !rawBody) {
    res.status(401).json({ error: 'Missing signature headers' });
    return;
  }

  if (!verifySignature(rawBody, timestamp, signature)) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  // Respond immediately, process asynchronously
  res.status(200).json({ status: 'accepted' });

  if (body.event === 'recording.transcript_completed') {
    handleNewTranscript(body as unknown as ZoomWebhookEvent).catch((error) => {
      console.error('[ZoomWebhook] Async processing error:', error);
    });
  }
}

export async function handleTeamsMessages(req: Request, res: Response): Promise<void> {
  await processActivity(req, res);
}
