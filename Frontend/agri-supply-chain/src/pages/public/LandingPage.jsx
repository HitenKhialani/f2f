import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Shield, Truck, Users, TrendingUp, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(`/${role.toLowerCase()}/dashboard`);
    }
  }, [isAuthenticated, role, navigate]);
  const stats = [
    { value: '10,000+', label: 'Active Indian Farmers', sublabel: 'Connected' },
    { value: '5M+', label: 'Products Tracked', sublabel: 'On Blockchain' },
    { value: '25+', label: 'States Covered', sublabel: 'Across India' },
    { value: '99.9%', label: 'Data Security', sublabel: 'Guaranteed' },
  ];

  const features = [
    {
      icon: <Sprout className="w-8 h-8 text-primary" />,
      title: 'Complete Crop Details',
      desc: 'Track complete crop journey from farm to consumer with blockchain verification',
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: 'Secure Blockchain',
      desc: 'Immutable records ensure complete transparency and trust in the supply chain',
    },
    {
      icon: <Truck className="w-8 h-8 text-primary" />,
      title: 'Real-time Tracking',
      desc: 'Monitor transport and logistics in real-time with GPS integration',
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: 'All Stakeholders',
      desc: 'Connect farmers, distributors, transporters, retailers and consumers seamlessly',
    },
  ];

  const crops = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Turmeric', 'Mustard'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-primary tracking-tight">AgriChain</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary font-medium transition-colors">Features</a>
              <a href="#crops" className="text-gray-600 hover:text-primary font-medium transition-colors">Crops</a>
              <a href="#stats" className="text-gray-600 hover:text-primary font-medium transition-colors">Impact</a>
              <Link to="/consumer/portal" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">Browse Produce</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-primary font-semibold hover:opacity-80 transition-opacity">
                Log In
              </Link>
              <Link to="/role-selection" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Blockchain-Verified Traceability
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transparent Agriculture <span className="text-primary">From Farm to Fork</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Secure the future of food with immutable blockchain records. Empowering farmers, distributors, and consumers with complete transparency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link to="/role-selection" className="btn-primary text-center text-lg px-8 py-4">
                  Get Started
                  <ChevronRight className="inline-block w-5 h-5 ml-1" />
                </Link>
                <Link to="/consumer/portal" className="btn-secondary text-center text-lg px-8 py-4">
                  Browse Produce
                </Link>
              </div>
              <div className="pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">Supported Crops:</p>
                <div className="flex flex-wrap gap-2">
                  {crops.map((crop) => (
                    <span key={crop} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-green-400/20 rounded-3xl transform rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1500382017468-1579e9c2118e?w=800&auto=format&fit=crop&q=80"
                alt="Indian Farming"
                className="relative rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">Rs 2.5 Cr+</p>
                    <p className="text-sm text-gray-500">Farmer Earnings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{stat.label}</p>
                <p className="text-xs text-gray-400">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose AgriChain?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete solution for digitizing Indian agriculture
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Join AgriChain Today
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Be part of India's most trusted agricultural supply chain platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/role-selection" className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-lg">
              Register Now
            </Link>
            <Link to="/consumer/portal" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors text-lg">
              Browse Produce
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold text-white">AgriChain</span>
              </div>
              <p className="text-sm">
                India's Trusted Agricultural Supply Chain Management System
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Stakeholders</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register/farmer" className="hover:text-white">Farmer</Link></li>
                <li><Link to="/register/distributor" className="hover:text-white">Distributor</Link></li>
                <li><Link to="/register/transporter" className="hover:text-white">Transporter</Link></li>
                <li><Link to="/register/retailer" className="hover:text-white">Retailer</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">API Documentation</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-sm">support@agrichain.in</p>
              <p className="text-sm">+91 1800-AGRICHAIN</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 AgriChain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
