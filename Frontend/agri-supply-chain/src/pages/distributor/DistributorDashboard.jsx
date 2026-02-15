import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Store,
  Package,
  Truck,
  Archive,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Navigation,
  MapPin,
  X,
  Plus
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { batchAPI, stakeholderAPI, transportAPI, distributorAPI, batchSplitAPI } from '../../services/api';

const DistributorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('incoming');
  const [batches, setBatches] = useState([]);
  const [transportRequests, setTransportRequests] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [splitData, setSplitData] = useState({
    splits: [
      { label: '', quantity: '', retailer: '' }
    ]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [batchesRes, transportRes, retailersRes] = await Promise.all([
        batchAPI.list(),
        transportAPI.list(),
        stakeholderAPI.listProfiles({ role: 'retailer', kyc_status: 'approved' }),
      ]);
      setBatches(batchesRes.data);
      setTransportRequests(transportRes.data);
      setRetailers(retailersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreBatch = async (batchId) => {
    try {
      await distributorAPI.storeBatch(batchId);
      alert('Batch stored successfully');
      fetchData();
    } catch (error) {
      console.error('Error storing batch:', error);
      alert(error.response?.data?.message || 'Failed to store batch');
    }
  };

  const handleSplitBatch = (batch) => {
    setSelectedBatch(batch);
    setShowSplitModal(true);
    // Initialize with one empty split
    setSplitData({
      splits: [{ label: '', quantity: '', retailer: '' }]
    });
  };

  const handleAddSplit = () => {
    setSplitData({
      splits: [...splitData.splits, { label: '', quantity: '', retailer: '' }]
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
    // Validate total quantity doesn't exceed parent batch
    const totalQuantity = splitData.splits.reduce((sum, split) => sum + (parseFloat(split.quantity) || 0), 0);
    const parentQuantity = parseFloat(selectedBatch.quantity);
    
    if (totalQuantity > parentQuantity) {
      alert(`Total split quantity (${totalQuantity} kg) cannot exceed parent batch quantity (${parentQuantity} kg)`);
      return;
    }
    
    // Validate all fields are filled
    for (let i = 0; i < splitData.splits.length; i++) {
      const split = splitData.splits[i];
      if (!split.label || !split.quantity || !split.retailer) {
        alert(`Please fill all fields for split ${i + 1}`);
        return;
      }
    }
    
    try {
      // Create batch splits with child batches
      for (const split of splitData.splits) {
        await batchSplitAPI.create({
          parent_batch: selectedBatch.id,
          split_label: split.label,
          quantity: parseFloat(split.quantity),
          destination_retailer: parseInt(split.retailer),
          notes: `Split from ${selectedBatch.product_batch_id}`
        });
      }
      
      alert(`${splitData.splits.length} child batches created successfully!`);
      setShowSplitModal(false);
      setSelectedBatch(null);
      fetchData();
    } catch (error) {
      console.error('Error splitting batch:', error);
      alert(error.response?.data?.message || 'Failed to split batch');
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
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.detail || 
                           'Failed to request transport';
      alert(`Transport Error ${error.response?.status || 'Unknown'}: ${errorMessage}`);
    }
  };

  const getFilteredContent = () => {
    switch (activeTab) {
      case 'incoming':
        return batches.filter(b => b.status === 'DELIVERED_TO_DISTRIBUTOR');
      case 'inventory':
        return batches.filter(b => b.status === 'STORED');
      case 'outgoing':
        // Show actual transport requests for outgoing tab
        return transportRequests.filter(tr =>
          tr.status === 'PENDING' ||
          tr.status === 'ACCEPTED' ||
          tr.status === 'IN_TRANSIT' ||
          tr.status === 'IN_TRANSIT_TO_RETAILER'
        ).filter(tr => tr.from_party_details?.user_details?.username === user?.username);
      default:
        return [];
    }
  };

  const filteredItems = getFilteredContent();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Distributor Dashboard</h1>
          <p className="text-gray-600">Manage incoming crops and inventory</p>
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
              <Package className="w-4 h-4 inline mr-2" />
              Incoming
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'inventory'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Archive className="w-4 h-4 inline mr-2" />
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'outgoing'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Truck className="w-4 h-4 inline mr-2" />
              Outgoing
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
                    {activeTab === 'outgoing' ? 'Request ID' : 'Batch ID'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {activeTab === 'outgoing' ? 'Destination' : 'Quantity'}
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
                        {activeTab === 'outgoing'
                          ? `TR-${item.id}`
                          : item.product_batch_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {activeTab === 'outgoing'
                          ? item.batch_details?.crop_type
                          : item.crop_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {activeTab === 'outgoing'
                          ? item.to_party_details?.organization || item.to_party_details?.user_details?.username
                          : `${item.quantity} kg`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'PENDING' ? 'bg-gray-100 text-gray-700' :
                          item.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                          {item.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {activeTab === 'incoming' && item.status === 'DELIVERED_TO_DISTRIBUTOR' && (
                          <button
                            onClick={() => handleStoreBatch(item.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 mr-2"
                          >
                            Store Batch
                          </button>
                        )}
                        {activeTab === 'inventory' && item.status === 'STORED' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedBatch(item);
                                setShowTransportModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 mr-2"
                            >
                              Request Transport
                            </button>
                            <button
                              onClick={() => handleSplitBatch(item)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 mr-2"
                            >
                              Split Batch
                            </button>
                            <button
                              onClick={() => navigate(`/distributor/inspection/${item.id}`)}
                              className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                            >
                              Inspect
                            </button>
                          </>
                        )}
                        {activeTab === 'outgoing' && (
                          <span className="text-gray-500 italic">Tracking Transport</span>
                        )}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Request Transport to Retailer</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Retailer
                </label>
                <select
                  value={selectedRetailer}
                  onChange={(e) => setSelectedRetailer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestTransport}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Split Batch Modal */}
      {showSplitModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
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
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Total Quantity to Split:</strong> {selectedBatch.quantity} kg
                </p>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Label *
                        </label>
                        <input
                          type="text"
                          value={split.label}
                          onChange={(e) => handleSplitChange(index, 'label', e.target.value)}
                          placeholder="e.g., Split A"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destination Retailer *
                        </label>
                        <select
                          value={split.retailer}
                          onChange={(e) => handleSplitChange(index, 'retailer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select Retailer</option>
                          {retailers.map(retailer => (
                            <option key={retailer.id} value={retailer.id}>
                              {retailer.organization || retailer.user_details?.username}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleAddSplit}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Another Split
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSplitModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitSplit}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Split Batch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default DistributorDashboard;
