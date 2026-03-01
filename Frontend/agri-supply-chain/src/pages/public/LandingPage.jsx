import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useLenis from '../../hooks/useLenis';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../../hooks/useDarkMode';
import {
  Sprout, Menu, X, Truck, Shield, CheckCircle, QrCode, Package,
  ShoppingCart, Github, Twitter, ChevronDown, ArrowRight, Globe, Sun, Moon,
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'mr', name: 'मराठी' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'ta', name: 'தமிழ்' },
];

export default function LandingPage() {
  useLenis();
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [isDark, setIsDark] = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && role) navigate(`/${role.toLowerCase()}/dashboard`);
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Floating particles for hero section
  const FloatingParticles = () => {
    const particles = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      size: Math.random() * 12 + 4,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 3 + 3,
      delay: Math.random() * 2,
    }));

    return (
      <>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-emerald-300/20"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </>
    );
  };

  // Navbar Component
  const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center group-hover:bg-emerald-700 transition">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-emerald-900">AgriChain</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="#how-it-works"
              className="text-gray-700 hover:text-emerald-600 transition font-medium"
            >
              How It Works
            </Link>
            <Link
              to="#features"
              className="text-gray-700 hover:text-emerald-600 transition font-medium"
            >
              Features
            </Link>
            <Link
              to="#trace-demo"
              className="text-gray-700 hover:text-emerald-600 transition font-medium"
            >
              Trace Demo
            </Link>
            <Link
              to="/consumer/portal"
              className="text-gray-700 hover:text-emerald-600 transition font-medium"
            >
              Browse Produce
            </Link>
          </div>

          {/* Desktop right: lang + dark + auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button onClick={() => setLangOpen(!langOpen)} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors">
                <Globe className="w-5 h-5" />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-emerald-100 py-2 z-50">
                  {LANGUAGES.map(lang => (
                    <button key={lang.code} onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 transition-colors ${i18n.language === lang.code ? 'text-emerald-700 font-semibold' : 'text-gray-700'}`}>
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Dark mode toggle */}
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isAuthenticated ? (
              <Link
                to={`/${role?.toLowerCase()}/dashboard`}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold transition-colors"
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-emerald-700 font-semibold hover:text-emerald-900 transition-colors text-sm">
                  Log In
                </Link>
                <Link to="/role-selection" className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold transition-colors text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-emerald-100 bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col gap-3 pt-4">
              <Link
                to="#how-it-works"
                className="px-4 py-2 text-gray-700 hover:bg-emerald-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                to="#features"
                className="px-4 py-2 text-gray-700 hover:bg-emerald-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="#trace-demo"
                className="px-4 py-2 text-gray-700 hover:bg-emerald-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trace Demo
              </Link>
              <Link
                to="/consumer/portal"
                className="px-4 py-2 text-gray-700 hover:bg-emerald-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Produce
              </Link>
              <Link
                to="/role-selection"
                className="mx-4 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="mx-4 px-4 py-2.5 border border-emerald-300 text-emerald-700 rounded-xl font-semibold transition-colors text-center hover:bg-emerald-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  // Hero Section
  const HeroSection = () => (
    <section
      id="hero"
      className="relative min-h-screen md:min-h-screen pt-20 overflow-hidden flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0b3620 0%, #0f4725 25%, #14522d 50%, #0f4725 75%, #0b3620 100%)',
        backgroundSize: '200% 200%',
        animation: 'heroGradient 8s ease infinite',
      }}
    >
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1500382017468-1579e9c2118e?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800/50 text-emerald-200 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-emerald-700/50">
          <span>🌱</span>
          <span>Blockchain Verified Supply Chain</span>
        </div>

        {/* H1 - 3 lines */}
        <h1 className="text-5xl md:text-8xl font-black text-white leading-none mb-6 tracking-tight">
          From Farm<br />
          To Your Fork<br />
          With Trust
        </h1>

        {/* Subtext */}
        <p className="text-emerald-200 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          Track every step of your agricultural products from harvest to table. Transparent, secure, and verifiable.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            to="/consumer/trace"
            className="px-8 py-4 bg-white text-emerald-900 font-semibold rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl"
          >
            Trace a Product
          </Link>
          <Link
            to="/role-selection"
            className="px-8 py-4 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-xl border border-emerald-500 hover:scale-105 transition-transform duration-300"
          >
            Join as Farmer
          </Link>
        </div>

        {/* Marquee - Scrolling Crops */}
        <div className="overflow-hidden bg-emerald-900/30 backdrop-blur-sm border-t border-b border-emerald-700/50 py-4 mb-12">
          <div
            className="whitespace-nowrap text-emerald-400 font-medium"
            style={{
              animation: 'marquee 20s linear infinite',
              display: 'inline-block',
              paddingRight: '50%',
            }}
          >
            Wheat • Rice • Cotton • Sugarcane • Turmeric • Mustard • Soybean • Chickpea • Wheat • Rice • Cotton • Sugarcane • Turmeric • Mustard • Soybean • Chickpea •
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="flex justify-center animate-bounce">
          <ChevronDown className="w-6 h-6 text-emerald-300" />
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes heroGradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );

  return (
    <div className="bg-white">
      {/* CSS Animations */}
      <style>{`
        @keyframes heroGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <Navbar />
      <HeroSection />

      {/* Stats Bar */}
      <section className="bg-emerald-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-black">10,000+</div>
            <div className="text-emerald-200 text-sm font-medium mt-2">Farmers</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black">5M+</div>
            <div className="text-emerald-200 text-sm font-medium mt-2">Products</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black">25+</div>
            <div className="text-emerald-200 text-sm font-medium mt-2">States</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black">99.9%</div>
            <div className="text-emerald-200 text-sm font-medium mt-2">Security</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-emerald-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-emerald-900 text-center mb-16">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200 z-0" />

            {/* Step 1: Farmer Onboarding */}
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-yellow-400 text-emerald-900 font-black text-2xl flex items-center justify-center shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Farmer Onboarding</h3>
              <p className="text-gray-700 text-sm">Register your farm and crops on the platform</p>
            </div>

            {/* Step 2: Secure Transport */}
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-yellow-400 text-emerald-900 font-black text-2xl flex items-center justify-center shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Secure Transport</h3>
              <p className="text-gray-700 text-sm">Track shipments with GPS and blockchain</p>
            </div>

            {/* Step 3: Smart Distribution */}
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-yellow-400 text-emerald-900 font-black text-2xl flex items-center justify-center shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Smart Distribution</h3>
              <p className="text-gray-700 text-sm">Automated routing and inventory management</p>
            </div>

            {/* Step 4: Retailer Check */}
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-yellow-400 text-emerald-900 font-black text-2xl flex items-center justify-center shadow-lg">
                4
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Retailer Check</h3>
              <p className="text-gray-700 text-sm">Verify authenticity at distribution points</p>
            </div>

            {/* Step 5: Consumer Scan */}
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-yellow-400 text-emerald-900 font-black text-2xl flex items-center justify-center shadow-lg">
                5
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Consumer Scan</h3>
              <p className="text-gray-700 text-sm">Scan QR code to view full product journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Platform Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Farmer Portfolios */}
            <div className="rounded-2xl p-6 border border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Farmer Portfolios</h3>
              <p className="text-green-800 text-sm mb-4">Showcase your crops and build your farmer brand</p>
              <a href="#" className="text-green-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Learn More <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Feature 2: Blockchain Tracking */}
            <div className="rounded-2xl p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Blockchain Tracking</h3>
              <p className="text-blue-800 text-sm mb-4">Immutable records of every transaction</p>
              <a href="#" className="text-blue-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Learn More <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Feature 3: QR Verification */}
            <div className="rounded-2xl p-6 border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-900 mb-2">QR Verification</h3>
              <p className="text-purple-800 text-sm mb-4">One-tap verification for consumers</p>
              <a href="#" className="text-purple-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Learn More <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Feature 4: Smart Contracts */}
            <div className="rounded-2xl p-6 border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-yellow-900 mb-2">Smart Contracts</h3>
              <p className="text-yellow-800 text-sm mb-4">Automated payments and agreements</p>
              <a href="#" className="text-yellow-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Learn More <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Feature 5: Secure Payments */}
            <div className="rounded-2xl p-6 border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-orange-900 mb-2">Secure Payments</h3>
              <p className="text-orange-800 text-sm mb-4">Fast settlements with multiple payment options</p>
              <a href="#" className="text-orange-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Learn More <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Feature 6: Analytics */}
            <div className="rounded-2xl p-6 border border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-pink-900 mb-2">Analytics</h3>
              <p className="text-pink-800 text-sm mb-4">Insights into market trends and pricing</p>
              <a href="#" className="text-pink-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Learn More <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Live Trace Demo */}
      <section id="trace-demo" className="bg-gray-900 py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">See It In Action</h2>

          {/* Mock Trace Card */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl mb-8">
            {/* Batch ID */}
            <div className="font-mono text-yellow-400 text-lg font-bold mb-4">#AC-8821-COL</div>

            {/* Status Badges */}
            <div className="flex gap-3 mb-6">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/50">
                VERIFIED
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/50">
                IN-TRANSIT
              </span>
            </div>

            {/* Product Info */}
            <div className="mb-6 pb-6 border-b border-gray-700">
              <h3 className="text-white text-xl font-bold mb-2">Premium Basmati Rice</h3>
              <p className="text-gray-400">Origin: Punjab, India</p>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600">
                <QrCode className="w-12 h-12 text-gray-600" />
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 mb-8">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center pt-1">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div className="w-0.5 h-12 bg-green-400/30 my-1" />
                </div>
                <div>
                  <p className="text-white font-semibold">Harvested</p>
                  <p className="text-gray-500 text-sm">2 days ago</p>
                </div>
              </div>

              {/* Step 2 - In Progress */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-400 animate-pulse" />
                  <div className="w-0.5 h-12 bg-blue-400/30 my-1" />
                </div>
                <div>
                  <p className="text-white font-semibold">En Route</p>
                  <p className="text-gray-500 text-sm">In progress</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                </div>
                <div>
                  <p className="text-white font-semibold">At Retailer</p>
                  <p className="text-gray-500 text-sm">Tomorrow</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors">
              Scan QR to Verify
            </button>
          </div>

          {/* Text Below Card */}
          <div className="text-center">
            <p className="text-gray-400 mb-4">Try it yourself - scan any AgriChain product</p>
            <Link
              to="/consumer/trace"
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Try Live Trace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="bg-emerald-900 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Built For Everyone</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Farmer Role */}
            <div className="bg-emerald-800/50 rounded-2xl p-6 border border-emerald-700 hover:bg-emerald-700/50 transition-colors group cursor-pointer">
              <Sprout className="w-12 h-12 text-emerald-300 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Farmers</h3>
              <p className="text-emerald-200 text-sm mb-6">Register crops, track earnings, get paid faster</p>
              <Link
                to="/role-selection"
                className="text-yellow-400 font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all"
              >
                Register as Farmer <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Distributor Role */}
            <div className="bg-emerald-800/50 rounded-2xl p-6 border border-emerald-700 hover:bg-emerald-700/50 transition-colors group cursor-pointer">
              <Package className="w-12 h-12 text-emerald-300 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Distributors</h3>
              <p className="text-emerald-200 text-sm mb-6">Manage inventory with real-time visibility</p>
              <Link
                to="/role-selection"
                className="text-yellow-400 font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all"
              >
                Register as Distributor <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Transporter Role */}
            <div className="bg-emerald-800/50 rounded-2xl p-6 border border-emerald-700 hover:bg-emerald-700/50 transition-colors group cursor-pointer">
              <Truck className="w-12 h-12 text-emerald-300 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Transporters</h3>
              <p className="text-emerald-200 text-sm mb-6">GPS-tracked deliveries with proof of transport</p>
              <Link
                to="/role-selection"
                className="text-yellow-400 font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all"
              >
                Register as Transporter <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Retailer Role */}
            <div className="bg-emerald-800/50 rounded-2xl p-6 border border-emerald-700 hover:bg-emerald-700/50 transition-colors group cursor-pointer">
              <ShoppingCart className="w-12 h-12 text-emerald-300 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Retailers</h3>
              <p className="text-emerald-200 text-sm mb-6">Verify authenticity and manage listings</p>
              <Link
                to="/role-selection"
                className="text-yellow-400 font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all"
              >
                Register as Retailer <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="relative py-20 px-4 overflow-hidden">
        {/* Gradient Background */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900"
          style={{
            backgroundSize: '200% 200%',
            animation: 'heroGradient 8s ease infinite',
          }}
        />

        {/* Floating Orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Ready to Transform Agriculture?</h2>
          <p className="text-emerald-200 text-lg mb-10">Join thousands of farmers, distributors, and retailers building a transparent food supply chain.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/role-selection"
              className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-emerald-900 font-semibold rounded-xl transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/consumer/portal"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Browse Produce
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-4">
        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1: Logo & Tagline */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black text-white">AgriChain</span>
              </div>
              <p className="text-sm mb-4">Blockchain-verified supply chain for Indian agriculture.</p>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Stakeholders */}
            <div>
              <h4 className="text-white font-semibold mb-4">For Stakeholders</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/role-selection" className="hover:text-emerald-400 transition">
                    Farmers
                  </Link>
                </li>
                <li>
                  <Link to="/role-selection" className="hover:text-emerald-400 transition">
                    Distributors
                  </Link>
                </li>
                <li>
                  <Link to="/role-selection" className="hover:text-emerald-400 transition">
                    Transporters
                  </Link>
                </li>
                <li>
                  <Link to="/role-selection" className="hover:text-emerald-400 transition">
                    Retailers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:support@agrichain.com" className="hover:text-emerald-400 transition">
                    support@agrichain.com
                  </a>
                </li>
                <li>
                  <a href="tel:+919876543210" className="hover:text-emerald-400 transition">
                    +91 9876 543 210
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>© 2024 AgriChain. All rights reserved. | Made with ❤️ for Indian Farmers</p>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex justify-around">
        <Link to="/" className="flex-1 flex items-center justify-center py-4 text-gray-600 hover:text-emerald-600 transition border-r border-gray-200 last:border-r-0">
          <Sprout className="w-6 h-6" />
        </Link>
        <Link to="/consumer/trace" className="flex-1 flex items-center justify-center py-4 text-gray-600 hover:text-emerald-600 transition border-r border-gray-200 last:border-r-0">
          <QrCode className="w-6 h-6" />
        </Link>
        <Link to="/consumer/portal" className="flex-1 flex items-center justify-center py-4 text-gray-600 hover:text-emerald-600 transition border-r border-gray-200 last:border-r-0">
          <ShoppingCart className="w-6 h-6" />
        </Link>
        <Link to={isAuthenticated ? `/${role}/dashboard` : '/auth/login'} className="flex-1 flex items-center justify-center py-4 text-gray-600 hover:text-emerald-600 transition">
          <Package className="w-6 h-6" />
        </Link>
      </nav>

      {/* Add bottom padding to account for mobile nav */}
      <div className="md:hidden h-20" />
    </div>
  );
}
