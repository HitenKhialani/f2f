import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  Truck,
  Store,
  ShoppingCart,
  User,
  Shield,
  FileCheck,
  Users,
  LogOut,
  ChevronRight,
  Package,
  Navigation,
  CheckCircle,
  Boxes,
  PackageCheck,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const items = {
      ADMIN: [
        { path: '/admin/dashboard', icon: <Shield className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/admin/kyc', icon: <FileCheck className="w-5 h-5" />, label: 'KYC Requests' },
        { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
      ],
      FARMER: [
        { path: '/farmer/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/farmer/batches', icon: <Boxes className="w-5 h-5" />, label: 'My Batches' },
      ],
      DISTRIBUTOR: [
        { path: '/distributor/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/distributor/incoming', icon: <Package className="w-5 h-5" />, label: 'Incoming' },
        { path: '/distributor/inventory', icon: <Boxes className="w-5 h-5" />, label: 'Inventory' },
        { path: '/distributor/outgoing', icon: <Truck className="w-5 h-5" />, label: 'Outgoing' },
      ],
      TRANSPORTER: [
        { path: '/transporter/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/transporter/farmer-shipments', icon: <Package className="w-5 h-5" />, label: 'Farmer Shipments' },
        { path: '/transporter/distributor-shipments', icon: <Truck className="w-5 h-5" />, label: 'Distributor Shipments' },
        { path: '/transporter/in-transit', icon: <Navigation className="w-5 h-5" />, label: 'In Transit' },
        { path: '/transporter/completed', icon: <CheckCircle className="w-5 h-5" />, label: 'Completed' },
      ],
      RETAILER: [
        { path: '/retailer/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/retailer/incoming', icon: <Truck className="w-5 h-5" />, label: 'Incoming Transport' },
        { path: '/retailer/received', icon: <PackageCheck className="w-5 h-5" />, label: 'Received' },
        { path: '/retailer/listed', icon: <ShoppingCart className="w-5 h-5" />, label: 'Listed' },
        { path: '/retailer/sold', icon: <CheckCircle className="w-5 h-5" />, label: 'Sold' },
        { path: '/retailer/listing/new', icon: <PlusCircle className="w-5 h-5" />, label: 'New Listing' },
      ],
      CONSUMER: [
        { path: '/consumer/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
      ],
    };
    return items[role] || [];
  };

  const menuItems = getMenuItems();

  const getRoleLabel = () => {
    const labels = {
      ADMIN: 'Administrator',
      FARMER: 'Farmer',
      DISTRIBUTOR: 'Distributor',
      TRANSPORTER: 'Transporter',
      RETAILER: 'Retailer',
      CONSUMER: 'Consumer',
    };
    return labels[role] || role;
  };

  return (
    <aside className="w-64 bg-emerald-50 border-r border-emerald-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-emerald-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-emerald-900">AgriChain</span>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3">
        <div className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-medium text-center border border-emerald-200">
          {getRoleLabel()}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === item.path 
                ? 'bg-emerald-600 text-white' 
                : 'text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900'
            }`}
          >
            <span className={location.pathname === item.path ? 'text-white' : 'text-emerald-500'}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-emerald-200 space-y-2">
        <Link
          to="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 transition-colors"
        >
          <User className="w-5 h-5 text-emerald-500" />
          <span>Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
