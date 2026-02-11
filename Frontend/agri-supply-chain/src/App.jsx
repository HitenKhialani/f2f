import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './components/admin/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import RoleSelection from './pages/public/RoleSelection';
import LoginPage from './pages/public/LoginPage';
import ConsumerTrace from './pages/public/ConsumerTrace';

// Auth Pages
import RegistrationPage from './pages/auth/RegistrationPage';
import KYCPendingPage from './pages/auth/KYCPendingPage';
import KYCRejectedPage from './pages/auth/KYCRejectedPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import KYCManagement from './pages/admin/KYCManagement';
import UserManagement from './pages/admin/UserManagement';
// Role Dashboards
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import DistributorDashboard from './pages/distributor/DistributorDashboard';
import TransporterDashboard from './pages/transporter/TransporterDashboard';
import RetailerDashboard from './pages/retailer/RetailerDashboard';
import ConsumerDashboard from './pages/consumer/ConsumerDashboard';

// Admin Protected Route
const AdminProtectedRoute = ({ children }) => {
  const { user, role, kycStatus } = useAuth();
  const isAuthenticated = !!user;
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (role?.toLowerCase() !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (kycStatus === 'PENDING') {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (kycStatus === 'REJECTED') {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role } = useAuth();
  const isAuthenticated = !!user;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Public Route (don't redirect if authenticated)
const PublicRoute = ({ children }) => {
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/role-selection" element={<PublicRoute><RoleSelection /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/consumer/trace" element={<ConsumerTrace />} />
        
        {/* Registration */}
        <Route path="/register/:role" element={<RegistrationPage />} />
        
        {/* KYC Status Pages */}
        <Route path="/kyc-pending" element={<KYCPendingPage />} />
        <Route path="/kyc-rejected" element={<KYCRejectedPage />} />
        
        {/* Admin Routes - Separate from main app */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="kyc" element={<KYCManagement />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
        
        {/* Farmer Routes */}
        <Route 
          path="/farmer/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <FarmerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Distributor Routes */}
        <Route 
          path="/distributor/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['DISTRIBUTOR']}>
              <DistributorDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Transporter Routes */}
        <Route 
          path="/transporter/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['TRANSPORTER']}>
              <TransporterDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Retailer Routes */}
        <Route 
          path="/retailer/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['RETAILER']}>
              <RetailerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Consumer Routes */}
        <Route 
          path="/consumer/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['CONSUMER']}>
              <ConsumerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
