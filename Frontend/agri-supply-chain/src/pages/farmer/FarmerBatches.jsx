import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Plus,
  Search,
  Eye,
  AlertCircle,
  Loader2,
  ClipboardCheck
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { batchAPI, transportAPI, stakeholderAPI, dashboardAPI } from '../../services/api';
import { InspectionForm, InspectionTimeline } from '../../components/inspection';

const FarmerBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showInspectionTimeline, setShowInspectionTimeline] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [batchInspections, setBatchInspections] = useState({});
  const [formData, setFormData] = useState({
    crop_type: '',
    quantity: '',
    harvest_date: '',
    farm_location: '',
    farmer_base_price_per_unit: '',
  });

  useEffect(() => {
    fetchBatches();
    fetchDistributors();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try dashboard API first
      try {
        const response = await dashboardAPI.getFarmerDashboard();
        const data = response.data.data;
        if (data && data.recent_batches) {
          setBatches(data.recent_batches);
          // Fetch inspections for each batch
          data.recent_batches.forEach(batch => fetchBatchInspections(batch.id));
        } else {
          throw new Error('No batches data');
        }
      } catch (dashboardErr) {
        // Fallback to batch list API
        const response = await batchAPI.list();
        const originalBatches = (response.data || []).filter(batch => !batch.is_child_batch);
        setBatches(originalBatches);
        // Fetch inspections for each batch
        originalBatches.forEach(batch => fetchBatchInspections(batch.id));
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setError(error.response?.data?.message || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchInspections = async (batchId) => {
    try {
      const { inspectionAPI } = await import('../../services/api');
      const response = await inspectionAPI.getBatchTimeline(batchId);
      setBatchInspections(prev => ({
        ...prev,
        [batchId]: response.data
      }));
    } catch (err) {
      // Silently fail - inspections are optional
      console.log(`No inspections for batch ${batchId}`);
    }
  };

  const hasFarmerInspection = (batchId) => {
    const inspections = batchInspections[batchId] || [];
    return inspections.some(i => i.stage === 'farmer');
  };

  const fetchDistributors = async () => {
    try {
      const response = await stakeholderAPI.listProfiles();
      const distributorList = response.data.filter(profile => profile.role === 'distributor');
      setDistributors(distributorList);
    } catch (error) {
      console.error('Error fetching distributors:', error);
    }
  };

  const handleRequestTransport = async () => {
    if (!selectedDistributor) {
      alert('Please select a distributor');
      return;
    }

    try {
      await transportAPI.createRequest({
        batch_id: selectedBatch.id,
        distributor_id: selectedDistributor
      });
      setShowTransportModal(false);
      setSelectedBatch(null);
      setSelectedDistributor('');
      fetchBatches();
      alert('Transport request created successfully!');
    } catch (error) {
      console.error('Error creating transport request:', error);
      alert(error.response?.data?.message || 'Failed to create transport request');
    }
  };

  const handleSuspendBatch = async (batchId) => {
    if (!confirm('Are you sure you want to suspend this batch? This action will freeze all further operations on it.')) return;
    try {
      await batchAPI.suspend(batchId);
      alert('Batch suspended successfully.');
      fetchBatches();
    } catch (error) {
      console.error('Error suspending batch:', error);
      alert(error.response?.data?.message || 'Failed to suspend batch');
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        crop_type: formData.crop_type,
        quantity: formData.quantity,
        harvest_date: formData.harvest_date,
        farm_location: formData.farm_location,
        farmer_base_price_per_unit: formData.farmer_base_price_per_unit
      };

      await batchAPI.create(payload);
      setShowCreateForm(false);
      setFormData({
        crop_type: '',
        quantity: '',
        harvest_date: '',
        farm_location: '',
        farmer_base_price_per_unit: '',
      });
      fetchBatches();
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Error creating batch. Please try again.');
    }
  };

  const filteredBatches = batches.filter(batch => {
    const searchLower = searchTerm.toLowerCase();
    return (
      batch.crop_type?.toLowerCase().includes(searchLower) ||
      batch.product_batch_id?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (batchStatus) => {
    const statusColors = {
      CREATED: 'bg-emerald-100 text-emerald-700',
      TRANSPORT_REQUESTED: 'bg-yellow-100 text-yellow-700',
      TRANSPORT_REJECTED: 'bg-orange-100 text-orange-700',
      IN_TRANSIT_TO_DISTRIBUTOR: 'bg-blue-100 text-blue-700',
      ARRIVED_AT_DISTRIBUTOR: 'bg-indigo-100 text-indigo-700',
      ARRIVAL_CONFIRMED_BY_DISTRIBUTOR: 'bg-violet-100 text-violet-700',
      DELIVERED_TO_DISTRIBUTOR: 'bg-green-100 text-green-700',
      STORED: 'bg-gray-100 text-gray-700',
      TRANSPORT_REQUESTED_TO_RETAILER: 'bg-yellow-100 text-yellow-700',
      IN_TRANSIT_TO_RETAILER: 'bg-blue-100 text-blue-700',
      ARRIVED_AT_RETAILER: 'bg-indigo-100 text-indigo-700',
      ARRIVAL_CONFIRMED_BY_RETAILER: 'bg-violet-100 text-violet-700',
      DELIVERED_TO_RETAILER: 'bg-green-100 text-green-700',
      LISTED: 'bg-cyan-100 text-cyan-700',
      SOLD: 'bg-emerald-100 text-emerald-700',
      SUSPENDED: 'bg-red-100 text-red-700',
      FULLY_SPLIT: 'bg-purple-100 text-purple-700',
    };
    const colorClass = statusColors[batchStatus] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {batchStatus?.replace(/_/g, ' ') || 'CREATED'}
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
            <h1 className="text-2xl font-bold text-gray-900">My Batches</h1>
            <p className="text-gray-600">Manage and track all your crop batches</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Batch
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search batches by crop type or batch ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Batches Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Crop Type</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Harvest Date</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <Sprout className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">
                          {searchTerm ? 'No batches match your search' : 'No batches found'}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={() => setShowCreateForm(true)}
                            className="mt-4 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                          >
                            Create Your First Batch
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{batch.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                        {batch.crop_type || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {batch.quantity} kg
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {batch.harvest_date ? new Date(batch.harvest_date).toLocaleDateString('hi-IN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {batch.farm_location || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(batch.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {batch.status === 'SUSPENDED' && (
                            <span className="text-xs text-red-600 font-medium">Suspended</span>
                          )}
                          {/* Inspection button for farmer stage */}
                          {batch.status === 'CREATED' && !hasFarmerInspection(batch.id) && (
                            <button
                              onClick={() => {
                                setSelectedBatch(batch);
                                setShowInspectionModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1"
                              title="Inspect Batch"
                            >
                              <ClipboardCheck className="w-3 h-3" />
                              Inspect
                            </button>
                          )}
                          {batch.status === 'CREATED' && hasFarmerInspection(batch.id) && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded flex items-center gap-1">
                              <ClipboardCheck className="w-3 h-3" />
                              Inspected
                            </span>
                          )}
                          {batch.status === 'CREATED' && (
                            <button
                              onClick={() => {
                                setSelectedBatch(batch);
                                setShowTransportModal(true);
                              }}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              title="Request Transport"
                            >
                              Request Transport
                            </button>
                          )}
                          {['CREATED', 'TRANSPORT_REQUESTED', 'TRANSPORT_REJECTED'].includes(batch.status) && (
                            <button
                              onClick={() => handleSuspendBatch(batch.id)}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              title="Suspend Batch"
                            >
                              Suspend
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedBatch(batch);
                              setShowInspectionTimeline(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="View Inspection Timeline"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Batch Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Batch</h2>
              <form onSubmit={handleCreateBatch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type *</label>
                    <input
                      type="text"
                      required
                      value={formData.crop_type}
                      onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Wheat, Rice"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
                    <input
                      type="date"
                      value={formData.harvest_date}
                      onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm Location *</label>
                    <input
                      type="text"
                      required
                      value={formData.farm_location}
                      onChange={(e) => setFormData({ ...formData, farm_location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Village, District, State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price per Unit (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.farmer_base_price_per_unit}
                      onChange={(e) => setFormData({ ...formData, farmer_base_price_per_unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 25.50"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Create Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transport Request Modal */}
        {showTransportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Request Transport</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                  <p className="text-sm text-gray-600">{selectedBatch?.product_batch_id} - {selectedBatch?.crop_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Distributor</label>
                  <select
                    value={selectedDistributor}
                    onChange={(e) => setSelectedDistributor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Choose a distributor...</option>
                    {distributors.map(dist => (
                      <option key={dist.id} value={dist.id}>
                        {dist.user_details?.username || dist.organization || `Distributor ${dist.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowTransportModal(false);
                    setSelectedBatch(null);
                    setSelectedDistributor('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestTransport}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Request Transport
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Inspection Form Modal */}
        {showInspectionModal && selectedBatch && (
          <InspectionForm
            batch={selectedBatch}
            stage="farmer"
            onClose={() => {
              setShowInspectionModal(false);
              setSelectedBatch(null);
            }}
            onSuccess={() => {
              fetchBatchInspections(selectedBatch.id);
              fetchBatches();
            }}
          />
        )}

        {/* Inspection Timeline Modal */}
        {showInspectionTimeline && selectedBatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Inspection History</h2>
                  <p className="text-sm text-gray-500">{selectedBatch.product_batch_id} - {selectedBatch.crop_type}</p>
                </div>
                <button
                  onClick={() => {
                    setShowInspectionTimeline(false);
                    setSelectedBatch(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-500">✕</span>
                </button>
              </div>
              <InspectionTimeline 
                batchId={selectedBatch.id} 
                inspections={batchInspections[selectedBatch.id]}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FarmerBatches;
