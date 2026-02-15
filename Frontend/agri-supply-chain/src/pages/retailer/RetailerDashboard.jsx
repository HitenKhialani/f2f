import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Plus,
  Package,
  ShoppingCart,
  CheckCircle,
  Truck
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { batchAPI, transportAPI, retailerAPI, retailAPI } from '../../services/api';

const RetailerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('incoming');
  const [batches, setBatches] = useState([]);
  const [transportRequests, setTransportRequests] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, transportRes, listingsRes] = await Promise.all([
        batchAPI.list(),
        transportAPI.list(),
        retailAPI.list(),
      ]);
      setBatches(batchesRes.data);
      setTransportRequests(transportRes.data);
      setListings(listingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSold = async (batchId) => {
    if (!confirm('Mark this batch as sold?')) return;

    try {
      await retailerAPI.markSold(batchId);
      alert('Batch marked as sold successfully');
      fetchData();
    } catch (error) {
      console.error('Error marking batch as sold:', error);
      alert(error.response?.data?.message || 'Failed to mark batch as sold');
    }
  };

  const getFilteredContent = () => {
    switch (activeTab) {
      case 'incoming':
        // Show transport requests where status is not DELIVERED
        return transportRequests.filter(tr => tr.status !== 'DELIVERED');
      case 'received':
        // Show batches delivered to retailer but not yet listed
        return batches.filter(b => b.status === 'DELIVERED_TO_RETAILER');
      case 'listed':
        // Show retail listings
        return listings.filter(l => l.is_for_sale === true);
      case 'sold':
        // Show retail listings that are sold
        return listings.filter(l => l.is_for_sale === false);
      default:
        return [];
    }
  };

  const filteredItems = getFilteredContent();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Retailer Dashboard</h1>
            <p className="text-gray-600">Manage inventory and sales</p>
          </div>
          <button
            onClick={() => navigate('/retailer/listing/new')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Listing
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'incoming'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Truck className="w-4 h-4 inline mr-2" />
              Incoming Transport
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'received'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Received
            </button>
            <button
              onClick={() => setActiveTab('listed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'listed'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              Listed
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'sold'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Sold
            </button>
          </nav>
        </div>

        {/* Batches Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {activeTab === 'incoming' ? 'Transport ID' : 'Batch ID'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {activeTab === 'incoming' ? 'Source' : 'Quantity'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No items found</td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {activeTab === 'incoming'
                          ? `TR-${item.id}`
                          : item.product_batch_id || item.batch?.product_batch_id || `LISTING-${item.id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {activeTab === 'incoming'
                          ? item.batch_details?.crop_type
                          : item.crop_type || item.batch?.crop_type || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {activeTab === 'incoming'
                          ? item.from_party_details?.organization || item.from_party_details?.user_details?.username
                          : activeTab === 'listed' || activeTab === 'sold'
                            ? `₹${item.total_price || (parseFloat(item.farmer_base_price || 0) + parseFloat(item.transport_fees || 0) + parseFloat(item.distributor_margin || 0) + parseFloat(item.retailer_margin || 0)).toFixed(2)}`
                            : `${item.quantity} kg`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          activeTab === 'sold' ? 'bg-green-100 text-green-700' :
                          activeTab === 'listed' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'SOLD' ? 'bg-green-100 text-green-700' :
                          item.status === 'LISTED' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                          {activeTab === 'listed' ? 'LISTED FOR SALE' : 
                           activeTab === 'sold' ? 'SOLD' : 
                           item.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {activeTab === 'incoming' && (
                          <span className="text-gray-500 italic">Incoming Delivery</span>
                        )}
                        {activeTab === 'received' && item.status === 'DELIVERED_TO_RETAILER' && (
                          <button
                            onClick={() => navigate('/retailer/listing/new')}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Create Listing
                          </button>
                        )}
                        {activeTab === 'listed' && item.status === 'LISTED' && (
                          <button
                            onClick={() => handleMarkSold(item.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Mark as Sold
                          </button>
                        )}
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

export default RetailerDashboard;
