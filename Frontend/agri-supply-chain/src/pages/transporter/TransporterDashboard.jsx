import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Search,
  Filter,
  Package,
  Clock,
  CheckCircle,
  MapPin,
  Navigation
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { transportAPI } from '../../services/api';

const TransporterDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    assigned: 0,
    inTransit: 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await transportAPI.list();
      setRequests(response.data);
      setStats({
        assigned: response.data.filter(r => r.status === 'ACCEPTED' || r.status === 'IN_TRANSIT').length,
        inTransit: response.data.filter(r => r.status === 'IN_TRANSIT').length,
        delivered: response.data.filter(r => r.status === 'DELIVERED').length,
      });
    } catch (error) {
      console.error('Error fetching transport requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      if (newStatus === 'ACCEPTED') {
        await transportAPI.acceptRequest(id);
      } else if (newStatus === 'DELIVERED') {
        await transportAPI.deliverRequest(id);
      } else if (newStatus === 'REJECTED') {
        await transportAPI.rejectRequest(id);
      } else {
        await transportAPI.update(id, { status: newStatus });
      }
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-gray-100 text-gray-700',
      ACCEPTED: 'bg-blue-100 text-blue-700',
      IN_TRANSIT: 'bg-amber-100 text-amber-700',
      DELIVERED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status?.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transporter Dashboard</h1>
            <p className="text-gray-600">Manage and track transport requests</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Deliveries</p>
                <p className="text-3xl font-bold text-gray-900">{stats.assigned}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Currently In Transit</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inTransit}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Truck className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Delivered</p>
                <p className="text-3xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transport Table */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-100 text-lg font-semibold text-gray-900">
            Transport Requests
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Batch ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Crop / Quantity</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Source (Farmer)</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Destination</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      <Truck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p>No transport requests</p>
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900">
                          {request.batch_details?.product_batch_id || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {request.batch_details?.crop_type}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.batch_details?.quantity} kg
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <div>{request.from_party_details?.organization || request.from_party_details?.user_details?.username}</div>
                            <div className="text-xs text-gray-500">{request.from_party_details?.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <Navigation className="w-4 h-4 text-gray-400" />
                          <div>
                            <div>{request.to_party_details?.organization || request.to_party_details?.user_details?.username}</div>
                            <div className="text-xs text-gray-500">{request.to_party_details?.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {request.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(request.id, 'ACCEPTED')}
                                className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                className="px-3 py-1 border border-red-200 text-red-600 text-xs rounded hover:bg-red-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {request.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'IN_TRANSIT')}
                              className="px-3 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700"
                            >
                              Start Transport
                            </button>
                          )}
                          {request.status === 'IN_TRANSIT' && (
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'DELIVERED')}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Mark Delivered
                            </button>
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
      </div>
    </MainLayout>
  );
};

export default TransporterDashboard;
