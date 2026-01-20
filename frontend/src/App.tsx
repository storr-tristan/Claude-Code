import React, { useState, useEffect, useCallback } from 'react';
import PlatformSelector from './components/PlatformSelector';
import AccountSelector from './components/AccountSelector';
import DateRangePicker from './components/DateRangePicker';
import MetricsDisplay from './components/MetricsDisplay';
import api from './services/api';
import type { Platform, Account, MetricsResponse } from './types';
import { TrendingUp, AlertCircle } from 'lucide-react';

function App() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [metricsResponse, setMetricsResponse] = useState<MetricsResponse | null>(null);

  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts when platform changes
  useEffect(() => {
    if (!platform) {
      setAccounts([]);
      setSelectedAccountId(null);
      return;
    }

    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      setError(null);
      try {
        const accountsData = await api.getAccounts(platform);
        setAccounts(accountsData);
        setSelectedAccountId(null);
      } catch (err) {
        setError('Failed to load accounts. Please try again.');
        console.error('Error fetching accounts:', err);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, [platform]);

  const handleDateChange = useCallback((startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  }, []);

  const handleFetchMetrics = async () => {
    if (!platform || !selectedAccountId || !dateRange.startDate || !dateRange.endDate) {
      setError('Please select platform, account, and date range.');
      return;
    }

    setLoadingMetrics(true);
    setError(null);

    try {
      const response = await api.getMetrics({
        platform,
        accountId: selectedAccountId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setMetricsResponse(response);
    } catch (err) {
      setError('Failed to fetch metrics. Please try again.');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const canFetchMetrics =
    platform && selectedAccountId && dateRange.startDate && dateRange.endDate;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-hubspot-orange" size={24} />
              <h1 className="text-2xl font-bold text-gray-900">
                Performance Metrics Dashboard
              </h1>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Fetch advertising metrics and copy them to your HubSpot notes.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form Controls */}
          <div className="space-y-4">
            <PlatformSelector
              selectedPlatform={platform}
              onPlatformChange={setPlatform}
              disabled={loadingMetrics}
            />

            <AccountSelector
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onAccountChange={setSelectedAccountId}
              loading={loadingAccounts}
              disabled={loadingMetrics || !platform}
            />

            <DateRangePicker
              onDateChange={handleDateChange}
              disabled={loadingMetrics}
            />

            <button
              onClick={handleFetchMetrics}
              disabled={!canFetchMetrics || loadingMetrics}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-hubspot-orange hover:bg-hubspot-dark-orange rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-hubspot-orange focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loadingMetrics ? 'Fetching Metrics...' : 'Fetch Metrics'}
            </button>
          </div>

          {/* Metrics Display */}
          {metricsResponse && (
            <div className="pt-4 border-t border-gray-200">
              <MetricsDisplay formattedOutput={metricsResponse.formattedOutput} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Using mock data. Connect to live APIs for production use.
        </div>
      </div>
    </div>
  );
}

export default App;
