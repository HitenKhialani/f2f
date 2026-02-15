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
  ChevronRight
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
      ],
      DISTRIBUTOR: [
        { path: '/distributor/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
      ],
      TRANSPORTER: [
        { path: '/transporter/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
      ],
      RETAILER: [
        { path: '/retailer/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/retailer/listing/new', icon: <ShoppingCart className="w-5 h-5" />, label: 'New Listing' },
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
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-primary">AgriChain</span>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3">
        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium text-center">
          {getRoleLabel()}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <Link
          to="/profile"
          className="sidebar-link"
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full sidebar-link text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
