import { format } from 'date-fns';

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatPercentage = (num: number): string => {
  return `${num.toFixed(2)}%`;
};

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const getPlatformLabel = (platform: string): string => {
  const labels: Record<string, string> = {
    google_ads: 'Google Ads',
    meta_ads: 'Meta Ads',
    microsoft_ads: 'Microsoft Ads',
    amazon_ads: 'Amazon Ads',
  };
  return labels[platform] || platform;
};
