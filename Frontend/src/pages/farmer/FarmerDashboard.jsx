import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Plus,
  Package,
  CheckCircle,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  Ban,
  Eye,
  ClipboardCheck,
  Calendar,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedNumber } from '../../hooks/useLocalizedNumber';
import MainLayout from '../../components/layout/MainLayout';
import { batchAPI, transportAPI, stakeholderAPI, dashboardAPI, farmerAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AssistantWidget from '../../components/farmer/AssistantWidget';

// Simple Donut Chart Component
const DonutChart = ({ data, title, colors }) => {
  const { t } = useTranslation();
  const { formatNumber } = useLocalizedNumber();
  const total = data.reduce((sum, item) => sum + item.count, 0);
  let currentAngle = 0;

  return (
    <div className="bg-white dark:bg-cosmos-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-cosmos-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {total === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <p>{t('dashboard.farmer.noDataAvailable')}</p>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {data.map((item, index) => {
                const percentage = item.count / total;
                const angle = percentage * 360;
                const startAngle = currentAngle;
                currentAngle += angle;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = ((startAngle + angle) * Math.PI) / 180;

                const x1 = 50 + 40 * Math.cos(startRad);
                const y1 = 50 + 40 * Math.sin(startRad);
                const x2 = 50 + 40 * Math.cos(endRad);
                const y2 = 50 + 40 * Math.sin(endRad);

                const largeArcFlag = angle > 180 ? 1 : 0;

                const pathData = [
                  `M 50 50`,
                  `L ${x1} ${y1}`,
                  `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ');

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}
              <circle cx="50" cy="50" r="25" fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{formatNumber(total)}</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-gray-600">
                    {item.label || item.crop_type}
                  </span>
                </div>
                <span className="font-medium text-gray-900">{formatNumber(item.count)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Bar Chart Component
const BarChart = ({ data, title }) => {
  const { t } = useTranslation();
  const { formatNumber } = useLocalizedNumber();
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white dark:bg-cosmos-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-cosmos-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <p>{t('dashboard.farmer.noDataAvailable')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600 truncate" title={item.crop_type}>
                {item.crop_type}
              </div>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full transition-all duration-500"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <div className="w-8 text-sm font-medium text-gray-900 text-right">
                {formatNumber(item.count)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Empty State Component
const EmptyState = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Sprout className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Start by creating your first crop batch using the Assistant.
      </p>
    </div>
  );
};

const FarmerDashboard = () => {
  const toast = useToast();
  const { t } = useTranslation();
  const { formatNumber, formatCurrency } = useLocalizedNumber();
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard analytics from the new endpoint
      const response = await dashboardAPI.getFarmerDashboard();
      const data = response.data.data;

      setDashboardData(data);

      // Update stats from dashboard data
      if (data && data.metrics) {
        setStats({
          total: data.metrics.total_batches,
          active: data.metrics.active_batches,
          completed: data.metrics.completed_batches,
          revenue: data.metrics.total_revenue,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');

      // Fallback
      try {
        const response = await batchAPI.list();
        const originalBatches = (response.data || []).filter(batch => !batch.is_child_batch);

        const total = originalBatches.length;
        const active = originalBatches.filter(b => b.status !== 'SUSPENDED' && b.status !== 'SOLD').length;
        const completed = originalBatches.filter(b => b.status === 'SOLD').length;

        setStats({ total, active, completed, revenue: 0 });
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </MainLayout>
    );
  }

  // Check if farmer has no batches
  const hasNoBatches = !dashboardData?.has_batches && stats.total === 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
            <p className="text-gray-600">Manage your crop batches and track their progress</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {hasNoBatches ? (
          <EmptyState />
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.farmer.totalBatches')}</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.farmer.activeBatches')}</p>
                    <p className="text-2xl font-bold text-green-600">{formatNumber(stats.active)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.farmer.completedBatches')}</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatNumber(stats.completed)}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.farmer.totalRevenue')}</p>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.revenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                    <IndianRupee className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DonutChart
                data={dashboardData?.status_distribution || []}
                title={t('dashboard.farmer.batchDistribution')}
                colors={['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#6B7280', '#EC4899']}
              />
              <BarChart
                data={dashboardData?.crop_distribution || []}
                title={t('dashboard.farmer.batchDistribution')}
              />
            </div>

          </>
        )}

        {/* AgriChain Assistant */}
        <AssistantWidget onActionComplete={fetchDashboardData} />
      </div>
    </MainLayout>
  );
};

export default FarmerDashboard;
