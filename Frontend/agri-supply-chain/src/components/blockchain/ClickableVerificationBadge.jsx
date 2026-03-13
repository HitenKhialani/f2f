import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { blockchainAPI } from '../../services/api';
import VerificationModal from './VerificationModal';

/**
 * Clickable Verification Badge Component
 * 
 * Displays verification status with appropriate styling.
 * When clicked, opens a modal showing detailed verification results
 * including hash comparison and tampered fields if integrity failed.
 */
const ClickableVerificationBadge = ({ batchId, status: initialStatus, size = 'md' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    if (!batchId) return;
    
    setIsModalOpen(true);
    setLoading(true);
    setError(null);

    try {
      const response = await blockchainAPI.verifyBatch(batchId);
      if (response.data?.success) {
        setVerificationData(response.data);
      } else {
        setError(response.data?.message || 'Failed to verify batch');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to fetch verification data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setVerificationData(null);
    setError(null);
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'px-2 py-1',
      iconSize: 'w-3 h-3',
      textSize: 'text-xs',
      gap: 'gap-1'
    },
    md: {
      padding: 'px-3 py-1.5',
      iconSize: 'w-4 h-4',
      textSize: 'text-sm',
      gap: 'gap-1.5'
    },
    lg: {
      padding: 'px-4 py-2',
      iconSize: 'w-5 h-5',
      textSize: 'text-base',
      gap: 'gap-2'
    }
  };

  const s = sizeConfig[size] || sizeConfig.md;

  const getStatusConfig = (status) => {
    const normalizedStatus = status?.toUpperCase?.() || status;
    
    switch (normalizedStatus) {
      case 'VERIFIED':
      case 'verified':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-300 dark:border-green-700',
          textColor: 'text-green-800 dark:text-green-300',
          iconColor: 'text-green-600 dark:text-green-400',
          label: 'Blockchain Verified',
          cursor: 'cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50'
        };
      case 'INTEGRITY_FAILED':
      case 'tampered':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          borderColor: 'border-red-300 dark:border-red-700',
          textColor: 'text-red-800 dark:text-red-300',
          iconColor: 'text-red-600 dark:text-red-400',
          label: 'Data Integrity Failed',
          cursor: 'cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/50'
        };
      case 'NOT_ANCHORED':
      case 'UNVERIFIED':
      case 'pending':
      default:
        return {
          icon: Clock,
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-300 dark:border-gray-700',
          textColor: 'text-gray-700 dark:text-gray-300',
          iconColor: 'text-gray-500 dark:text-gray-400',
          label: 'Verification Pending',
          cursor: 'cursor-default'
        };
    }
  };

  const config = getStatusConfig(initialStatus);
  const Icon = loading ? Loader2 : config.icon;

  // Prepare data for modal
  const modalData = verificationData ? {
    ...verificationData,
    verified: verificationData.verified ?? (initialStatus === 'VERIFIED' || initialStatus === 'verified'),
    tampered: verificationData.tampered ?? (initialStatus === 'INTEGRITY_FAILED' || initialStatus === 'tampered'),
    tampered_fields: verificationData.tampered_fields || [],
    current_hash: verificationData.current_hash || null,
    stored_hash: verificationData.stored_hash || null,
    message: verificationData.message || (verificationData.tampered ? 'Data integrity check failed. Tampering detected.' : 'Blockchain verification complete.'),
    batch_id: batchId
  } : {
    verified: initialStatus === 'VERIFIED' || initialStatus === 'verified',
    tampered: initialStatus === 'INTEGRITY_FAILED' || initialStatus === 'tampered',
    current_hash: null,
    stored_hash: null,
    tampered_fields: [],
    message: loading ? 'Verifying...' : error || 'Click to verify blockchain status',
    batch_id: batchId
  };

  // If there's an error in the API response, show it in the modal
  if (error && !loading) {
    modalData.message = error;
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          inline-flex items-center ${s.gap} ${s.padding} 
          rounded-full border ${config.bgColor} ${config.borderColor} ${config.cursor}
          transition-all duration-200 disabled:opacity-50
          focus:outline-none focus:ring-2 focus:ring-offset-1 
          ${initialStatus === 'VERIFIED' ? 'focus:ring-green-500' : 
            initialStatus === 'INTEGRITY_FAILED' ? 'focus:ring-red-500' : 'focus:ring-gray-500'}
        `}
        title="Click to view blockchain verification details"
      >
        <Icon className={`${s.iconSize} ${config.iconColor} ${loading ? 'animate-spin' : ''}`} />
        <span className={`${s.textSize} font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </button>

      <VerificationModal
        isOpen={isModalOpen}
        onClose={handleClose}
        verificationData={modalData}
      />
    </>
  );
};

export default ClickableVerificationBadge;
