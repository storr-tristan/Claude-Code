export * from './workflow.js';

export type Platform = 'google_ads' | 'meta_ads' | 'microsoft_ads' | 'amazon_ads';

export interface Account {
  id: string;
  name: string;
  platform: Platform;
}

export interface MetricsRequest {
  platform: Platform;
  accountId: string;
  startDate: string;
  endDate: string;
}

export interface GoogleAdsMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpa: number;
  spend: number;
  roas: number;
}

export interface MetaAdsMetrics {
  reach: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpa: number;
  spend: number;
  roas: number;
}

export interface AmazonAdsMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  orders: number;
  acos: number;
  spend: number;
  sales: number;
}

export interface MicrosoftAdsMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpa: number;
  spend: number;
  roas: number;
}

export type PlatformMetrics =
  | GoogleAdsMetrics
  | MetaAdsMetrics
  | AmazonAdsMetrics
  | MicrosoftAdsMetrics;

export interface MetricsResponse {
  platform: Platform;
  accountId: string;
  accountName: string;
  startDate: string;
  endDate: string;
  metrics: PlatformMetrics;
  formattedOutput: string;
}
