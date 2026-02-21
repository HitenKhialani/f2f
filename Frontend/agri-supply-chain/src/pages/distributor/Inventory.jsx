import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Loader2,
  Search,
  AlertCircle,
  Truck,
  Scissors,
  Eye,
  X,
  Plus,
  Archive
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { batchAPI, stakeholderAPI, distributorAPI, batchSplitAPI } from '../../services/api';

const Inventory = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [splitData, setSplitData] = useState({
    splits: [{ label: '', quantity: '' }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [batchesRes, retailersRes] = await Promise.all([
        batchAPI.list(),
        stakeholderAPI.listProfiles({ role: 'retailer', kyc_status: 'approved' }),
      ]);
      setBatches(batchesRes.data);
      setRetailers(retailersRes.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTransport = async () => {
    if (!selectedBatch || !selectedRetailer) {
      alert('Please select a retailer');
      return;
    }

    try {
      await distributorAPI.requestTransportToRetailer({
        batch_id: selectedBatch.id,
        retailer_id: selectedRetailer,
      });
      alert('Transport request sent successfully');
      setShowTransportModal(false);
      setSelectedBatch(null);
      setSelectedRetailer('');
      fetchData();
    } catch (error) {
      console.error('Error requesting transport:', error);
      alert(error.response?.data?.message || 'Failed to request transport');
    }
  };

  const handleSplitBatch = (batch) => {
    setSelectedBatch(batch);
    setShowSplitModal(true);
    setSplitData({ splits: [{ label: '', quantity: '' }] });
  };

  const handleAddSplit = () => {
    setSplitData({
      splits: [...splitData.splits, { label: '', quantity: '' }]
    });
  };

  const handleSplitChange = (index, field, value) => {
    const newSplits = [...splitData.splits];
    newSplits[index][field] = value;
    setSplitData({ splits: newSplits });
  };

  const handleRemoveSplit = (index) => {
    if (splitData.splits.length > 1) {
      const newSplits = splitData.splits.filter((_, i) => i !== index);
      setSplitData({ splits: newSplits });
    }
  };

  const handleSubmitSplit = async () => {
    const totalQuantity = splitData.splits.reduce((sum, split) => sum + (parseFloat(split.quantity) || 0), 0);
    const parentQuantity = parseFloat(selectedBatch.quantity);

    if (Math.abs(totalQuantity - parentQuantity) > 0.001) {
      alert(`Total split quantity (${totalQuantity} kg) must exactly match parent batch quantity (${parentQuantity} kg)`);
      return;
    }

    for (let i = 0; i < splitData.splits.length; i++) {
      const split = splitData.splits[i];
      if (!split.label || !split.quantity) {
        alert(`Please fill all fields for split ${i + 1}`);
        return;
      }
    }

    try {
      await batchAPI.bulkSplit(selectedBatch.id, {
        splits: splitData.splits.map(s => ({
          label: s.label,
          quantity: parseFloat(s.quantity),
          notes: `Split from ${selectedBatch.product_batch_id}`
        }))
      });

      alert(`Batch ${selectedBatch.product_batch_id} split into ${splitData.splits.length} child batches successfully!`);
      setShowSplitModal(false);
      setSelectedBatch(null);
      fetchData();
    } catch (error) {
      console.error('Error splitting batch:', error);
      alert(error.response?.data?.message || 'Failed to split batch');
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

  // Filter inventory batches
  const inventoryBatches = batches.filter(b => 
    b.status === 'STORED' || b.status === 'FULLY_SPLIT'
  ).sort((a, b) => {
    if (a.id === b.parent_batch) return -1;
    if (b.id === a.parent_batch) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const filteredBatches = inventoryBatches.filter(batch => {
    const searchLower = searchTerm.toLowerCase();
    return (
      batch.product_batch_id?.toLowerCase().includes(searchLower) ||
      batch.crop_type?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'STORED': 'bg-emerald-100 text-emerald-700',
      'FULLY_SPLIT': 'bg-purple-100 text-purple-700',
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
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <p className="text-gray-600">Manage stored batches and request transport to retailers</p>
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

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Crop Type</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <Archive className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">
                          {searchTerm ? 'No batches match your search' : 'No inventory found'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((batch) => (
                    <tr key={batch.id} className={`hover:bg-gray-50 transition-colors ${batch.is_child_batch ? 'bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        <div className="flex items-center">
                          {batch.is_child_batch && <span className="text-gray-400 mr-2">└─</span>}
                          {batch.product_batch_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                        {batch.crop_type || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {batch.quantity} kg
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(batch.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {batch.status === 'STORED' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedBatch(batch);
                                  setShowTransportModal(true);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                <Truck className="w-3 h-3 inline mr-1" />
                                Request Transport
                              </button>
                              <button
                                onClick={() => handleSplitBatch(batch)}
                                className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
                              >
                                <Scissors className="w-3 h-3 inline mr-1" />
                                Split
                              </button>
                              <button
                                onClick={() => navigate(`/distributor/inspection/${batch.id}`)}
                                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                              >
                                <Eye className="w-3 h-3 inline mr-1" />
                                Inspect
                              </button>
                              <button
                                onClick={() => handleSuspendBatch(batch.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                Suspend
                              </button>
                            </>
                          )}
                          {batch.status === 'FULLY_SPLIT' && (
                            <span className="text-gray-400 italic text-xs">Parent batch (inactive)</span>
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

        {/* Transport Modal */}
        {showTransportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Request Transport to Retailer</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Retailer
                </label>
                <select
                  value={selectedRetailer}
                  onChange={(e) => setSelectedRetailer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Choose a retailer...</option>
                  {retailers.map((retailer) => (
                    <option key={retailer.id} value={retailer.id}>
                      {retailer.user_details?.username || retailer.organization || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTransportModal(false);
                    setSelectedBatch(null);
                    setSelectedRetailer('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestTransport}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Split Batch Modal */}
        {showSplitModal && selectedBatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Split Batch: {selectedBatch.product_batch_id}</h3>
                  <button
                    onClick={() => setShowSplitModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Parent Batch:</strong> {selectedBatch.crop_type} - {selectedBatch.quantity} kg
                  </p>
                  <div className="flex justify-between mt-2 pt-2 border-t border-blue-100">
                    <p className="text-sm font-semibold text-blue-900">
                      Remaining: {(parseFloat(selectedBatch.quantity) - splitData.splits.reduce((sum, s) => sum + (parseFloat(s.quantity) || 0), 0)).toFixed(2)} kg
                    </p>
                    <p className="text-sm font-semibold text-blue-900">
                      Total: {splitData.splits.reduce((sum, s) => sum + (parseFloat(s.quantity) || 0), 0).toFixed(2)} / {selectedBatch.quantity} kg
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {splitData.splits.map((split, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Child Batch {index + 1}</h4>
                        {splitData.splits.length > 1 && (
                          <button
                            onClick={() => handleRemoveSplit(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Label *
                          </label>
                          <input
                            type="text"
                            value={split.label}
                            onChange={(e) => handleSplitChange(index, 'label', e.target.value)}
                            placeholder="e.g., Split A"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity (kg) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={split.quantity}
                            onChange={(e) => handleSplitChange(index, 'quantity', e.target.value)}
                            placeholder="e.g., 200"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleAddSplit}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Another Split
                  </button>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowSplitModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitSplit}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Split Batch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Inventory;
