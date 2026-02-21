import React, { useState, useEffect } from 'react';
import {
  Package,
  Boxes,
  Truck,
  IndianRupee,
  Loader2,
  TrendingUp,
  Activity,
  AlertCircle,
  Store
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import MainLayout from '../../components/layout/MainLayout';
import { dashboardAPI } from '../../services/api';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899'];

const MetricCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className={`${color} p-3 rounded-xl`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const DistributorDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDistributorAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const inventoryChartData = analytics?.inventory_distribution
    ? Object.entries(analytics.inventory_distribution).map(([crop, data]) => ({
        name: crop,
        value: data.quantity,
        count: data.count
      }))
    : [];

  const monthlyActivityData = analytics?.monthly_activity?.months?.map((month, index) => ({
    month,
    incoming: analytics.monthly_activity.incoming[index] || 0,
    outgoing: analytics.monthly_activity.outgoing[index] || 0
  })) || [];

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatWeight = (kg) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)} tons`;
    }
    return `${kg.toFixed(0)} kg`;
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

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </MainLayout>
    );
  }

  const metrics = analytics?.metrics || {};

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Distributor Dashboard</h1>
          <p className="text-gray-600">Analyze inventory metrics and activity</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Incoming Batches"
            value={metrics.incoming_batches || 0}
            icon={Package}
            color="bg-amber-500"
            subtext="Awaiting storage"
          />
          <MetricCard
            title="Current Inventory"
            value={formatWeight(metrics.inventory_quantity || 0)}
            icon={Boxes}
            color="bg-emerald-500"
            subtext={`${metrics.inventory_count || 0} batches`}
          />
          <MetricCard
            title="Outgoing Shipments"
            value={metrics.outgoing_shipments || 0}
            icon={Truck}
            color="bg-blue-500"
            subtext="Active transports"
          />
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(metrics.total_revenue || 0)}
            icon={IndianRupee}
            color="bg-green-600"
            subtext="Earnings to date"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inventory Breakdown Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory Breakdown</h3>
            {inventoryChartData.length > 0 ? (
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryChartData}
                      cx="35%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {inventoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toFixed(2)} kg`, 'Quantity']} />
                    <Legend 
                      verticalAlign="middle" 
                      align="right"
                      layout="vertical"
                      formatter={(value, entry) => (
                        <span className="text-sm text-gray-600">
                          {value} ({entry.payload.count} batches)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Store className="w-12 h-12 mx-auto mb-2" />
                  <p>No inventory data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Activity Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Activity</h3>
            {monthlyActivityData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyActivityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ value: '# of Batches', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="incoming" name="Incoming" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outgoing" name="Outgoing" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                  <p>No activity data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {!metrics.inventory_count && !metrics.incoming_batches && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Your dashboard will populate once you start receiving batches from farmers and sending shipments to retailers.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DistributorDashboard;
