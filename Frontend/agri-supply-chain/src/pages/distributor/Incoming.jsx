import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Loader2,
  MapPin,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Store
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { batchAPI, transportAPI, distributorAPI } from '../../services/api';

const Incoming = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [transportRequests, setTransportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [storeMargin, setStoreMargin] = useState('0.00');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [batchesRes, transportRes] = await Promise.all([
        batchAPI.list(),
        transportAPI.list(),
      ]);
      setBatches(batchesRes.data);
      setTransportRequests(transportRes.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load incoming batches');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmArrival = async (requestId) => {
    try {
      await transportAPI.confirmArrivalRequest(requestId);
      alert('Arrival confirmed. The transporter can now mark the delivery as complete.');
      fetchData();
    } catch (error) {
      console.error('Error confirming arrival:', error);
      alert(error.response?.data?.message || 'Failed to confirm arrival');
    }
  };

  const handleStoreBatch = async () => {
    try {
      const distributorMargin = parseFloat(storeMargin);
      if (isNaN(distributorMargin)) {
        alert('Please enter a valid numeric margin');
        return;
      }
      await distributorAPI.storeBatch(selectedBatch.id, { distributor_margin_per_unit: distributorMargin });
      alert('Batch stored successfully');
      setShowStoreModal(false);
      setSelectedBatch(null);
      setStoreMargin('0.00');
      fetchData();
    } catch (error) {
      console.error('Error storing batch:', error);
      alert(error.response?.data?.message || 'Failed to store batch');
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

  // Filter incoming items
  const incomingItems = [
    // Transport requests incoming to distributor (not yet delivered)
    ...transportRequests.filter(tr =>
      tr.to_party_details?.role === 'distributor' &&
      !['DELIVERED', 'REJECTED', 'PENDING'].includes(tr.status)
    ),
    // Batches already delivered but not yet stored
    ...batches.filter(b => b.status === 'DELIVERED_TO_DISTRIBUTOR')
  ];

  const filteredItems = incomingItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const batchId = item.batch_details?.product_batch_id || item.product_batch_id || '';
    const cropType = item.batch_details?.crop_type || item.crop_type || '';
    return (
      batchId.toLowerCase().includes(searchLower) ||
      cropType.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'ARRIVED_AT_DISTRIBUTOR': 'bg-indigo-100 text-indigo-700',
      'ARRIVAL_CONFIRMED_BY_DISTRIBUTOR': 'bg-purple-100 text-purple-700',
      'DELIVERED_TO_DISTRIBUTOR': 'bg-green-100 text-green-700',
      'IN_TRANSIT_TO_DISTRIBUTOR': 'bg-amber-100 text-amber-700',
      'ARRIVED': 'bg-indigo-100 text-indigo-700',
      'ARRIVAL_CONFIRMED': 'bg-purple-100 text-purple-700',
    };
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {status?.replace(/_/g, ' ')}
      </span>
    );
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Incoming Batches</h1>
            <p className="text-gray-600">Manage batches arriving at your facility</p>
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

        {/* Incoming Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Crop Type</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <Package className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">
                          {searchTerm ? 'No batches match your search' : 'No incoming batches found'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {item.batch_details?.product_batch_id || item.product_batch_id || `TR-${item.id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                        {item.batch_details?.crop_type || item.crop_type || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.quantity || item.batch_details?.quantity || '-'} kg
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{item.from_party_details?.organization || item.from_party_details?.user_details?.username || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {(item.status === 'ARRIVED_AT_DISTRIBUTOR' || item.status === 'ARRIVED') && (
                            <button
                              onClick={() => handleConfirmArrival(item.id)}
                              className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                            >
                              Confirm Arrival
                            </button>
                          )}
                          {item.status === 'DELIVERED_TO_DISTRIBUTOR' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedBatch(item);
                                  setShowStoreModal(true);
                                }}
                                className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
                              >
                                <Store className="w-3 h-3 inline mr-1" />
                                Store
                              </button>
                              <button
                                onClick={() => handleSuspendBatch(item.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                Suspend
                              </button>
                            </>
                          )}
                          {(item.status === 'ARRIVED' || item.status === 'ARRIVAL_CONFIRMED' || item.status?.includes('IN_TRANSIT')) && (
                            <span className="text-xs text-gray-500 italic">Tracking Transport</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Store Batch Modal */}
        {showStoreModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Store Batch: {selectedBatch?.product_batch_id}</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Margin per Unit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={storeMargin}
                    onChange={(e) => setStoreMargin(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                  This margin will be added to the final retail price.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowStoreModal(false);
                    setSelectedBatch(null);
                    setStoreMargin('0.00');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStoreBatch}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Store Batch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Incoming;
