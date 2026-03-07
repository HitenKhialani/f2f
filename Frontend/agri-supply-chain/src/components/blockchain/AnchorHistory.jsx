import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * Anchor History Component
 * 
 * Collapsible section showing all blockchain anchors for a batch
 */
const AnchorHistory = ({ anchors, loading, error }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Blockchain Anchor History</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium mt-4">Loading anchor history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Blockchain Anchor History</h3>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/50">
          <p className="text-red-700 dark:text-red-300 font-medium">Unable to load anchor history</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const hasAnchors = anchors && anchors.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Blockchain Anchor History</h3>
        </div>
        {hasAnchors && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
          >
            <span>{anchors.length} Anchor{anchors.length !== 1 ? 's' : ''}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Content */}
      {hasAnchors ? (
        <div className={`space-y-3 transition-all duration-300 ${isExpanded ? 'opacity-100 max-h-96 overflow-y-auto' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          {anchors.map((anchor, index) => (
            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700">
              {/* Anchor Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Anchor #{anchor.index + 1}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(anchor.anchored_at * 1000).toLocaleDateString('en-US')}
                </span>
              </div>

              {/* Anchor Details */}
              <div className="grid md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Context</p>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {anchor.context || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Timestamp</p>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {new Date(anchor.anchored_at * 1000).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Anchored By</p>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {anchor.anchored_by 
                      ? `${anchor.anchored_by.slice(0, 6)}...${anchor.anchored_by.slice(-4)}`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {/* Transaction Hash */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction Hash</p>
                  {anchor.transaction_hash && (
                    <a
                      href={`https://amoy.polygonscan.com/tx/${anchor.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                        {`${anchor.transaction_hash.slice(0, 10)}...${anchor.transaction_hash.slice(-8)}`}
                      </code>
                      <ExternalLink className="w-3 h-3" />
                      <span className="text-xs">View on Polygonscan</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            No blockchain anchors found for this batch
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Anchors will be created when critical batch events occur
          </p>
        </div>
      )}
    </div>
  );
};

export default AnchorHistory;
