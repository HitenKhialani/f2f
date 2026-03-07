import api from './api';

/**
 * Blockchain API Service
 * 
 * Handles all blockchain-related API calls for batch verification,
 * anchor history, and system status.
 */

export const blockchainService = {
  /**
   * Verify batch data integrity against blockchain
   * @param {string} batchId - Batch ID to verify
   * @returns {Promise<Object>} Verification result with status and details
   */
  async verifyBatch(batchId) {
    try {
      const response = await api.get(`/batch/${batchId}/verify/`);
      return response.data;
    } catch (error) {
      console.error('Failed to verify batch:', error);
      throw error;
    }
  },

  /**
   * Get all blockchain anchors for a batch
   * @param {string} batchId - Batch ID to get anchors for
   * @returns {Promise<Object>} Anchor history with list of anchors
   */
  async getBatchAnchors(batchId) {
    try {
      const response = await api.get(`/batch/${batchId}/anchors/`);
      return response.data;
    } catch (error) {
      console.error('Failed to get batch anchors:', error);
      throw error;
    }
  },

  /**
   * Get blockchain system status
   * @returns {Promise<Object>} System status including connection and account info
   */
  async getBlockchainStatus() {
    try {
      const response = await api.get('/blockchain/status/');
      return response.data;
    } catch (error) {
      console.error('Failed to get blockchain status:', error);
      throw error;
    }
  },

  /**
   * Manually anchor a batch to blockchain
   * @param {string} batchId - Batch ID to anchor
   * @param {string} context - Optional context for anchoring
   * @returns {Promise<Object>} Anchoring result with transaction details
   */
  async anchorBatch(batchId, context = 'MANUAL_ANCHOR') {
    try {
      const response = await api.post(`/batch/${batchId}/anchor/`, {
        context
      });
      return response.data;
    } catch (error) {
      console.error('Failed to anchor batch:', error);
      throw error;
    }
  },

  /**
   * Retry failed blockchain anchoring for an event
   * @param {number} eventId - Event ID to retry
   * @returns {Promise<Object>} Retry result
   */
  async retryAnchor(eventId) {
    try {
      const response = await api.post(`/events/${eventId}/retry-anchor/`);
      return response.data;
    } catch (error) {
      console.error('Failed to retry anchor:', error);
      throw error;
    }
  },

  /**
   * Helper to format verification status for UI
   * @param {Object} verificationData - Verification response from API
   * @returns {Object} Formatted status with badge info
   */
  formatVerificationStatus(verificationData) {
    if (!verificationData) {
      return {
        status: 'unavailable',
        badgeText: 'Blockchain Verification Unavailable',
        badgeColor: 'gray',
        message: 'Unable to verify blockchain data'
      };
    }

    const { verified, success } = verificationData;

    if (verified === undefined && success === undefined) {
      return {
        status: 'pending',
        badgeText: 'Blockchain Verification Pending',
        badgeColor: 'gray',
        message: 'Batch not yet anchored to blockchain'
      };
    }

    if (verified === true) {
      return {
        status: 'verified',
        badgeText: 'Blockchain Verified',
        badgeColor: 'green',
        message: 'Data integrity confirmed - no tampering detected'
      };
    }

    if (verified === false) {
      return {
        status: 'tampered',
        badgeText: 'Data Integrity Failed',
        badgeColor: 'red',
        message: 'WARNING: Data tampering detected - hashes do not match'
      };
    }

    return {
      status: 'unknown',
      badgeText: 'Verification Unknown',
      badgeColor: 'gray',
      message: 'Unable to determine verification status'
    };
  },

  /**
   * Helper to create Polygonscan URL for transaction
   * @param {string} txHash - Transaction hash
   * @returns {string} Polygonscan URL
   */
  getPolygonscanUrl(txHash) {
    return `https://amoy.polygonscan.com/tx/${txHash}`;
  },

  /**
   * Helper to format timestamp for display
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Formatted date/time
   */
  formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';

    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid Date';
    }
  },

  /**
   * Helper to truncate transaction hash for display
   * @param {string} txHash - Full transaction hash
   * @param {number} startChars - Characters to show at start
   * @param {number} endChars - Characters to show at end
   * @returns {string} Truncated hash
   */
  truncateTxHash(txHash, startChars = 8, endChars = 6) {
    if (!txHash) return 'N/A';
    if (txHash.length <= startChars + endChars) return txHash;

    return `${txHash.slice(0, startChars)}...${txHash.slice(-endChars)}`;
  }
};
