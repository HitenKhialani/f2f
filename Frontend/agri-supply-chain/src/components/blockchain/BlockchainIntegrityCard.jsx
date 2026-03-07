import React from 'react';
import { Shield, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Blockchain Integrity Card Component
 * 
 * Displays blockchain verification details including transaction info
 */
const BlockchainIntegrityCard = ({ verificationData, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Blockchain Integrity</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium mt-4">Verifying blockchain integrity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Blockchain Integrity</h3>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/50">
          <p className="text-red-700 dark:text-red-300 font-medium">Blockchain verification unavailable</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">Unable to verify data integrity at this time.</p>
        </div>
      </div>
    );
  }

  const hasAnchor = verificationData?.stored_hash && verificationData?.blockchain_record;
  const isVerified = verificationData?.verified === true;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className={`w-5 h-5 ${isVerified ? 'text-emerald-500' : 'text-slate-400'}`} />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Blockchain Integrity</h3>
        {isVerified && (
          <div className="ml-auto">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
        )}
      </div>

      {hasAnchor ? (
        <div className="space-y-4">
          {/* Verification Status */}
          <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <span className="font-medium text-slate-900 dark:text-white">
                {isVerified ? 'Verified' : 'Tampered'}
              </span>
            </div>
            <span className={`text-sm ${isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {verificationData.message}
            </span>
          </div>

          {/* Blockchain Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Block Number</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {verificationData.blockchain_record?.block_number || 'N/A'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Anchored Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {isVerified ? 'Data Integrity Confirmed' : 'Integrity Check Failed'}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Transaction Hash</p>
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                {verificationData.blockchain_record?.transaction_hash 
                  ? `${verificationData.blockchain_record.transaction_hash.slice(0, 10)}...${verificationData.blockchain_record.transaction_hash.slice(-8)}`
                  : 'N/A'
                }
              </code>
              {verificationData.blockchain_record?.transaction_hash && (
                <a
                  href={`https://amoy.polygonscan.com/tx/${verificationData.blockchain_record.transaction_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <span className="text-xs">View on Polygonscan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Anchored Timestamp */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Anchored Timestamp</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {verificationData.blockchain_record?.anchored_at
                ? new Date(verificationData.blockchain_record.anchored_at * 1000).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'N/A'
              }
            </p>
          </div>

          {/* Hash Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Current Hash</p>
              <code className="text-xs font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 break-all">
                {verificationData.current_hash ? `${verificationData.current_hash.slice(0, 16)}...` : 'N/A'}
              </code>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Stored Hash</p>
              <code className="text-xs font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 break-all">
                {verificationData.stored_hash ? `${verificationData.stored_hash.slice(0, 16)}...` : 'N/A'}
              </code>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-slate-400" />
            <h4 className="font-medium text-slate-900 dark:text-white">No Blockchain Record</h4>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            This batch has not yet been anchored to the blockchain. Blockchain verification will be available once critical events are processed.
          </p>
        </div>
      )}
    </div>
  );
};

export default BlockchainIntegrityCard;
