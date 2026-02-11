import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  Search,
  Filter,
  ClipboardCheck,
  Package,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { batchAPI, inspectionAPI } from '../../services/api';

const DistributorDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [stats, setStats] = useState({
    incoming: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, inspectionsRes] = await Promise.all([
        batchAPI.list(),
        inspectionAPI.list(),
      ]);
      setBatches(batchesRes.data);
      setInspections(inspectionsRes.data);
      
      setStats({
        incoming: batchesRes.data.length,
        pending: batchesRes.data.filter(b => !b.inspected).length,
        approved: inspectionsRes.data.filter(i => i.passed).length,
        rejected: inspectionsRes.data.filter(i => !i.passed).length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Approved</span>;
    } else if (status === 'rejected') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Rejected</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Pending</span>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Distributor Dashboard</h1>
            <p className="text-gray-600">Inspect and manage incoming crops</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Incoming Crops</p>
                <p className="text-3xl font-bold text-gray-900">{stats.incoming}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Inspections</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Batches Table */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Incoming Crops</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search crops..."
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
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Farmer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quantity</th>
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
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      <Store className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p>No incoming crops</p>
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900">
                          {batch.product_batch_id?.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {batch.crop_type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {batch.farmer?.user?.username || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {batch.quantity} Qtl
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(batch.inspection_status)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/distributor/inspection/${batch.id}`}
                          className="flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          Inspect
                        </Link>
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

export default DistributorDashboard;
