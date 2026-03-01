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
  PlusCircle,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const items = {
      ADMIN: [
        { path: '/admin/dashboard', icon: <Shield className="w-5 h-5" />, label: t('sidebar.dashboard', 'Dashboard') },
        { path: '/admin/kyc', icon: <FileCheck className="w-5 h-5" />, label: t('sidebar.kyc', 'KYC Requests') },
        { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: t('sidebar.users', 'Users') },
      ],
      FARMER: [
        { path: '/farmer/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: t('sidebar.dashboard', 'Dashboard') },
        { path: '/farmer/batches', icon: <Boxes className="w-5 h-5" />, label: t('sidebar.myBatches', 'My Batches') },
        { path: '/farmer/payments', icon: <CreditCard className="w-5 h-5" />, label: t('sidebar.payments', 'Payments') },
      ],
      DISTRIBUTOR: [
        { path: '/distributor/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: t('sidebar.dashboard', 'Dashboard') },
        { path: '/distributor/incoming', icon: <Package className="w-5 h-5" />, label: t('sidebar.incoming', 'Incoming') },
        { path: '/distributor/inventory', icon: <Boxes className="w-5 h-5" />, label: t('sidebar.inventory', 'Inventory') },
        { path: '/distributor/outgoing', icon: <Truck className="w-5 h-5" />, label: t('sidebar.outgoing', 'Outgoing') },
        { path: '/distributor/payments', icon: <CreditCard className="w-5 h-5" />, label: t('sidebar.payments', 'Payments') },
      ],
      TRANSPORTER: [
        { path: '/transporter/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: t('sidebar.dashboard', 'Dashboard') },
        { path: '/transporter/farmer-shipments', icon: <Package className="w-5 h-5" />, label: t('sidebar.farmerShipments', 'Farmer Shipments') },
        { path: '/transporter/distributor-shipments', icon: <Truck className="w-5 h-5" />, label: t('sidebar.distributorShipments', 'Distributor Shipments') },
        { path: '/transporter/in-transit', icon: <Navigation className="w-5 h-5" />, label: t('sidebar.inTransit', 'In Transit') },
        { path: '/transporter/completed', icon: <CheckCircle className="w-5 h-5" />, label: t('sidebar.completed', 'Completed') },
        { path: '/transporter/payments', icon: <CreditCard className="w-5 h-5" />, label: t('sidebar.payments', 'Payments') },
      ],
      RETAILER: [
        { path: '/retailer/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: t('sidebar.dashboard', 'Dashboard') },
        { path: '/retailer/incoming', icon: <Truck className="w-5 h-5" />, label: t('sidebar.incomingTransport', 'Incoming Transport') },
        { path: '/retailer/received', icon: <PackageCheck className="w-5 h-5" />, label: t('sidebar.received', 'Received') },
        { path: '/retailer/listed', icon: <ShoppingCart className="w-5 h-5" />, label: t('sidebar.listed', 'Listed') },
        { path: '/retailer/sold', icon: <CheckCircle className="w-5 h-5" />, label: t('sidebar.sold', 'Sold') },
        { path: '/retailer/listing/new', icon: <PlusCircle className="w-5 h-5" />, label: t('sidebar.newListing', 'New Listing') },
        { path: '/retailer/payments', icon: <CreditCard className="w-5 h-5" />, label: t('sidebar.payments', 'Payments') },
      ],
      CONSUMER: [
        { path: '/consumer/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: t('sidebar.dashboard', 'Dashboard') },
      ],
    };
    return items[role] || [];
  };

  const menuItems = getMenuItems();

  const getRoleLabel = () => {
    const labels = {
      ADMIN: t('roles.admin', 'Administrator'),
      FARMER: t('roles.farmer', 'Farmer'),
      DISTRIBUTOR: t('roles.distributor', 'Distributor'),
      TRANSPORTER: t('roles.transporter', 'Transporter'),
      RETAILER: t('roles.retailer', 'Retailer'),
      CONSUMER: t('roles.consumer', 'Consumer'),
    };
    return labels[role] || role;
  };

  return (
    <aside className="w-64 bg-emerald-50 dark:bg-cosmos-800 border-r border-emerald-200 dark:border-cosmos-700 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-emerald-200 dark:border-cosmos-700">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-emerald-600 dark:bg-emerald-700 p-1.5 rounded-lg">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-emerald-900 dark:text-cosmos-300">AgriChain</span>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3">
        <div className="bg-emerald-100 dark:bg-cosmos-700 text-emerald-800 dark:text-cosmos-300 px-3 py-1.5 rounded-full text-sm font-medium text-center border border-emerald-200 dark:border-cosmos-600">
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
                ? 'bg-emerald-600 dark:bg-cosmos-600 text-white'
                : 'text-emerald-700 dark:text-cosmos-400 hover:bg-emerald-100 dark:hover:bg-cosmos-700 hover:text-emerald-900 dark:hover:text-cosmos-300'
            }`}
          >
            <span className={location.pathname === item.path ? 'text-white' : 'text-emerald-500 dark:text-cosmos-400'}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-emerald-200 dark:border-cosmos-700 space-y-2 bg-emerald-50/80 dark:bg-cosmos-900/50">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-700 dark:text-cosmos-400 hover:bg-emerald-100 dark:hover:bg-cosmos-700 hover:text-emerald-900 dark:hover:text-cosmos-300 transition-colors"
        >
          <User className="w-5 h-5 text-emerald-500 dark:text-cosmos-400" />
          <span>{t('navbar.profile', 'Profile & Settings')}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('navbar.logout', 'Log Out')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
