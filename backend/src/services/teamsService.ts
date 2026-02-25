import {
  BotFrameworkAdapter,
  ActivityHandler,
  TurnContext,
  CardFactory,
  ConversationReference,
  MessageFactory,
} from 'botbuilder';
import { config } from '../config/index.js';
import { saveTeamsUser } from './database.js';

const adapter = new BotFrameworkAdapter({
  appId: config.teams.botAppId,
  appPassword: config.teams.botAppPassword,
  channelAuthTenant: config.teams.botTenantId,
});

adapter.onTurnError = async (_context: TurnContext, error: Error) => {
  console.error('[TeamsBot] Unhandled error:', error);
};

// Will be set by the workflow orchestrator to handle card submissions
let onCardSubmitHandler: ((sessionId: string, action: string, data: Record<string, string>) => Promise<void>) | null = null;

export function setCardSubmitHandler(
  handler: (sessionId: string, action: string, data: Record<string, string>) => Promise<void>
): void {
  onCardSubmitHandler = handler;
}

class TeamsBot extends ActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context: TurnContext, next: () => Promise<void>) => {
      const value = context.activity.value as Record<string, string> | undefined;
      if (value?.action && value?.sessionId) {
        if (onCardSubmitHandler) {
          await onCardSubmitHandler(value.sessionId, value.action, value);
        }
      }
      await next();
    });

    this.onMembersAdded(async (context: TurnContext, next: () => Promise<void>) => {
      const membersAdded = context.activity.membersAdded ?? [];
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          // Store conversation reference for proactive messaging
          const ref = TurnContext.getConversationReference(context.activity);
          const email = context.activity.from?.aadObjectId
            ? context.activity.from.name
            : member.name;
          if (email) {
            saveTeamsUser(email.toLowerCase(), JSON.stringify(ref));
          }
        }
      }
      await next();
    });
  }
}

const bot = new TeamsBot();

export function getAdapter(): BotFrameworkAdapter {
  return adapter;
}

export function getBot(): TeamsBot {
  return bot;
}

export async function processActivity(req: unknown, res: unknown): Promise<void> {
  await adapter.process(req as any, res as any, (context) => bot.run(context));
}

export async function sendContextRequestCard(
  conversationRefJson: string,
  meetingTopic: string,
  meetingDate: string,
  sessionId: string
): Promise<void> {
  const conversationRef: Partial<ConversationReference> = JSON.parse(conversationRefJson);

  const card = CardFactory.adaptiveCard({
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: 'Meeting Transcript Ready',
        weight: 'Bolder',
        size: 'Large',
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'Topic:', value: meetingTopic },
          { title: 'Date:', value: new Date(meetingDate).toLocaleDateString() },
        ],
      },
      {
        type: 'TextBlock',
        text: 'Would you like to add any additional context before we generate the summary? (e.g., meeting purpose, key attendees, follow-up priorities)',
        wrap: true,
      },
      {
        type: 'Input.Text',
        id: 'userContext',
        placeholder: 'Add context here (optional)...',
        isMultiline: true,
      },
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'Submit Context',
        data: { action: 'submitContext', sessionId },
      },
      {
        type: 'Action.Submit',
        title: 'Skip — Generate Without Context',
        data: { action: 'skipContext', sessionId },
      },
    ],
  });

  await adapter.continueConversationAsync(
    config.teams.botAppId,
    conversationRef,
    async (context) => {
      await context.sendActivity(MessageFactory.attachment(card));
    }
  );
}

export async function sendCompanySelectionCard(
  conversationRefJson: string,
  companies: Array<{ id: string; name: string }>,
  summaryPreview: string,
  sessionId: string
): Promise<void> {
  const conversationRef: Partial<ConversationReference> = JSON.parse(conversationRefJson);

  const choices = companies.map((c) => ({
    title: c.name,
    value: `${c.id}|${c.name}`,
  }));

  const preview = summaryPreview.length > 500
    ? summaryPreview.slice(0, 500) + '...'
    : summaryPreview;

  const card = CardFactory.adaptiveCard({
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: 'Summary Generated',
        weight: 'Bolder',
        size: 'Large',
      },
      {
        type: 'TextBlock',
        text: preview,
        wrap: true,
        maxLines: 10,
      },
      {
        type: 'TextBlock',
        text: 'Select a HubSpot company to attach this note to:',
        wrap: true,
        weight: 'Bolder',
      },
      ...(choices.length > 0
        ? [
            {
              type: 'Input.ChoiceSet',
              id: 'companySelection',
              style: 'filtered' as const,
              choices,
              placeholder: 'Select a company...',
            },
          ]
        : []),
      {
        type: 'TextBlock',
        text: 'Or search for a different company:',
        wrap: true,
        spacing: 'Medium',
      },
      {
        type: 'Input.Text',
        id: 'companySearch',
        placeholder: 'Search company name...',
      },
    ],
    actions: [
      ...(choices.length > 0
        ? [
            {
              type: 'Action.Submit',
              title: 'Create HubSpot Note',
              data: { action: 'selectCompany', sessionId },
            },
          ]
        : []),
      {
        type: 'Action.Submit',
        title: 'Search Companies',
        data: { action: 'searchCompany', sessionId },
      },
      {
        type: 'Action.Submit',
        title: 'Cancel',
        data: { action: 'cancel', sessionId },
      },
    ],
  });

  await adapter.continueConversationAsync(
    config.teams.botAppId,
    conversationRef,
    async (context) => {
      await context.sendActivity(MessageFactory.attachment(card));
    }
  );
}

export async function sendConfirmationCard(
  conversationRefJson: string,
  companyName: string
): Promise<void> {
  const conversationRef: Partial<ConversationReference> = JSON.parse(conversationRefJson);

  const card = CardFactory.adaptiveCard({
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: 'HubSpot Note Created',
        weight: 'Bolder',
        size: 'Large',
        color: 'Good',
      },
      {
        type: 'TextBlock',
        text: `Meeting summary has been added as a note to **${companyName}** in HubSpot.`,
        wrap: true,
      },
    ],
  });

  await adapter.continueConversationAsync(
    config.teams.botAppId,
    conversationRef,
    async (context) => {
      await context.sendActivity(MessageFactory.attachment(card));
    }
  );
}

export async function sendErrorCard(
  conversationRefJson: string,
  errorMessage: string
): Promise<void> {
  const conversationRef: Partial<ConversationReference> = JSON.parse(conversationRefJson);

  const card = CardFactory.adaptiveCard({
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: 'Workflow Error',
        weight: 'Bolder',
        size: 'Large',
        color: 'Attention',
      },
      {
        type: 'TextBlock',
        text: `An error occurred: ${errorMessage}`,
        wrap: true,
      },
    ],
  });

  await adapter.continueConversationAsync(
    config.teams.botAppId,
    conversationRef,
    async (context) => {
      await context.sendActivity(MessageFactory.attachment(card));
    }
  );
}
