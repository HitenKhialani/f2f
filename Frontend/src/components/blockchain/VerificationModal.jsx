import React from 'react';
import { X, Shield, AlertTriangle, CheckCircle, Clock, Hash, Database } from 'lucide-react';

/**
 * Blockchain Verification Modal Component
 * 
 * Displays detailed verification results in a modal dialog.
 * Shows either:
 * - Success message when verified
 * - Tampered fields table when integrity check fails
 * 
 * Features:
 * - Mobile responsive
 * - Clickable backdrop to close
 * - Displays current_hash and stored_hash
 * - Shows tampered fields with old/new values and modifier info
 */
const VerificationModal = ({ isOpen, onClose, verificationData }) => {
  if (!isOpen || !verificationData) return null;

  const { 
    verified, 
    tampered, 
    current_hash, 
    stored_hash, 
    tampered_fields = [],
    message,
    batch_id 
  } = verificationData;

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format hash for display (truncate middle)
  const formatHash = (hash) => {
    if (!hash || hash === 'null' || hash === 'undefined') return 'N/A';
    if (hash.length <= 20) return hash;
    return `${hash.slice(0, 10)}...${hash.slice(-10)}`;
  };

  // Format field name for display
  const formatFieldName = (field) => {
    return field
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get status configuration
  const getStatusConfig = () => {
    if (verified) {
      return {
        icon: CheckCircle,
        title: 'Blockchain Verified',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        headerBg: 'bg-green-100 dark:bg-green-900/30'
      };
    }
    if (tampered) {
      return {
        icon: AlertTriangle,
        title: 'Data Integrity Failed',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        iconColor: 'text-red-600 dark:text-red-400',
        headerBg: 'bg-red-100 dark:bg-red-900/30'
      };
    }
    return {
      icon: Clock,
      title: 'Verification Pending',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      borderColor: 'border-gray-200 dark:border-gray-700',
      iconColor: 'text-gray-600 dark:text-gray-400',
      headerBg: 'bg-gray-100 dark:bg-gray-800'
    };
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 ${config.headerBg} border-b ${config.borderColor}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <StatusIcon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {config.title}
              </h2>
              {batch_id && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Batch: {batch_id}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Tampered Fields - Show FIRST when tampered */}
          {tampered && tampered_fields.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-semibold text-red-700 dark:text-red-400">
                  Modified Fields Detected
                </h3>
              </div>
              <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800">
                <table className="w-full text-sm">
                  <thead className="bg-red-50 dark:bg-red-900/30">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-red-700 dark:text-red-300">Field</th>
                      <th className="px-4 py-3 text-left font-medium text-red-700 dark:text-red-300">Old Value</th>
                      <th className="px-4 py-3 text-left font-medium text-red-700 dark:text-red-300">New Value</th>
                      <th className="px-4 py-3 text-left font-medium text-red-700 dark:text-red-300">Modified By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100 dark:divide-red-900/30">
                    {tampered_fields.map((field, index) => (
                      <tr 
                        key={index}
                        className="bg-white dark:bg-gray-900 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {formatFieldName(field.field)}
                        </td>
                        <td className="px-4 py-3 text-red-600 dark:text-red-400 line-through">
                          {field.old_value || '-'}
                        </td>
                        <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">
                          {field.new_value || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          <div className="flex flex-col">
                            <span>{field.modified_by}</span>
                            <span className="text-xs text-gray-400">({field.modified_role})</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Tampered Fields Message */}
          {tampered && tampered_fields.length === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Data integrity failed, but no edit history is available. The data may have been modified outside the proper edit workflow.
              </p>
            </div>
          )}

          {/* Hash Information - Hide when tampered, show when verified or pending */}
          {!tampered && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Database className="w-4 h-4" />
                <span>Blockchain Hash Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Hash</span>
                  </div>
                  <code className="text-xs text-gray-700 dark:text-gray-300 break-all font-mono">
                    {formatHash(current_hash)}
                  </code>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Stored Hash (Blockchain)</span>
                  </div>
                  <code className="text-xs text-gray-700 dark:text-gray-300 break-all font-mono">
                    {formatHash(stored_hash)}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Verification Status Message */}
          <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
            <p className={`text-sm ${verified ? 'text-green-700 dark:text-green-300' : tampered ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>
              {message || (verified 
                ? 'All batch data matches the blockchain record.' 
                : tampered 
                  ? 'Data integrity check failed. The above fields have been modified since the last blockchain anchor.'
                  : 'Verification is pending. Please try again later.')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
