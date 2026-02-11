import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  FileCheck,
  Download,
  Eye
} from 'lucide-react';
import { adminAPI } from '../../services/adminApi';

const KYCManagement = () => {
  const { refreshUser } = useAuth();
  const [kycRecords, setKycRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchKYCRecords();
  }, [filter]);

  const fetchKYCRecords = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllKYC(filter === 'all' ? '' : filter);
      setKycRecords(response.data);
    } catch (error) {
      console.error('Error fetching KYC records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, decision) => {
    console.log('handleDecision called with:', { id, decision, notes });
    try {
      const response = await adminAPI.decideKYC(id, decision, notes);
      console.log('KYC decision response:', response);
      setSelectedRecord(null);
      setNotes('');
      fetchKYCRecords();
      // Refresh user data to update KYC status across the app
      await refreshUser();
    } catch (error) {
      console.error('Error updating KYC:', error);
      alert('Error updating KYC: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const normalizedStatus = status?.toLowerCase() || 'pending';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[normalizedStatus] || styles.pending}`}>
        {status || 'Pending'}
      </span>
    );
  };

  const filteredRecords = kycRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.profile?.user?.username?.toLowerCase().includes(searchLower) ||
      record.profile?.user?.email?.toLowerCase().includes(searchLower) ||
      record.profile?.role?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Management</h1>
          <p className="text-gray-600">Review and approve user KYC submissions</p>
        </div>
        <button
          onClick={fetchKYCRecords}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <p className="text-sm text-amber-700 mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-800">
            {kycRecords.filter(r => r.status?.toLowerCase() === 'pending').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-700 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-800">
            {kycRecords.filter(r => r.status?.toLowerCase() === 'approved').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-700 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-800">
            {kycRecords.filter(r => r.status?.toLowerCase() === 'rejected').length}
          </p>
        </div>
      </div>

      {/* KYC Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Document</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No KYC records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{record.profile?.user?.username || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{record.profile?.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                      {record.profile?.role || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {record.document_type || 'KYC Document'}
                      {record.document_file && (
                        <a 
                          href={record.document_file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-green-600 hover:underline text-xs"
                        >
                          <Download className="w-3 h-3 inline" /> View
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.created_at ? new Date(record.created_at).toLocaleDateString('hi-IN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {(record.status === 'PENDING' || record.status === 'pending') ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              console.log('Approve button clicked for record:', record);
                              setSelectedRecord(record);
                            }}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              console.log('Reject button clicked for record:', record);
                              setSelectedRecord({ ...record, rejectMode: true });
                            }}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {record.verified_by ? `By ${record.verified_by.user?.username}` : 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedRecord.rejectMode ? 'Reject KYC' : 'Approve KYC'}
            </h3>
            <p className="text-gray-600 mb-4">
              User: <span className="font-medium">{selectedRecord.profile?.user?.username}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this decision..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="3"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  setNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision(
                  selectedRecord.id, 
                  selectedRecord.rejectMode ? 'rejected' : 'approved'
                )}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  selectedRecord.rejectMode 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {selectedRecord.rejectMode ? 'Reject' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCManagement;
