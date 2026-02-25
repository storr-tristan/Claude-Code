import crypto from 'crypto';
import axios from 'axios';
import { config } from '../config/index.js';

let cachedToken: { token: string; expiresAt: number } | null = null;

export function handleUrlValidation(plainToken: string): { plainToken: string; encryptedToken: string } {
  const encryptedToken = crypto
    .createHmac('sha256', config.zoom.webhookSecretToken)
    .update(plainToken)
    .digest('hex');
  return { plainToken, encryptedToken };
}

export function verifySignature(rawBody: string, timestamp: string, signature: string): boolean {
  const message = `v0:${timestamp}:${rawBody}`;
  const expected = 'v0=' + crypto
    .createHmac('sha256', config.zoom.webhookSecretToken)
    .update(message)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(
    `${config.zoom.clientId}:${config.zoom.clientSecret}`
  ).toString('base64');

  const response = await axios.post(
    'https://zoom.us/oauth/token',
    null,
    {
      params: {
        grant_type: 'account_credentials',
        account_id: config.zoom.accountId,
      },
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  cachedToken = {
    token: response.data.access_token,
    expiresAt: Date.now() + (response.data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

function parseVtt(vttContent: string): string {
  const lines = vttContent.split('\n');
  const dialogueLines: string[] = [];
  let currentSpeaker = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip VTT header, empty lines, and timestamp lines
    if (
      trimmed === 'WEBVTT' ||
      trimmed === '' ||
      /^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->/.test(trimmed) ||
      /^\d+$/.test(trimmed)
    ) {
      continue;
    }

    // Check for speaker label (e.g., "John Smith: Hello everyone")
    const speakerMatch = trimmed.match(/^(.+?):\s*(.*)$/);
    if (speakerMatch) {
      const speaker = speakerMatch[1];
      const text = speakerMatch[2];
      if (speaker !== currentSpeaker) {
        currentSpeaker = speaker;
        dialogueLines.push(`\n${speaker}: ${text}`);
      } else {
        dialogueLines.push(text);
      }
    } else {
      dialogueLines.push(trimmed);
    }
  }

  return dialogueLines.join(' ').replace(/\s+/g, ' ').trim();
}

export async function fetchTranscript(downloadUrl: string): Promise<string> {
  const token = await getAccessToken();

  const response = await axios.get(downloadUrl, {
    headers: { Authorization: `Bearer ${token}` },
    params: { access_token: token },
  });

  const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  return parseVtt(content);
}
