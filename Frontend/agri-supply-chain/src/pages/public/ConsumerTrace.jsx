import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Sprout,
  ScanLine,
  Search,
  ArrowLeft,
  Truck,
  CheckCircle,
  AlertCircle,
  MapPin,
  User,
  ArrowRight,
  Warehouse,
  Store,
  Building,
  CalendarDays,
  Activity,
  Shield
} from 'lucide-react';
import { consumerAPI, inspectionAPI } from '../../services/api';
import { InspectionTimeline } from '../../components/inspection';
import PublicTopNav from '../../components/layout/PublicTopNav';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <PublicTopNav />
        <div className="text-center space-y-4 pt-20">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium">Fetching Traceability Data...</p>
        </div>
      </div>
    );
  }

  if (!searchResult || error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <PublicTopNav />
        <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{error ? 'Trace Failed' : 'Batch Not Found'}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">{error || 'Please verify the Batch ID and try again.'}</p>

          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="text"
              value={batchIdTerm}
              onChange={(e) => setBatchIdTerm(e.target.value)}
              placeholder="Enter Batch ID"
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 transition-all outline-none dark:text-white"
            />
            <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              <span>Retry Search</span>
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="mt-6 text-sm text-slate-400 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2 mx-auto font-bold uppercase tracking-widest px-4 py-2 border border-slate-100 dark:border-slate-800 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PublicTopNav />
      <div className="h-20" /> {/* Spacer */}

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-24">
        {/* A. PRODUCT SUMMARY CARD */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="grid md:grid-cols-5">
            <div className="p-10 md:col-span-3 space-y-6">
              <span className="inline-block px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200 dark:border-emerald-800/50">
                Verified Product Info
              </span>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white capitalize tracking-tighter">{searchResult.product_name}</h1>
                <p className="text-slate-400 font-mono text-xs mt-2">BATCH ID: {searchResult.batch_id}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{searchResult.quantity || '0'} kg</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Retail Price</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">₹{Number(searchResult.retail_price || 0).toFixed(2)} <span className="text-sm font-bold text-slate-400">/ kg</span></p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 uppercase tracking-widest">
                  {searchResult.status}
                </span>
              </div>
            </div>

            <div className="p-10 md:col-span-2 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center border-l border-slate-100 dark:border-slate-800 text-center">
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 group hover:rotate-2 transition-transform duration-500">
                {searchResult.qr_code_url ? (
                  <img
                    src={searchResult.qr_code_url.startsWith('data:') ? searchResult.qr_code_url : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${searchResult.qr_code_url}`}
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-slate-300">
                    <ScanLine className="w-12 h-12" />
                  </div>
                )}
              </div>
              <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Blockchain QR Proof</p>
            </div>
          </div>
        </section>

        {/* B. PRICE JOURNEY */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
            Price Journey
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Soil to Soul</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Farmer Base</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">₹{Number(searchResult.price_breakdown?.farmer_price || 0).toFixed(2)}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/50 relative">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 hidden lg:block">
                <ArrowRight className="w-5 h-5 text-emerald-300" />
              </div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Transport</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">₹{Number(searchResult.price_breakdown?.transport_cost || 0).toFixed(2)}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/50 relative">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 hidden lg:block">
                <ArrowRight className="w-5 h-5 text-emerald-300" />
              </div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Distributor</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">₹{Number(searchResult.price_breakdown?.distributor_margin || 0).toFixed(2)}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/50 relative">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 hidden lg:block">
                <ArrowRight className="w-5 h-5 text-emerald-300" />
              </div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Retailer</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">₹{Number(searchResult.price_breakdown?.retailer_margin || 0).toFixed(2)}</p>
            </div>
          </div>
        </section>

        {/* C. STAKEHOLDER JOURNEY - Dynamic */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Supply Chain Partners</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Farmer Card - Only show if data exists */}
            {(searchResult.origin?.farmer_name || searchResult.origin?.farm_location) && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 group hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Farmer Partner</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">{searchResult.origin?.farmer_name || 'Farmer'}</div>
                  </div>
                </div>
                <div className="space-y-4 font-bold text-sm">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-500">Location</span>
                    <span className="text-slate-900 dark:text-white truncate ml-4">{searchResult.origin?.farm_location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-500">Harvest Date</span>
                    <span className="text-slate-900 dark:text-white">{searchResult.origin?.harvest_date ? new Date(searchResult.origin.harvest_date).toLocaleDateString('en-IN') : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Distributor Card - Only show if data exists */}
            {(searchResult.distributor?.name || searchResult.distributor?.location) && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 group hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distributor</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">{searchResult.distributor?.name || 'Distributor'}</div>
                  </div>
                </div>
                <div className="space-y-4 font-bold text-sm">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-500">Facility</span>
                    <span className="text-slate-900 dark:text-white truncate ml-4">{searchResult.distributor?.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-500">In-Storage</span>
                    <span className="text-slate-900 dark:text-white">{searchResult.distributor?.date ? new Date(searchResult.distributor.date).toLocaleDateString('en-IN') : 'Verified'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Retailer Card - Only show if data exists */}
            {(searchResult.retailer?.name || searchResult.retailer?.location) && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 group hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retailer</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">{searchResult.retailer?.name || 'Retailer'}</div>
                  </div>
                </div>
                <div className="space-y-4 font-bold text-sm">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-500">Store</span>
                    <span className="text-slate-900 dark:text-white truncate ml-4">{searchResult.retailer?.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-slate-500">Listed Date</span>
                    <span className="text-slate-900 dark:text-white">{searchResult.retailer?.date ? new Date(searchResult.retailer.date).toLocaleDateString('en-IN') : 'Available'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 bg-slate-900 p-8 rounded-[2rem] border border-slate-800 flex flex-col md:flex-row justify-center items-center text-center md:text-left gap-6">
            <Shield className="w-16 h-16 text-emerald-500 animate-pulse shrink-0" />
            <div>
              <h3 className="text-white text-xl font-black mb-2">E2E Blockchain Proof</h3>
              <p className="text-slate-500 text-sm font-medium">This supply chain journey is cryptographically signed at every handoff and stored on an immutable ledger. Every stakeholder above has verified their part of the process.</p>
            </div>
          </div>
        </section>

        {/* D. BATCH STATUS TIMELINE */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Batch Status</h2>
          {searchResult.timeline && searchResult.timeline.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              {searchResult.timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    event.status === 'COMPLETED' 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : event.status === 'IN_PROGRESS'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {event.status === 'COMPLETED' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : event.status === 'IN_PROGRESS' ? (
                      <Activity className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">{event.stage}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{event.description}</p>
                    {event.date && (
                      <p className="text-xs text-slate-400 mt-1">{new Date(event.date).toLocaleDateString('en-IN')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchResult.status_history && searchResult.status_history.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              {searchResult.status_history.map((status, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">{status.status?.replace(/_/g, ' ')}</h4>
                    {status.date && (
                      <p className="text-xs text-slate-400 mt-1">{new Date(status.date).toLocaleDateString('en-IN')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold tracking-tight">No status timeline available.</p>
            </div>
          )}
        </section>

        {/* E. INSPECTIONS */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Quality Inspections</h2>
          {inspections.length > 0 ? (
            <InspectionTimeline
              batchId={searchResult.batch_id}
              inspections={inspections}
            />
          ) : (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold tracking-tight">No detailed inspections recorded yet.</p>
            </div>
          )}
        </section>

        <div className="flex justify-center">
          <button
            onClick={() => {
              setSearchResult(null);
              setBatchIdTerm('');
              setError(null);
              navigate('/consumer/dashboard');
            }}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Trace Another Batch
          </button>
        </div>
      </main>
    </div>
  );
};

export default ConsumerTrace;
