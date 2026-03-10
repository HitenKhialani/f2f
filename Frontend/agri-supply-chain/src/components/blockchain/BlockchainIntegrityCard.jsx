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

  const hasResults = verificationData?.verification_results && verificationData.verification_results.length > 0;
  const isVerified = verificationData?.status === 'VERIFIED';
  const isFailed = verificationData?.status === 'INTEGRITY_FAILED';
  const isNotAnchored = verificationData?.status === 'NOT_ANCHORED';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className={`w-5 h-5 ${isVerified ? 'text-emerald-500' : isFailed ? 'text-red-500' : 'text-slate-400'}`} />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Blockchain Integrity</h3>
        {isVerified && (
          <div className="ml-auto">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
        )}
        {isFailed && (
          <div className="ml-auto">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>

      {hasResults ? (
        <div className="space-y-6">
          {/* Main Status Badge */}
          <div className={`flex items-center justify-between p-4 rounded-xl border ${isVerified ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50' :
              isFailed ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/50' :
                'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700'
            }`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isVerified ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-slate-400'}`}></div>
              <span className="font-bold text-slate-900 dark:text-white">
                {isVerified ? 'VERIFIED' : isFailed ? 'INTEGRITY FAILED' : 'NOT ANCHORED'}
              </span>
            </div>
            <span className={`text-sm font-medium ${isVerified ? 'text-emerald-600 dark:text-emerald-400' : isFailed ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>
              {isVerified ? 'All event hashes match blockchain' : isFailed ? 'Data mismatch detected' : 'No records found'}
            </span>
          </div>

          {/* Verification Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Verification Timeline</h4>
            <div className="space-y-2">
              {verificationData.verification_results.map((result, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${result.verified ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">
                      {result.event_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${result.verified ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {result.verified ? '✔ MATCH' : '❌ MISMATCH'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last Anchored Info */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Last Anchored Event</span>
              <span className="text-slate-900 dark:text-white font-bold">
                {verificationData.batch_status?.last_anchored_at
                  ? new Date(verificationData.batch_status.last_anchored_at).toLocaleString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-6 border border-slate-100 dark:border-slate-700 text-center">
          <Shield className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h4 className="font-bold text-slate-900 dark:text-white mb-1">
            {isNotAnchored ? 'No Blockchain Record' : 'Verification Unknown'}
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isNotAnchored
              ? 'This batch has not yet reached a critical lifecycle event that requires blockchain anchoring.'
              : 'Unable to determine the blockchain integrity status for this batch.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BlockchainIntegrityCard;
