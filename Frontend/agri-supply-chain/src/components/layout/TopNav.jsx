import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Bell, User, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TopNav = () => {
  const { user, role, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const getRoleBadgeColor = () => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-700',
      FARMER: 'bg-green-100 text-green-700',
      DISTRIBUTOR: 'bg-blue-100 text-blue-700',
      TRANSPORTER: 'bg-orange-100 text-orange-700',
      RETAILER: 'bg-pink-100 text-pink-700',
      CONSUMER: 'bg-gray-100 text-gray-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getRoleLabel = () => {
    const labels = {
      ADMIN: 'Admin',
      FARMER: 'Farmer',
      DISTRIBUTOR: 'Distributor',
      TRANSPORTER: 'Transporter',
      RETAILER: 'Retailer',
      CONSUMER: 'Consumer',
    };
    return labels[role] || role;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Breadcrumb/Title */}
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {/* This can be dynamic based on route */}
            </h2>
          </div>

          {/* Center - Role Badge */}
          <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
            {getRoleLabel()}
          </div>

          {/* Right - User Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {user?.username || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
