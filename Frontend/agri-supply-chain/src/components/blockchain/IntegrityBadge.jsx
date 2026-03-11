import React from 'react';
import { ShieldCheck, AlertTriangle, Hourglass } from 'lucide-react';

const IntegrityBadge = ({ status, consumerView = false }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'VERIFIED':
        return {
          icon: ShieldCheck,
          text: 'Blockchain Verified',
          colors: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
          tooltip: null
        };
      case 'INTEGRITY_FAILED':
        if (consumerView) {
          return {
            icon: AlertTriangle,
            text: 'Product authenticity could not be confirmed',
            colors: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
            tooltip: null
          };
        }
        return {
          icon: AlertTriangle,
          text: 'Data Integrity Failed',
          colors: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
          tooltip: 'Blockchain verification detected a mismatch in batch history.'
        };
      case 'UNVERIFIED':
      default:
        return {
          icon: Hourglass,
          text: 'Verification Pending',
          colors: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
          tooltip: null
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.colors}`}
      title={config.tooltip || undefined}
    >
      <Icon size={14} />
      <span>{config.text}</span>
    </div>
  );
};

export default IntegrityBadge;
