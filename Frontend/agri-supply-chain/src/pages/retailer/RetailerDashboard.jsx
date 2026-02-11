import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  Plus,
  Search,
  Filter,
  Package,
  ShoppingCart,
  TrendingUp,
  IndianRupee
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { retailAPI } from '../../services/api';

const RetailerDashboard = () => {
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({
    inventory: 0,
    active: 0,
    sold: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await retailAPI.list();
      setListings(response.data);
      
      // Calculate stats
      const totalRevenue = response.data.reduce((acc, item) => {
        if (item.status === 'sold') {
          return acc + (item.farmer_base_price + item.transport_fees + item.distributor_margin + item.retailer_margin);
        }
        return acc;
      }, 0);

      setStats({
        inventory: response.data.length,
        active: response.data.filter(l => l.status === 'for_sale').length,
        sold: response.data.filter(l => l.status === 'sold').length,
        revenue: totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'sold') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Sold</span>;
    } else if (status === 'for_sale') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">For Sale</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Inactive</span>;
  };

  const calculateTotalPrice = (item) => {
    return item.farmer_base_price + item.transport_fees + item.distributor_margin + item.retailer_margin;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Retailer Dashboard</h1>
            <p className="text-gray-600">Manage inventory and sales</p>
          </div>
          <Link
            to="/retailer/listing/new"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Listing</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Inventory</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inventory}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Listings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sold</p>
                <p className="text-3xl font-bold text-gray-900">{stats.sold}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats.revenue.toLocaleString('hi-IN')}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <IndianRupee className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Listings Table */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Sale Listings</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search listings..."
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
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Batch Ref</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Crop Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price (₹)</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : listings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      <Store className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p>No listings found</p>
                      <Link
                        to="/retailer/listing/new"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:underline mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create First Listing
                      </Link>
                    </td>
                  </tr>
                ) : (
                  listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900">
                          {listing.batch?.product_batch_id?.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {listing.batch?.crop_type}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          ₹{calculateTotalPrice(listing).toLocaleString('hi-IN')}
                        </span>
                        <span className="text-xs text-gray-500 block">
                          (Farmer: ₹{listing.farmer_base_price} + Transport: ₹{listing.transport_fees} + Margin)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(listing.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(listing.created_at).toLocaleDateString('hi-IN')}
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
