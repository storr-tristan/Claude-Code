import React, { useState, useEffect } from 'react';
import { subDays } from 'date-fns';
import { formatDate } from '../utils/formatters';
import type { DateRange } from '../types';

interface DateRangePickerProps {
  onDateChange: (startDate: string, endDate: string) => void;
  disabled?: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onDateChange,
  disabled = false,
}) => {
  const [rangeType, setRangeType] = useState<DateRange>('7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date();
    let start: Date;
    let end: Date = today;

    if (rangeType === 'custom') {
      // Don't auto-calculate for custom
      return;
    }

    const days = parseInt(rangeType);
    start = subDays(today, days);

    const formattedStart = formatDate(start);
    const formattedEnd = formatDate(end);

    setStartDate(formattedStart);
    setEndDate(formattedEnd);
    onDateChange(formattedStart, formattedEnd);
  }, [rangeType, onDateChange]);

  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      onDateChange(startDate, endDate);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Date Range
      </label>

      <select
        value={rangeType}
        onChange={(e) => setRangeType(e.target.value as DateRange)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hubspot-orange focus:border-hubspot-orange disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="7">Last 7 days</option>
        <option value="14">Last 14 days</option>
        <option value="30">Last 30 days</option>
        <option value="custom">Custom range</option>
      </select>

      {rangeType === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={handleCustomDateChange}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hubspot-orange focus:border-hubspot-orange disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={handleCustomDateChange}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hubspot-orange focus:border-hubspot-orange disabled:bg-gray-100"
            />
          </div>
        </div>
      )}

      {rangeType !== 'custom' && (
        <div className="text-xs text-gray-500">
          {startDate} to {endDate}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
