import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Sprout, 
  Truck, 
  FileCheck, 
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Wheat,
  Package,
  Shield
} from 'lucide-react';
import { adminAPI } from '../../services/adminApi';
import { kycAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pendingKYC: 0,
    totalUsers: 0,
    approvedKYC: 0,
    rejectedKYC: 0,
    usersByRole: {},
    totalBatches: 0,
    totalTransportRequests: 0,
  });
  const [kycRecords, setKycRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats from admin API
      const statsResponse = await adminAPI.getDashboardStats();
      const data = statsResponse.data;
      
      setStats({
        pendingKYC: data.pending_kyc || 0,
        totalUsers: data.total_users || 0,
        approvedKYC: data.approved_kyc || 0,
        rejectedKYC: data.rejected_kyc || 0,
        usersByRole: data.users_by_role || {},
        totalBatches: data.total_batches || 0,
        totalTransportRequests: data.total_transport_requests || 0,
      });
      
      // Fetch pending KYC records
      const kycResponse = await adminAPI.getPendingKYC();
      setKycRecords(kycResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleKYCAction = async (id, decision) => {
    try {
      await adminAPI.decideKYC(id, decision.toLowerCase());
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating KYC:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      PENDING: 'bg-amber-100 text-amber-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      PENDING: 'Pending',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
    };
    const normalizedStatus = status?.toLowerCase() || 'pending';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[normalizedStatus] || styles[status]}`}>
        {labels[normalizedStatus] || labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and KYC management</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">KYC Pending</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingKYC}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved KYC</p>
              <p className="text-3xl font-bold text-gray-900">{stats.approvedKYC}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Crop Batches</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBatches}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* KYC Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">KYC Requests</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Document</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
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
              ) : kycRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No KYC requests found
                  </td>
                </tr>
              ) : (
                kycRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{record.profile?.user?.username || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{record.profile?.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                      {record.profile?.role}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {record.document_type || 'KYC Document'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.created_at ? new Date(record.created_at).toLocaleDateString('hi-IN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {(record.status === 'PENDING' || record.status === 'pending') && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleKYCAction(record.id, 'APPROVED')}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleKYCAction(record.id, 'REJECTED')}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
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
  );
};

export default AdminDashboard;
