import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

interface MetricsDisplayProps {
  formattedOutput: string;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ formattedOutput }) => {
  const [editableContent, setEditableContent] = useState(formattedOutput);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditableContent(formattedOutput);
  }, [formattedOutput]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Metrics Output
        </label>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-hubspot-orange hover:bg-hubspot-dark-orange rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-hubspot-orange focus:ring-offset-2"
        >
          {copied ? (
            <>
              <Check size={16} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy
            </>
          )}
        </button>
      </div>

      <textarea
        value={editableContent}
        onChange={(e) => setEditableContent(e.target.value)}
        rows={12}
        className="w-full px-3 py-2 font-mono text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hubspot-orange focus:border-hubspot-orange resize-none"
        placeholder="Metrics will appear here..."
      />

      <p className="text-xs text-gray-500">
        Edit the output as needed before copying to your notes.
      </p>
    </div>
  );
};

export default MetricsDisplay;
