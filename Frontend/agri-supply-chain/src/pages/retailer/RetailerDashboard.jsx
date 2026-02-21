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
    setLoading(true);
    try {
      // Fetch each resource individually to prevent one failure from blocking others
      const fetchResults = await Promise.allSettled([
        batchAPI.list(),
        transportAPI.list(),
        retailAPI.list(),
      ]);

      // Process results with safety checks and pagination support
      if (fetchResults[0].status === 'fulfilled') {
        const data = fetchResults[0].value.data;
        setBatches(Array.isArray(data) ? data : data.results || []);
      } else {
        console.error('Failed to fetch batches:', fetchResults[0].reason);
      }

      if (fetchResults[1].status === 'fulfilled') {
        const data = fetchResults[1].value.data;
        // console.log('Transport Requests fetched:', data); // Debugging
        setTransportRequests(Array.isArray(data) ? data : data.results || []);
      } else {
        console.error('Failed to fetch transport requests:', fetchResults[1].reason);
      }

      if (fetchResults[2].status === 'fulfilled') {
        const data = fetchResults[2].value.data;
        setListings(Array.isArray(data) ? data : data.results || []);
      } else {
        console.error('Failed to fetch listings:', fetchResults[2].reason);
      }
    } catch (error) {
      console.error('Unexpected error in fetchData:', error);
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

  const getFilteredContent = () => {
    switch (activeTab) {
      case 'incoming':
        // Show transport requests where status is not DELIVERED
        return transportRequests.filter(tr => tr && tr.status !== 'DELIVERED');
      case 'received':
        // Show batches delivered to retailer but not yet listed
        return batches.filter(b => b && b.status === 'DELIVERED_TO_RETAILER');
      case 'listed':
        // Show retail listings
        return listings.filter(l => l && l.is_for_sale === true);
      case 'sold':
        // Show retail listings that are sold
        return listings.filter(l => l && l.is_for_sale === false);
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
                    {activeTab === 'incoming' ? 'Source' : 'Details'}
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
                          : item.batch_details?.product_batch_id || item.product_batch_id || `LISTING-${item.id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {activeTab === 'incoming'
                          ? item.batch_details?.crop_type
                          : item.batch_details?.crop_type || item.crop_type || item.batch?.crop_type || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {activeTab === 'incoming'
                          ? item.from_party_details?.organization || item.from_party_details?.user_details?.username
                          : activeTab === 'listed' || activeTab === 'sold'
                            ? (
                              <div className="flex flex-col">
                                <span className="font-bold text-primary">₹{item.total_price || 0}</span>
                                {item.batch_details?.qr_code_image && (
                                  <img
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${item.batch_details.qr_code_image}`}
                                    alt="QR Code"
                                    className="w-16 h-16 mt-1 border rounded p-1 bg-white cursor-pointer"
                                    onClick={() => window.open(`/trace/${item.batch_details.public_batch_id}`, '_blank')}
                                  />
                                )}
                              </div>
                            )
                            : `${item.quantity} kg`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${activeTab === 'sold' ? 'bg-green-100 text-green-700' :
                          activeTab === 'listed' ? 'bg-blue-100 text-blue-700' :
                            item.status === 'SOLD' ? 'bg-green-100 text-green-700' :
                              item.status === 'LISTED' ? 'bg-blue-100 text-blue-700' :
                                item.status.includes('IN_TRANSIT') ? 'bg-amber-100 text-amber-700' :
                                  item.status === 'ARRIVED_AT_RETAILER' || item.status === 'ARRIVED' ? 'bg-indigo-100 text-indigo-700' :
                                    item.status === 'ARRIVAL_CONFIRMED_BY_RETAILER' || item.status === 'ARRIVAL_CONFIRMED' ? 'bg-purple-100 text-purple-700' :
                                      item.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                          }`}>
                          {activeTab === 'listed' ? 'LISTED FOR SALE' :
                            activeTab === 'sold' ? 'SOLD' :
                              item.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {activeTab === 'incoming' && (
                          <div className="flex gap-2">
                            {(item.status === 'ARRIVED_AT_RETAILER' || item.status === 'ARRIVED') && (
                              <button
                                onClick={() => handleConfirmArrival(item.id)}
                                className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                              >
                                Confirm Arrival
                              </button>
                            )}
                            {(item.status === 'ARRIVAL_CONFIRMED' || item.status.includes('IN_TRANSIT')) && (
                              <span className="text-xs text-gray-500 italic">Tracking Transport</span>
                            )}
                          </div>
                        )}
                        {activeTab === 'received' && item.status === 'DELIVERED_TO_RETAILER' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate('/retailer/listing/new')}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Create Listing
                            </button>
                          </div>
                        )}
                        {activeTab === 'listed' && item.batch_details?.status === 'LISTED' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => window.open(`/trace/${item.batch_details?.public_batch_id}`, '_blank')}
                              className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90"
                            >
                              View Trace
                            </button>
                            <button
                              onClick={() => handleMarkSold(item.batch || item.batch_details?.id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Mark as Sold
                            </button>
                            <button
                              onClick={() => handleSuspendBatch(item.batch || item.batch_details?.id)}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              title="Suspend Batch"
                            >
                              Suspend
                            </button>
                          </div>
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
