import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Blockchain Verification Badge Component
 * 
 * Displays verification status with appropriate styling and messaging
 */
const VerificationBadge = ({ status, loading, error }) => {
  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Verifying...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
        <AlertTriangle className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Blockchain Verification Unavailable</span>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800/50',
          textColor: 'text-green-700 dark:text-green-300',
          iconColor: 'text-green-600 dark:text-green-400'
        };
      case 'pending':
        return {
          icon: Clock,
          bgColor: 'bg-gray-100 dark:bg-gray-800/20',
          borderColor: 'border-gray-200 dark:border-gray-800/50',
          textColor: 'text-gray-700 dark:text-gray-300',
          iconColor: 'text-gray-600 dark:text-gray-400'
        };
      case 'tampered':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800/50',
          textColor: 'text-red-700 dark:text-red-300',
          iconColor: 'text-red-600 dark:text-red-400'
        };
      default:
        return {
          icon: Shield,
          bgColor: 'bg-gray-100 dark:bg-gray-800/20',
          borderColor: 'border-gray-200 dark:border-gray-800/50',
          textColor: 'text-gray-700 dark:text-gray-300',
          iconColor: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${config.bgColor} ${config.borderColor}`}>
      <Icon className={`w-4 h-4 ${config.iconColor}`} />
      <span className={`text-sm font-medium ${config.textColor}`}>
        {status === 'verified' && 'Blockchain Verified'}
        {status === 'pending' && 'Blockchain Verification Pending'}
        {status === 'tampered' && 'Data Integrity Failed'}
        {status === 'unavailable' && 'Blockchain Verification Unavailable'}
        {(!status || status === 'unknown') && 'Verification Unknown'}
      </span>
    </div>
  );
};

export default VerificationBadge;
