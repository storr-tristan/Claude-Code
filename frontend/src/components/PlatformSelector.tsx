import React from 'react';
import type { Platform } from '../types';
import { getPlatformLabel } from '../utils/formatters';

interface PlatformSelectorProps {
  selectedPlatform: Platform | null;
  onPlatformChange: (platform: Platform) => void;
  disabled?: boolean;
}

const platforms: Platform[] = ['google_ads', 'meta_ads', 'microsoft_ads', 'amazon_ads'];

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatform,
  onPlatformChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Platform
      </label>
      <select
        value={selectedPlatform || ''}
        onChange={(e) => onPlatformChange(e.target.value as Platform)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hubspot-orange focus:border-hubspot-orange disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Select a platform...</option>
        {platforms.map((platform) => (
          <option key={platform} value={platform}>
            {getPlatformLabel(platform)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PlatformSelector;
