import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Sprout,
  ScanLine,
  Search,
  ArrowLeft,
  Truck,
  ClipboardCheck,
  Store,
  CheckCircle,
  AlertCircle,
  MapPin,
  User,
  Calendar,
  ArrowRight,
  ChevronRight,
  Leaf,
  Warehouse,
  Package,
  Clock,
  ExternalLink,
  FileText,
  Thermometer,
  Droplets
} from 'lucide-react';
import { consumerAPI, inspectionAPI } from '../../services/api';
import { InspectionTimeline } from '../../components/inspection';

const ConsumerTrace = () => {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [batchIdTerm, setBatchIdTerm] = useState(publicId || '');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [loadingInspections, setLoadingInspections] = useState(false);

  useEffect(() => {
    if (publicId) {
      performTrace(publicId);
    }
  }, [publicId]);

  const performTrace = async (id) => {
    setLoading(true);
    setError(null);
    setInspections([]);
    try {
      const response = await consumerAPI.traceBatch(id);
      setSearchResult(response.data);
      // Fetch inspections for this batch
      if (response.data?.batch_id) {
        fetchInspections(response.data.batch_id);
      }
    } catch (err) {
      console.error('Error tracing batch:', err);
      setError(err.response?.data?.message || 'Batch not found. Please verify the ID.');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchInspections = async (batchId) => {
    try {
      setLoadingInspections(true);
      const response = await inspectionAPI.getBatchTimeline(batchId);
      setInspections(response.data);
    } catch (err) {
      console.log('No inspections available for this batch');
      setInspections([]);
    } finally {
      setLoadingInspections(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!batchIdTerm.trim()) return;
    performTrace(batchIdTerm.trim());
  };

  const handleDownloadQR = () => {
    if (!searchResult?.qr_code_url) return;
    const link = document.createElement('a');
    link.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${searchResult.qr_code_url}`;
    link.download = `QR_${searchResult.batch_id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStakeholderIcon = (role) => {
    const r = role.toLowerCase();
    if (r.includes('farmer')) return <Sprout className="w-5 h-5 text-green-600" />;
    if (r.includes('transport')) return <Truck className="w-5 h-5 text-blue-600" />;
    if (r.includes('distributor')) return <Warehouse className="w-5 h-5 text-purple-600" />;
    if (r.includes('retail')) return <Store className="w-5 h-5 text-orange-600" />;
    return <User className="w-5 h-5 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-medium">Fetching Traceability Data...</p>
        </div>
      </div>
    );
  }

  // Error or Initial state (if no publicId in URL and no search result)
  if (!searchResult || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error ? 'Trace Failed' : 'Batch Not Found'}</h2>
          <p className="text-gray-500 mb-8">{error || 'Please verify the Batch ID and try again.'}</p>

          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="text"
              value={batchIdTerm}
              onChange={(e) => setBatchIdTerm(e.target.value)}
              placeholder="Enter Batch ID"
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary transition-all outline-none"
            />
            <button className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              <span>Retry Search</span>
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="mt-6 text-sm text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Small Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-black text-primary tracking-tighter">AgriChain</Link>
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium text-gray-500 hover:text-primary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Search Again
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6 pb-20">

        {/* A. PRODUCT SUMMARY CARD */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-5">
            <div className="p-6 md:col-span-3 space-y-4">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                Product Summary
              </span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 capitalize">{searchResult.product_name}</h1>
                <p className="text-gray-400 text-xs mt-1">BATCH: {searchResult.batch_id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quantity</p>
                  <p className="text-lg font-bold text-gray-900">{searchResult.quantity}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Retail Price</p>
                  <p className="text-lg font-bold text-emerald-700">₹{searchResult.retail_price} / kg</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  {searchResult.status}
                </span>
              </div>
            </div>

            <div className="p-6 md:col-span-2 bg-gray-50/50 flex flex-col items-center justify-center border-l border-gray-100 text-center">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-3">
                {searchResult.qr_code_url ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${searchResult.qr_code_url}`}
                    alt="QR Code"
                    className="w-28 h-28"
                  />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center text-gray-300">
                    <ScanLine className="w-10 h-10" />
                  </div>
                )}
              </div>
              <button
                onClick={handleDownloadQR}
                className="text-xs font-bold text-gray-500 hover:text-emerald-600 uppercase tracking-wider py-2 px-4 border border-gray-200 rounded-lg hover:bg-white transition-all"
              >
                Download QR
              </button>
            </div>
          </div>
        </section>

        {/* B. PRICE JOURNEY - Farm to Retail */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Price Journey <span className="text-gray-400 font-normal">— Farm to Retail</span>
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {/* Farmer Base */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Farmer Base</p>
              <p className="text-lg font-bold text-gray-900">₹{searchResult.price_breakdown?.farmer_price?.toFixed(2) || '0.00'}<span className="text-sm font-normal text-gray-500">/kg</span></p>
            </div>
            {/* Transport */}
            <div className="bg-emerald-50/50 rounded-2xl p-4 relative">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 hidden md:block">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">Transport</p>
              <p className="text-lg font-bold text-gray-900">₹{((searchResult.price_breakdown?.farmer_price || 0) + (searchResult.price_breakdown?.transport_cost || 0)).toFixed(2)}<span className="text-sm font-normal text-gray-500">/kg</span></p>
            </div>
            {/* Distributor Margin */}
            <div className="bg-emerald-50/50 rounded-2xl p-4 relative">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 hidden md:block">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">Distributor Margin</p>
              <p className="text-lg font-bold text-gray-900">₹{(searchResult.price_breakdown?.distributor_margin || 0).toFixed(2)}<span className="text-sm font-normal text-gray-500">/kg</span></p>
            </div>
            {/* Retailer Margin */}
            <div className="bg-emerald-50/50 rounded-2xl p-4 relative">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 hidden md:block">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">Retailer Margin</p>
              <p className="text-lg font-bold text-gray-900">₹{(searchResult.price_breakdown?.retailer_margin || 0).toFixed(2)}<span className="text-sm font-normal text-gray-500">/kg</span></p>
            </div>
          </div>
        </section>

        {/* C. ORIGIN & STAKEHOLDERS */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Origin & Stakeholders</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Farmer Card */}
            <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-gray-900">{searchResult.origin?.farmer_name || 'Farmer'}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Farmer Name</span>
                  <span className="font-medium text-gray-900">{searchResult.origin?.farmer_name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Farm Location</span>
                  <span className="font-medium text-gray-900">{searchResult.origin?.farm_location || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Harvest Date</span>
                  <span className="font-medium text-gray-900">{searchResult.origin?.harvest_date ? new Date(searchResult.origin.harvest_date).toLocaleDateString() : '-'}</span>
                </div>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg">
                  <AlertCircle className="w-3 h-3" />
                  Warning
                </span>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <User className="w-3 h-3" /> {searchResult.origin?.farmer_name || 'Inspector'}
                </p>
              </div>
            </div>

            {/* Transporter Card */}
            <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Transporter</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Transporter Name</span>
                  <span className="font-medium text-gray-900">{searchResult.timeline?.find(t => t.stage.toLowerCase().includes('transport'))?.actor || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Transported Date</span>
                  <span className="font-medium text-gray-900">{searchResult.timeline?.find(t => t.stage.toLowerCase().includes('transport'))?.timestamp ? new Date(searchResult.timeline.find(t => t.stage.toLowerCase().includes('transport')).timestamp).toLocaleString() : '-'}</span>
                </div>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
                  <CheckCircle className="w-3 h-3" />
                  Passed
                </span>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <User className="w-3 h-3" /> Inspector
                </p>
              </div>
            </div>

            {/* Distributor Card */}
            <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Warehouse className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Distributor</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Distribution Center</span>
                  <span className="font-medium text-gray-900">{searchResult.timeline?.find(t => t.stage.toLowerCase().includes('distributor'))?.location || 'Pune'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Arrival Date</span>
                  <span className="font-medium text-gray-900">{searchResult.timeline?.find(t => t.stage.toLowerCase().includes('distributor'))?.timestamp ? new Date(searchResult.timeline.find(t => t.stage.toLowerCase().includes('distributor')).timestamp).toLocaleString() : '-'}</span>
                </div>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
                  <CheckCircle className="w-3 h-3" />
                  Passed
                </span>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <User className="w-3 h-3" /> Inspector
                </p>
              </div>
            </div>

            {/* Retailer Card */}
            <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Store className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Retailer</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Retailer Name</span>
                  <span className="font-medium text-gray-900">{searchResult.timeline?.find(t => t.stage.toLowerCase().includes('retail') || t.stage.toLowerCase().includes('list'))?.actor || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Listed Date</span>
                  <span className="font-medium text-gray-900">{searchResult.timeline?.find(t => t.stage.toLowerCase().includes('list'))?.timestamp ? new Date(searchResult.timeline.find(t => t.stage.toLowerCase().includes('list')).timestamp).toLocaleString() : '-'}</span>
                </div>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
                  <CheckCircle className="w-3 h-3" />
                  Listed for Sale
                </span>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <User className="w-3 h-3" /> Inspector
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* D. SUPPLY CHAIN JOURNEY - Horizontal Flow */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Supply Chain Journey</h2>
            <button className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Show Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Journey Flow */}
          <div className="relative mb-8">
            <div className="flex items-center justify-between">
              {/* Farm */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-200">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-gray-700 mt-2">Farm</span>
              </div>
              {/* Line */}
              <div className="flex-1 h-0.5 bg-emerald-200 mx-4"></div>
              {/* Transport */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-gray-700 mt-2">Transport</span>
              </div>
              {/* Line */}
              <div className="flex-1 h-0.5 bg-emerald-200 mx-4"></div>
              {/* Distributor */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center border-2 border-purple-200">
                  <Warehouse className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-gray-700 mt-2">Distributor</span>
              </div>
              {/* Line */}
              <div className="flex-1 h-0.5 bg-emerald-200 mx-4"></div>
              {/* Retailer */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center border-2 border-orange-200">
                  <Store className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-xs font-semibold text-gray-700 mt-2">Retailer</span>
              </div>
            </div>
          </div>

          {/* Journey Events */}
          <div className="space-y-3">
            {searchResult.timeline?.map((item, index) => (
              <div key={index} className="flex items-start gap-3 py-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900">{item.stage}</span>
                  <span className="text-sm text-gray-500 ml-2">{item.actor}, {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            )) || (
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span className="text-sm text-gray-700">Batch Created <span className="text-gray-400">{searchResult.origin?.farmer_name}, {new Date(searchResult.origin?.harvest_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span className="text-sm text-gray-700">Arrived at Distributor <span className="text-gray-400">Transporter, --:--</span></span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                  <span className="text-sm text-gray-700">Stored by Distributor <span className="text-gray-400">3/22, 12:20 PM</span></span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* E. QUALITY INSPECTIONS */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quality Inspections</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Farmer Inspection */}
            <div className="border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-900">Farmer</span>
              </div>
              <div className="space-y-2 mb-4">
                <span className="inline-block px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded">Expectation Match</span>
                <p className="text-xs text-gray-500">Moisture Level: 13%</p>
                <p className="text-xs text-gray-500">Pesticide Test: Inconclusive</p>
              </div>
              <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                VIEW REPORT
              </button>
            </div>

            {/* Transporter Inspection */}
            <div className="border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-900">Transporter</span>
              </div>
              <div className="space-y-2 mb-4">
                <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">Passed</span>
                <p className="text-xs text-gray-500">Cleanliness: Good</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}, 12:30 PM</p>
              </div>
              <button className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors">
                VIEW REPORT
              </button>
            </div>

            {/* Distributor Inspection */}
            <div className="border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Warehouse className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-gray-900">Distributor</span>
              </div>
              <div className="space-y-2 mb-4">
                <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">Passed</span>
                <p className="text-xs text-gray-500">Temperature: 6-10C</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}, 12:31 PM</p>
              </div>
              <button className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors">
                VIEW REPORT
              </button>
            </div>

            {/* Retailer Inspection */}
            <div className="border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Store className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-gray-900">Retailer</span>
              </div>
              <div className="space-y-2 mb-4">
                <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">Listed for Sale</span>
                <p className="text-xs text-gray-500">Quality Grade: A</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}, 12:34 PM</p>
              </div>
              <button className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors">
                VIEW REPORT
              </button>
            </div>
          </div>
        </section>

        {/* E. VERIFICATION BADGE */}
        <section className="bg-primary/5 p-8 rounded-3xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-primary/10">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-primary">Verification Status</h3>
              <p className="text-sm text-primary/70">✔ Verified by Supply Chain System</p>
            </div>
          </div>
          <div className="bg-white/50 px-6 py-3 rounded-2xl border border-dashed border-primary/30 text-xs font-bold text-primary/40 uppercase tracking-widest">
            Blockchain Verified (Coming Soon)
          </div>
        </section>

      </main>
    </div>
  );
};

export default ConsumerTrace;
