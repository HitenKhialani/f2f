import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Loader2,
  Search,
  AlertCircle,
  Eye,
  CheckCircle,
  Ban,
  X,
  Pencil
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { retailAPI, retailerAPI, batchAPI } from '../../services/api';
import SuspendModal from '../../components/common/SuspendModal';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useLocalizedNumber } from '../../hooks/useLocalizedNumber';

const Listed = () => {
  const toast = useToast();
  const { t } = useTranslation();
  const { formatNumber, formatCurrency } = useLocalizedNumber();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state for quantity input
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [batchToSuspend, setBatchToSuspend] = useState(null);
  const [suspending, setSuspending] = useState(false);
  const [soldQuantity, setSoldQuantity] = useState('');
  const [modalError, setModalError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [editFormData, setEditFormData] = useState({
    selling_price_per_unit: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await retailAPI.list();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setListings(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate remaining quantity
  const getRemainingQuantity = (listing) => {
    // If remaining_quantity exists and is not null/undefined, use it
    if (listing.remaining_quantity != null) {
      return parseFloat(listing.remaining_quantity);
    }
    // Otherwise calculate: total - sold
    const total = parseFloat(listing.total_quantity || listing.batch_details?.quantity || 0);
    const sold = parseFloat(listing.units_sold || 0);
    return Math.max(0, total - sold);
  };

  const handleMarkSoldOut = async (listing) => {
    if (listing.batch_details?.is_locked || listing.is_locked) {
      toast.warning('Please complete all pending payments before proceeding.');
      return;
    }

    const remaining = getRemainingQuantity(listing);
    if (remaining <= 0) {
      toast.warning('No quantity available to sell');
      return;
    }

    if (!confirm(`Mark as sold out? This will sell all ${remaining} kg remaining.`)) {
      return;
    }

    try {
      const batchId = listing.batch || listing.batch_details?.id;
      await retailerAPI.markSold(batchId, remaining);
      toast.success(`Marked as sold out. Sold ${remaining} kg.`);
      fetchData();
    } catch (error) {
      console.error('Error marking batch as sold out:', error);
      toast.error(error.response?.data?.message || 'Failed to mark batch as sold out');
    }
  };

  const handleSuspendBatch = (batchId) => {
    setBatchToSuspend(batchId);
    setShowSuspendModal(true);
  };

  const confirmSuspend = async (batchId, reason) => {
    try {
      setSuspending(true);
      await batchAPI.suspend(batchId, reason);
      toast.success('Batch suspended successfully.');
      setShowSuspendModal(false);
      setBatchToSuspend(null);
      fetchData();
    } catch (error) {
      console.error('Error suspending batch:', error);
      toast.error(error.response?.data?.message || 'Failed to suspend batch');
    } finally {
      setSuspending(false);
    }
  };

  const handleEditClick = (listing) => {
    setEditingListing(listing);
    setEditFormData({
      selling_price_per_unit: listing.selling_price_per_unit || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingListing) return;
    
    try {
      setSavingEdit(true);
      const { blockchainAPI } = await import('../../services/api');
      
      const fields = {};
      if (editFormData.selling_price_per_unit !== editingListing.selling_price_per_unit) {
        fields.selling_price_per_unit = editFormData.selling_price_per_unit;
      }
      
      if (Object.keys(fields).length === 0) {
        toast.info('No changes to save');
        setShowEditModal(false);
        return;
      }
      
      await blockchainAPI.editBatch(editingListing.batch_details?.product_batch_id || editingListing.batch, fields, 'Retailer edit');
      toast.success('Listing updated successfully');
      setShowEditModal(false);
      setEditingListing(null);
      fetchData();
    } catch (error) {
      console.error('Error editing listing:', error);
      toast.error(error.response?.data?.error || 'Failed to update listing');
    } finally {
      setSavingEdit(false);
    }
  };

  // Filter active listings - exclude those already sold or out of stock
  const activeListings = listings.filter(l => {
    const remaining = getRemainingQuantity(l);
    return l.is_for_sale === true &&
      l.batch_details?.status !== 'SOLD' &&
      remaining > 0;
  });

  const filteredListings = activeListings.filter(listing => {
    const searchLower = searchTerm.toLowerCase();
    const batchId = listing.batch_details?.product_batch_id || '';
    const cropType = listing.batch_details?.crop_type || listing.crop_type || '';
    return (
      batchId.toLowerCase().includes(searchLower) ||
      cropType.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Listed Products</h1>
            <p className="text-gray-600">Active listings available for sale</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by batch ID or crop type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Listings — Card Layout (Desktop & Mobile) */}
        <div className="space-y-4">
          {filteredListings.length === 0 ? (
            <div className="bg-white dark:bg-cosmos-800 rounded-xl shadow-sm border border-dashed border-gray-200 dark:border-cosmos-700 p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-cosmos-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-cosmos-400 font-medium">
                {searchTerm ? 'No listings match your search' : 'No active listings found'}
              </p>
              <p className="text-gray-400 dark:text-cosmos-500 text-sm mt-1">
                Create a new listing to start selling
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white dark:bg-cosmos-800 rounded-2xl border border-emerald-100 dark:border-cosmos-700 shadow-sm p-5 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] text-gray-400 dark:text-cosmos-400 bg-gray-50 dark:bg-cosmos-900 px-2 py-0.5 rounded">
                      {listing.batch_details?.product_batch_id || `L-${listing.id}`}
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(listing.selling_price_per_unit || 0)}/{t('common.kg')}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                      {listing.batch_details?.crop_type || 'Unknown'}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-500 dark:text-cosmos-400">
                        {t('batch.remaining')}: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(getRemainingQuantity(listing))} {t('common.kg')}</span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-cosmos-500">
                        {t('common.total')}: {formatNumber(listing.total_quantity || listing.batch_details?.quantity || 0)} {t('common.kg')}
                      </p>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-cosmos-900 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (getRemainingQuantity(listing) / (listing.total_quantity || listing.batch_details?.quantity || 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`/trace/${listing.batch_details?.public_batch_id}`, '_blank')}
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-cosmos-700 text-gray-700 dark:text-cosmos-300 text-sm rounded-lg font-medium flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      {t('buttons.viewTrace')}
                    </button>
                    <button
                      onClick={() => handleEditClick(listing)}
                      className="px-3 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm rounded-lg font-medium hover:bg-amber-100 transition-colors flex items-center gap-1.5 border border-amber-200 dark:border-amber-800"
                      title="Edit price"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMarkSoldOut(listing)}
                      className="flex-[2] px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t('retailer.markAsSold')}
                    </button>
                    <button
                      onClick={() => handleSuspendBatch(listing.batch || listing.batch_details?.id)}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-1.5"
                      title={t('common.suspend')}
                    >
                      <Ban className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('common.suspend')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suspend Modal */}
        <SuspendModal
          isOpen={showSuspendModal}
          loading={suspending}
          batchId={batchToSuspend}
          onClose={() => {
            setShowSuspendModal(false);
            setBatchToSuspend(null);
          }}
          onConfirm={confirmSuspend}
        />

        {/* Edit Listing Modal */}
        {showEditModal && editingListing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Listing Price</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingListing(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-500">✕</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Batch ID</p>
                  <p className="font-medium text-gray-900">{editingListing.batch_details?.product_batch_id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price per Unit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.selling_price_per_unit}
                    onChange={(e) => setEditFormData({ ...editFormData, selling_price_per_unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter selling price per kg"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingListing(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Listed;
