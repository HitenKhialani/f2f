import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Boxes, CreditCard, Package, Truck,
  Navigation, CheckCircle, ShoppingCart, PackageCheck,
  PlusCircle, User, Shield, FileCheck, Users, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const MobileBottomNav = () => {
  const location = useLocation();
  const { role } = useAuth();

  const getNavItems = () => {
    const baseItems = {
      FARMER: [
        { path: '/farmer/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/farmer/batches', icon: <Boxes className="w-5 h-5" />, label: 'Batches' },
        { path: '/farmer/payments', icon: <CreditCard className="w-5 h-5" />, label: 'Payments' },
        { path: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
      ],
      DISTRIBUTOR: [
        { path: '/distributor/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/distributor/incoming', icon: <Package className="w-5 h-5" />, label: 'Incoming' },
        { path: '/distributor/inventory', icon: <Boxes className="w-5 h-5" />, label: 'Inventory' },
        { path: '/distributor/outgoing', icon: <Truck className="w-5 h-5" />, label: 'Outgoing' },
      ],
      TRANSPORTER: [
        { path: '/transporter/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/transporter/farmer-shipments', icon: <Package className="w-5 h-5" />, label: 'Farmer' },
        { path: '/transporter/in-transit', icon: <Navigation className="w-5 h-5" />, label: 'Transit' },
        { path: '/transporter/completed', icon: <CheckCircle className="w-5 h-5" />, label: 'Done' },
      ],
      RETAILER: [
        { path: '/retailer/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/retailer/incoming', icon: <Truck className="w-5 h-5" />, label: 'Incoming' },
        { path: '/retailer/listed', icon: <ShoppingCart className="w-5 h-5" />, label: 'Listed' },
        { path: '/retailer/sold', icon: <CheckCircle className="w-5 h-5" />, label: 'Sold' },
      ],
      CONSUMER: [
        { path: '/consumer/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
      ],
      ADMIN: [
        { path: '/admin/dashboard', icon: <Shield className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/admin/kyc', icon: <FileCheck className="w-5 h-5" />, label: 'KYC' },
        { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
      ],
    };

    const items = baseItems[role] || [];

    // Add Settings at the end for all roles
    return [
      ...items,
      { path: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' }
    ];
  };

  const navItems = getNavItems();
  if (!navItems.length) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden h-16 bg-emerald-50/95 dark:bg-cosmos-800/95 backdrop-blur-lg border-t border-emerald-200 dark:border-cosmos-700 flex items-center justify-around px-2 safe-area-inset-bottom">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all min-w-0 ${isActive
              ? 'text-emerald-700 dark:text-cosmos-300'
              : 'text-emerald-400 dark:text-cosmos-400 hover:text-emerald-600 dark:hover:text-cosmos-300'
              }`}
          >
            <span className={`${isActive ? 'bg-emerald-100 dark:bg-cosmos-700 p-2 rounded-lg' : ''} transition-all flex items-center justify-center`}>
              {item.icon}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[48px]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
