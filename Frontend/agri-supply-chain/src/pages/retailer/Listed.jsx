import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Loader2,
  Search,
  AlertCircle,
  Eye,
  CheckCircle,
  Ban,
  QrCode,
  X
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { retailAPI, retailerAPI, batchAPI } from '../../services/api';

const Listed = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state for quantity input
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
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

  const handleMarkSoldClick = (listing) => {
    setSelectedListing(listing);
    setSoldQuantity(listing.remaining_quantity?.toString() || '0');
    setModalError('');
    setShowQuantityModal(true);
  };

  const handleConfirmSale = async () => {
    if (!selectedListing) return;
    
    const quantity = parseFloat(soldQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      setModalError('Please enter a valid quantity greater than 0');
      return;
    }
    
    const remaining = parseFloat(selectedListing.remaining_quantity || 0);
    if (quantity > remaining) {
      setModalError(`Cannot sell more than available (${remaining} kg)`);
      return;
    }
    
    try {
      const batchId = selectedListing.batch || selectedListing.batch_details?.id;
      await retailerAPI.markSold(batchId, quantity);
      alert(`Sold ${quantity} kg successfully`);
      setShowQuantityModal(false);
      setSelectedListing(null);
      fetchData();
    } catch (error) {
      console.error('Error marking batch as sold:', error);
      setModalError(error.response?.data?.message || 'Failed to mark batch as sold');
    }
  };

  const handleSuspendBatch = async (batchId) => {
    if (!confirm('Are you sure you want to suspend this batch? This action will freeze all further operations on it.')) return;
    try {
      await batchAPI.suspend(batchId);
      alert('Batch suspended successfully.');
      fetchData();
    } catch (error) {
      console.error('Error suspending batch:', error);
      alert(error.response?.data?.message || 'Failed to suspend batch');
    }
  };

  // Filter active listings - exclude those already sold or out of stock
  const activeListings = listings.filter(l => 
    l.is_for_sale === true && 
    l.batch_details?.status !== 'SOLD' &&
    (l.remaining_quantity === undefined || l.remaining_quantity > 0)
  );

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
                      <span className="font-medium">{listing.total_quantity || listing.batch_details?.quantity || '-'} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Remaining:</span>
                      <span className="font-medium text-emerald-600">{listing.remaining_quantity || '-'} kg</span>
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

                  {/* QR Code */}
                  {listing.batch_details?.qr_code_image && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                      <QrCode className="w-5 h-5 text-gray-400" />
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${listing.batch_details.qr_code_image}`}
                        alt="QR Code"
                        className="w-16 h-16 border rounded p-1 bg-white"
                      />
                      <span className="text-xs text-gray-500">Scan to trace</span>
                    </div>
                  )}

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
                      onClick={() => handleMarkSoldClick(listing)}
                      className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Sold
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

        {/* Quantity Input Modal */}
        {showQuantityModal && selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Mark Batch as Sold</h3>
                <button
                  onClick={() => setShowQuantityModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Batch: <span className="font-medium text-gray-900">{selectedListing.batch_details?.product_batch_id}</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Crop: <span className="font-medium text-gray-900">{selectedListing.batch_details?.crop_type}</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Available: <span className="font-medium text-emerald-600">{selectedListing.remaining_quantity} kg</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Price per kg: <span className="font-medium text-gray-900">₹{selectedListing.selling_price_per_unit?.toLocaleString('en-IN') || selectedListing.total_price?.toLocaleString('en-IN')}</span>
                </p>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Sell (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedListing.remaining_quantity}
                  value={soldQuantity}
                  onChange={(e) => {
                    setSoldQuantity(e.target.value);
                    setModalError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter quantity"
                />

                {modalError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{modalError}</p>
                  </div>
                )}

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Estimated Revenue: <span className="font-semibold text-emerald-600">
                      ₹{((parseFloat(soldQuantity) || 0) * (selectedListing.selling_price_per_unit || selectedListing.total_price || 0)).toLocaleString('en-IN')}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuantityModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSale}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  Confirm Sale
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
