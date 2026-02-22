import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  MapPin,
  Navigation,
  Loader2,
  ArrowRight,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Play,
  IndianRupee,
  ClipboardCheck,
  Eye
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { transportAPI, inspectionAPI } from '../../services/api';
import { InspectionForm, InspectionTimeline } from '../../components/inspection';

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-gray-100 text-gray-700',
    ACCEPTED: 'bg-violet-100 text-violet-700',
    IN_TRANSIT: 'bg-cyan-100 text-cyan-700',
    IN_TRANSIT_TO_RETAILER: 'bg-cyan-100 text-cyan-700',
    ARRIVED: 'bg-amber-100 text-amber-700',
    ARRIVAL_CONFIRMED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const ActionButton = ({ status, onAccept, onReject, onArrive, onDeliver }) => {
  switch (status) {
    case 'PENDING':
      return (
        <div className="flex flex-col gap-2">
          <button
            onClick={onAccept}
            className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            Accept
          </button>
          <button
            onClick={onReject}
            className="px-3 py-1.5 border border-red-200 text-red-600 text-xs rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
          >
            <XCircle className="w-3 h-3" />
            Reject
          </button>
        </div>
      );
    case 'ACCEPTED':
    case 'IN_TRANSIT':
    case 'IN_TRANSIT_TO_RETAILER':
      return (
        <button
          onClick={onArrive}
          className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1"
        >
          <MapPin className="w-3 h-3" />
          Mark Arrived
        </button>
      );
    case 'ARRIVAL_CONFIRMED':
      return (
        <button
          onClick={onDeliver}
          className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
        >
          <CheckCircle className="w-3 h-3" />
          Mark Delivered
        </button>
      );
    case 'ARRIVED':
      return (
        <span className="text-xs text-gray-500 italic">Waiting for confirmation</span>
      );
    case 'DELIVERED':
      return (
        <span className="text-xs text-emerald-600 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      );
    default:
      return null;
  }
};

const TransporterShipmentsList = ({ 
  title, 
  filterFn, 
  emptyMessage = "No shipments found",
  showActions = true 
}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [transportFee, setTransportFee] = useState('');
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showInspectionTimeline, setShowInspectionTimeline] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [shipmentInspections, setShipmentInspections] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await transportAPI.list();
      setRequests(response.data);
      // Fetch inspections for each shipment
      response.data.forEach(request => {
        if (request.batch) {
          fetchShipmentInspections(request.batch);
        }
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching transport requests:', err);
      setError('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const fetchShipmentInspections = async (batchId) => {
    try {
      const response = await inspectionAPI.getBatchTimeline(batchId);
      setShipmentInspections(prev => ({
        ...prev,
        [batchId]: response.data
      }));
    } catch (err) {
      console.log(`No inspections for batch ${batchId}`);
    }
  };

  const hasTransporterInspection = (batchId) => {
    const inspections = shipmentInspections[batchId] || [];
    return inspections.some(i => i.stage === 'transporter');
  };

  // Filter requests based on filterFn prop
  const filteredRequests = requests.filter(filterFn || (() => true));

  // Apply additional search and status filters
  const displayedRequests = filteredRequests.filter(request => {
    const matchesSearch = 
      request.batch_details?.product_batch_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.from_party_details?.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.to_party_details?.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.batch_details?.crop_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (id, newStatus, extraData = {}) => {
    try {
      if (newStatus === 'ACCEPTED') {
        setSelectedRequestId(id);
        setTransportFee('');
        setShowFeeModal(true);
        return;
      } else if (newStatus === 'ARRIVED') {
        await transportAPI.arriveRequest(id);
      } else if (newStatus === 'DELIVERED') {
        await transportAPI.deliverRequest(id);
      } else if (newStatus === 'REJECTED') {
        await transportAPI.rejectRequest(id);
      }
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAcceptWithFee = async () => {
    try {
      const transportFeeVal = parseFloat(transportFee || 0);
      if (isNaN(transportFeeVal) || transportFeeVal < 0) {
        alert('Please enter a valid transport fee');
        return;
      }
      await transportAPI.acceptRequest(selectedRequestId, { transporter_fee_per_unit: transportFeeVal });
      setShowFeeModal(false);
      setSelectedRequestId(null);
      setTransportFee('');
      fetchRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const getTypeIcon = (role) => {
    return role === 'farmer' ? 
      <Package className="w-4 h-4 text-blue-600" /> : 
      <Truck className="w-4 h-4 text-purple-600" />;
  };

  const getTypeLabel = (role) => {
    return role === 'farmer' ? 'Farmer' : 'Distributor';
  };

  const uniqueStatuses = [...new Set(filteredRequests.map(r => r.status))];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchRequests}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
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
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">
              {filteredRequests.length} {filteredRequests.length === 1 ? 'shipment' : 'shipments'} found
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by batch ID, organization, or crop type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                >
                  <option value="all">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>
                      {status?.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Batch / Crop</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  {showActions && <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={showActions ? 6 : 5} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <Truck className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">{emptyMessage}</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-400 mt-1">
                            Try adjusting your search or filter
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-mono text-sm font-medium text-gray-900 block">
                            {request.batch_details?.product_batch_id || 'N/A'}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            {request.batch_details?.crop_type || 'N/A'} • {request.batch_details?.quantity || '-'} kg
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(request.from_party_details?.role)}
                          <span className="text-sm text-gray-700">
                            {getTypeLabel(request.from_party_details?.role)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <div className="flex flex-col">
                            <span className="truncate max-w-[120px]" title={request.from_party_details?.address}>
                              {request.from_party_details?.organization || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-400 truncate max-w-[120px]">
                              {request.from_party_details?.address?.split(',')[0]}
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="truncate max-w-[120px]" title={request.to_party_details?.address}>
                              {request.to_party_details?.organization || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-400 truncate max-w-[120px]">
                              {request.to_party_details?.address?.split(',')[0]}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          ₹{parseFloat(request.transporter_fee_per_unit || 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 block">per unit</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={request.status} />
                      </td>
                      {showActions && (
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {/* Inspection button for transporter stage */}
                            {['ACCEPTED', 'IN_TRANSIT', 'IN_TRANSIT_TO_RETAILER', 'ARRIVED'].includes(request.status) && 
                             request.batch_details?.id &&
                             !hasTransporterInspection(request.batch_details.id) && (
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowInspectionModal(true);
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                                title="Inspect Shipment"
                              >
                                <ClipboardCheck className="w-3 h-3" />
                                Inspect
                              </button>
                            )}
                            {['ACCEPTED', 'IN_TRANSIT', 'IN_TRANSIT_TO_RETAILER', 'ARRIVED', 'DELIVERED'].includes(request.status) && 
                             request.batch_details?.id &&
                             hasTransporterInspection(request.batch_details.id) && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded flex items-center gap-1">
                                <ClipboardCheck className="w-3 h-3" />
                                Inspected
                              </span>
                            )}
                            <ActionButton
                              status={request.status}
                              onAccept={() => handleStatusUpdate(request.id, 'ACCEPTED')}
                              onReject={() => handleStatusUpdate(request.id, 'REJECTED')}
                              onArrive={() => handleStatusUpdate(request.id, 'ARRIVED')}
                              onDeliver={() => handleStatusUpdate(request.id, 'DELIVERED')}
                            />
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowInspectionTimeline(true);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 self-start"
                              title="View Inspection Timeline"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Transport Fee Modal */}
        {showFeeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Enter Transport Fee</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Please enter the transport fee per unit (₹) for this shipment.
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transport Fee per Unit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={transportFee}
                    onChange={(e) => setTransportFee(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFeeModal(false);
                    setSelectedRequestId(null);
                    setTransportFee('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptWithFee}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Accept & Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inspection Form Modal */}
        {showInspectionModal && selectedRequest?.batch_details && (
          <InspectionForm
            batch={selectedRequest.batch_details}
            stage="transporter"
            onClose={() => {
              setShowInspectionModal(false);
              setSelectedRequest(null);
            }}
            onSuccess={() => {
              if (selectedRequest.batch_details?.id) {
                fetchShipmentInspections(selectedRequest.batch_details.id);
              }
              fetchRequests();
            }}
          />
        )}

        {/* Inspection Timeline Modal */}
        {showInspectionTimeline && selectedRequest?.batch_details && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Inspection History</h2>
                  <p className="text-sm text-gray-500">
                    {selectedRequest.batch_details.product_batch_id} - {selectedRequest.batch_details.crop_type}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowInspectionTimeline(false);
                    setSelectedRequest(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-500">✕</span>
                </button>
              </div>
              <InspectionTimeline 
                batchId={selectedRequest.batch_details.id}
                inspections={shipmentInspections[selectedRequest.batch_details.id]}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TransporterShipmentsList;
