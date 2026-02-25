import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // API credentials - stored server-side
  // TODO: Add your actual API credentials here or use Azure Key Vault
  googleAds: {
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
  },

  metaAds: {
    accessToken: process.env.META_ADS_ACCESS_TOKEN || '',
    appId: process.env.META_ADS_APP_ID || '',
    appSecret: process.env.META_ADS_APP_SECRET || '',
  },

  microsoftAds: {
    clientId: process.env.MICROSOFT_ADS_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_ADS_CLIENT_SECRET || '',
    developerToken: process.env.MICROSOFT_ADS_DEVELOPER_TOKEN || '',
    refreshToken: process.env.MICROSOFT_ADS_REFRESH_TOKEN || '',
  },

  amazonAds: {
    clientId: process.env.AMAZON_ADS_CLIENT_ID || '',
    clientSecret: process.env.AMAZON_ADS_CLIENT_SECRET || '',
    refreshToken: process.env.AMAZON_ADS_REFRESH_TOKEN || '',
  },

  zoom: {
    accountId: process.env.ZOOM_ACCOUNT_ID || '',
    clientId: process.env.ZOOM_CLIENT_ID || '',
    clientSecret: process.env.ZOOM_CLIENT_SECRET || '',
    webhookSecretToken: process.env.ZOOM_WEBHOOK_SECRET_TOKEN || '',
  },

  teams: {
    botAppId: process.env.TEAMS_BOT_APP_ID || '',
    botAppPassword: process.env.TEAMS_BOT_APP_PASSWORD || '',
    botTenantId: process.env.TEAMS_BOT_TENANT_ID || '',
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },

  hubspot: {
    accessToken: process.env.HUBSPOT_ACCESS_TOKEN || '',
  },
};
