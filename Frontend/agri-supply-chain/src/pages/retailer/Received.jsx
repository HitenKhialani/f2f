import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackageCheck,
  Loader2,
  Search,
  AlertCircle,
  Plus,
  ShoppingCart
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { batchAPI } from '../../services/api';

const Received = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await batchAPI.list();
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setBatches(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load received batches');
    } finally {
      setLoading(false);
    }
  };

  // Filter received batches - delivered to retailer but not yet listed
  const receivedBatches = batches.filter(b => b.status === 'DELIVERED_TO_RETAILER');

  const filteredBatches = receivedBatches.filter(batch => {
    const searchLower = searchTerm.toLowerCase();
    return (
      batch.product_batch_id?.toLowerCase().includes(searchLower) ||
      batch.crop_type?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'DELIVERED_TO_RETAILER': 'bg-emerald-100 text-emerald-700',
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
            <h1 className="text-2xl font-bold text-gray-900">Received Batches</h1>
            <p className="text-gray-600">Batches delivered to your store ready for listing</p>
          </div>
          <button
            onClick={() => navigate('/retailer/listing/new')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Listing
          </button>
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

        {/* Received Table */}
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
                        <PackageCheck className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">
                          {searchTerm ? 'No batches match your search' : 'No received batches found'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Batches will appear here once they are delivered to your store
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {batch.product_batch_id}
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
                        <button
                          onClick={() => navigate('/retailer/listing/new')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Create Listing
                        </button>
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

export default Received;
