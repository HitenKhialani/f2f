import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Truck, Store, ShoppingCart, User, ArrowRight } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'farmer',
      icon: <Sprout className="w-12 h-12" />,
      title: 'Farmer',
      subtitle: 'Crop Production & Batch Management',
      description: 'Manage crop production and create batches for tracking',
      features: ['Create crop batches', 'Upload certificates', 'Connect with distributors'],
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: 'distributor',
      icon: <Store className="w-12 h-12" />,
      title: 'Distributor',
      subtitle: 'Crop Inspection & Storage',
      description: 'Inspect crop quality and manage storage facilities',
      features: ['Inspect incoming crops', 'Create quality reports', 'Sell to retailers'],
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'transporter',
      icon: <Truck className="w-12 h-12" />,
      title: 'Transporter',
      subtitle: 'Transport & Logistics',
      description: 'Provide fast and secure transport services for crops',
      features: ['View transport requests', 'Real-time tracking', 'Delivery proof'],
      color: 'from-orange-500 to-amber-600',
    },
    {
      id: 'retailer',
      icon: <ShoppingCart className="w-12 h-12" />,
      title: 'Retailer',
      subtitle: 'Stock Management & Sales',
      description: 'Manage inventory and sell to consumers',
      features: ['View inventory', 'Create sale listings', 'Connect with consumers'],
      color: 'from-purple-500 to-violet-600',
    },
    {
      id: 'consumer',
      icon: <User className="w-12 h-12" />,
      title: 'Consumer',
      subtitle: 'Traceability & Verification',
      description: 'Check crop origin and verify authenticity',
      features: ['Scan QR code', 'View crop history', 'Trusted purchases'],
      color: 'from-rose-500 to-pink-600',
    },
  ];

  const handleRoleSelect = (roleId) => {
    navigate(`/register/${roleId}`);
  };

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">AgriChain</span>
            </Link>
            <Link to="/login" className="text-primary font-semibold hover:opacity-80">
              Already registered? Log in
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Select Your Role
          </h1>
          <p className="text-xl text-gray-600">
            Choose your role in the agricultural supply chain
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden"
            >
              {/* Top Gradient Bar */}
              <div className={`h-2 bg-gradient-to-r ${role.color}`}></div>
              
              <div className="p-6">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${role.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {role.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{role.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{role.subtitle}</p>
                <p className="text-gray-600 mb-4">{role.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-primary hover:text-white text-gray-700 rounded-xl font-medium transition-colors group-hover:bg-primary group-hover:text-white">
                  <span>Register</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Already part of AgriChain?
          </p>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            <span>Log in</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default RoleSelection;
