import { Request, Response } from 'express';
import googleAdsService from '../services/googleAdsService.js';
import metaAdsService from '../services/metaAdsService.js';
import amazonAdsService from '../services/amazonAdsService.js';
import microsoftAdsService from '../services/microsoftAdsService.js';
import type { MetricsRequest, Platform } from '../types/index.js';

/**
 * Get accounts for a specific platform
 */
export const getAccounts = async (req: Request, res: Response) => {
  try {
    const platform = req.params.platform as Platform;

    if (!['google_ads', 'meta_ads', 'microsoft_ads', 'amazon_ads'].includes(platform)) {
      return res.status(400).json({
        message: 'Invalid platform specified',
        details: 'Platform must be one of: google_ads, meta_ads, microsoft_ads, amazon_ads',
      });
    }

    let accounts;

    switch (platform) {
      case 'google_ads':
        accounts = await googleAdsService.getAccounts();
        break;
      case 'meta_ads':
        accounts = await metaAdsService.getAccounts();
        break;
      case 'microsoft_ads':
        accounts = await microsoftAdsService.getAccounts();
        break;
      case 'amazon_ads':
        accounts = await amazonAdsService.getAccounts();
        break;
    }

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({
      message: 'Failed to fetch accounts',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get metrics for a specific account and date range
 */
export const getMetrics = async (req: Request, res: Response) => {
  try {
    const { platform, accountId, startDate, endDate } = req.body as MetricsRequest;

    // Validation
    if (!platform || !accountId || !startDate || !endDate) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: 'platform, accountId, startDate, and endDate are required',
      });
    }

    if (!['google_ads', 'meta_ads', 'microsoft_ads', 'amazon_ads'].includes(platform)) {
      return res.status(400).json({
        message: 'Invalid platform specified',
        details: 'Platform must be one of: google_ads, meta_ads, microsoft_ads, amazon_ads',
      });
    }

    let metrics;
    let formattedOutput;
    let accountName = '';

    // Fetch account name
    let accounts;
    switch (platform) {
      case 'google_ads':
        accounts = await googleAdsService.getAccounts();
        metrics = await googleAdsService.getMetrics(accountId, startDate, endDate);
        accountName = accounts.find((a) => a.id === accountId)?.name || accountId;
        formattedOutput = googleAdsService.formatMetrics(
          accountName,
          startDate,
          endDate,
          metrics
        );
        break;
      case 'meta_ads':
        accounts = await metaAdsService.getAccounts();
        metrics = await metaAdsService.getMetrics(accountId, startDate, endDate);
        accountName = accounts.find((a) => a.id === accountId)?.name || accountId;
        formattedOutput = metaAdsService.formatMetrics(accountName, startDate, endDate, metrics);
        break;
      case 'microsoft_ads':
        accounts = await microsoftAdsService.getAccounts();
        metrics = await microsoftAdsService.getMetrics(accountId, startDate, endDate);
        accountName = accounts.find((a) => a.id === accountId)?.name || accountId;
        formattedOutput = microsoftAdsService.formatMetrics(
          accountName,
          startDate,
          endDate,
          metrics
        );
        break;
      case 'amazon_ads':
        accounts = await amazonAdsService.getAccounts();
        metrics = await amazonAdsService.getMetrics(accountId, startDate, endDate);
        accountName = accounts.find((a) => a.id === accountId)?.name || accountId;
        formattedOutput = amazonAdsService.formatMetrics(
          accountName,
          startDate,
          endDate,
          metrics
        );
        break;
    }

    res.json({
      platform,
      accountId,
      accountName,
      startDate,
      endDate,
      metrics,
      formattedOutput,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      message: 'Failed to fetch metrics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
