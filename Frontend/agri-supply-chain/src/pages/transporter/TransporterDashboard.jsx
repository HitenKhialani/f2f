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
        assigned: response.data.filter(r => r.status === 'ACCEPTED').length,
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
      await transportAPI.update(id, { status: newStatus });
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: 'bg-gray-100 text-gray-700',
      ACCEPTED: 'bg-blue-100 text-blue-700',
      IN_TRANSIT: 'bg-amber-100 text-amber-700',
      DELIVERED: 'bg-green-100 text-green-700',
    };
    const labels = {
      OPEN: 'Open',
      ACCEPTED: 'Accepted',
      IN_TRANSIT: 'In Transit',
      DELIVERED: 'Delivered',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
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
                <p className="text-sm text-gray-600 mb-1">Accepted Requests</p>
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
                <p className="text-sm text-gray-600 mb-1">In Transit</p>
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
                <p className="text-sm text-gray-600 mb-1">Delivered</p>
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
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Transport Requests</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Batch ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Crop Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Source</th>
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
                          {request.batch?.product_batch_id?.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {request.batch?.crop_type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {request.from_party?.user?.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <Navigation className="w-4 h-4 text-gray-400" />
                          {request.to_party?.user?.username}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4">
                        {request.status === 'OPEN' && (
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'ACCEPTED')}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Accept
                          </button>
                        )}
                        {request.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'IN_TRANSIT')}
                            className="text-sm font-medium text-amber-600 hover:underline"
                          >
                            Start Transport
                          </button>
                        )}
                        {request.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'DELIVERED')}
                            className="text-sm font-medium text-green-600 hover:underline"
                          >
                            Mark Delivered
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

export default TransporterDashboard;
