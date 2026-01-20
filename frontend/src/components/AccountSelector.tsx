import React from 'react';
import type { Account } from '../types';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onAccountChange: (accountId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccountId,
  onAccountChange,
  loading = false,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Account
      </label>
      <select
        value={selectedAccountId || ''}
        onChange={(e) => onAccountChange(e.target.value)}
        disabled={disabled || loading || accounts.length === 0}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hubspot-orange focus:border-hubspot-orange disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">
          {loading ? 'Loading accounts...' : 'Select an account...'}
        </option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AccountSelector;
