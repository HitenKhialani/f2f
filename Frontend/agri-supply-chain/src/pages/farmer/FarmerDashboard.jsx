import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Plus,
  Package,
  CheckCircle,
  Clock,
  Search,
  Filter,
  QrCode,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { batchAPI, transportAPI, stakeholderAPI } from '../../services/api';

const FarmerDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    sold: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
      const response = await batchAPI.list();
      // Filter out child batches - farmer should only see their original batches
      const originalBatches = (response.data || []).filter(batch => !batch.is_child_batch);
      setBatches(originalBatches);

      // Calculate stats
      const total = originalBatches?.length || 0;
      const active = originalBatches.filter(b => b.status !== 'SUSPENDED').length;
      const suspended = originalBatches.filter(b => b.status === 'SUSPENDED').length;

      setStats({ total, active, suspended });
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
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
      fetchBatches(); // Refresh to show updated status
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
      // Create payload matching the serializer fields
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
      batch.id?.toString().includes(searchLower)
    );
  });

  const getStatusBadge = (batchStatus) => {
    const statusColors = {
      CREATED: 'bg-blue-100 text-blue-700',
      TRANSPORT_REQUESTED: 'bg-yellow-100 text-yellow-700',
      TRANSPORT_REJECTED: 'bg-orange-100 text-orange-700',
      IN_TRANSIT_TO_DISTRIBUTOR: 'bg-purple-100 text-purple-700',
      DELIVERED_TO_DISTRIBUTOR: 'bg-green-100 text-green-700',
      SUSPENDED: 'bg-red-100 text-red-700',
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
          <div className="text-gray-500">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
            <p className="text-gray-600">Manage your crop batches and track production</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Batch
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Batches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Batches</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Sprout className="w-8 h-8 text-green-600" />
            </div>
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

        {/* Batches Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Batch ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Crop Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Harvest Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No batches found. Create your first batch to get started.
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{batch.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
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
                        <div className="flex items-center gap-2">
                          {batch.status === 'SUSPENDED' && (
                            <span className="text-xs text-red-600 font-medium">Suspended</span>
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
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="View Details"
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
      </div>
    </MainLayout>
  );
};

export default FarmerDashboard;
