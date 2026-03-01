import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Loader2,
  Search,
  AlertCircle,
  Eye,
  CheckCircle,
  Ban,
  X
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { retailAPI, retailerAPI, batchAPI } from '../../services/api';
import SuspendModal from '../../components/common/SuspendModal';
import { useToast } from '../../context/ToastContext';

const Listed = () => {
  const toast = useToast();
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

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {searchTerm ? 'No listings match your search' : 'No active listings found'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Create a new listing to start selling
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mb-2">
                        LISTED FOR SALE
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {listing.batch_details?.crop_type || 'Unknown Crop'}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">
                        {listing.batch_details?.product_batch_id || `LISTING-${listing.id}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        ₹{listing.total_price?.toLocaleString('en-IN') || 0}
                      </p>
                      <p className="text-xs text-gray-500">Total Price</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Quantity:</span>
                      <span className="font-medium">{listing.total_quantity || listing.batch_details?.quantity || 0} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Remaining:</span>
                      <span className="font-medium text-emerald-600">
                        {getRemainingQuantity(listing)} kg
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Units Sold:</span>
                      <span className="font-medium text-blue-600">{listing.units_sold || 0} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price per kg:</span>
                      <span className="font-medium">₹{listing.selling_price_per_unit?.toLocaleString('en-IN') || listing.total_price?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Farmer Price:</span>
                        <span className="font-medium">₹{listing.farmer_base_price || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Transport:</span>
                        <span className="font-medium">₹{listing.transport_fees || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Distributor Margin:</span>
                        <span className="font-medium">₹{listing.distributor_margin || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Retailer Margin:</span>
                        <span className="font-medium">₹{listing.retailer_margin || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`/trace/${listing.batch_details?.public_batch_id}`, '_blank')}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View Trace
                    </button>
                    <button
                      onClick={() => handleMarkSoldOut(listing)}
                      className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Sold Out
                    </button>
                    <button
                      onClick={() => handleSuspendBatch(listing.batch || listing.batch_details?.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                      title="Suspend Batch"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
      </div>
    </MainLayout>
  );
};

export default Listed;
