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
  Store
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
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                {searchResult.qr_code_url ? (
                  <img
                    src={searchResult.qr_code_url.startsWith('data:') ? searchResult.qr_code_url : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${searchResult.qr_code_url}`}
                    alt="QR Code"
                    className="w-28 h-28"
                  />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center text-gray-300">
                    <ScanLine className="w-10 h-10" />
                  </div>
                )}
              </div>
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
              <p className="text-lg font-bold text-gray-900">₹{(searchResult.price_breakdown?.transport_cost || 0).toFixed(2)}<span className="text-sm font-normal text-gray-500">/kg</span></p>
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
            {/* Farmer Card - Product Description */}
            <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-gray-900">{searchResult.origin?.farmer_name || 'Farmer'}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Farm Location</span>
                  <span className="font-medium text-gray-900">{searchResult.origin?.farm_location || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Harvest Date</span>
                  <span className="font-medium text-gray-900">{searchResult.origin?.harvest_date ? new Date(searchResult.origin.harvest_date).toLocaleDateString() : '-'}</span>
                </div>
              </div>
              {(() => {
                const farmerDescription = inspections.find(i => i.stage === 'farmer');
                return farmerDescription ? (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-xs font-medium text-green-700">Product Description</span>
                    {farmerDescription.inspection_notes && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-3">{farmerDescription.inspection_notes}</p>
                    )}
                  </div>
                ) : (
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-lg">
                      No description provided
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Removed Transporter Card - Transporters don't perform inspections */}

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
                  <span className="font-medium text-gray-900">{searchResult.timeline?.find(t => t.stage.toLowerCase().includes('distributor'))?.actor || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Arrival Date</span>
                  <span className="font-medium text-gray-900">{searchResult.timeline?.find(t => t.stage.toLowerCase().includes('distributor'))?.timestamp ? new Date(searchResult.timeline.find(t => t.stage.toLowerCase().includes('distributor')).timestamp).toLocaleString() : '-'}</span>
                </div>
              </div>
              {(() => {
                const distributorInspection = inspections.find(i => i.stage === 'distributor');
                return distributorInspection ? (
                  <div className="pt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg ${distributorInspection.result === 'PASS' ? 'bg-emerald-50 text-emerald-700' : distributorInspection.result === 'WARNING' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                      {distributorInspection.result === 'PASS' ? <CheckCircle className="w-3 h-3" /> : distributorInspection.result === 'WARNING' ? <AlertCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {distributorInspection.result === 'PASS' ? 'Passed' : distributorInspection.result === 'WARNING' ? 'Warning' : 'Failed'}
                    </span>
                    {distributorInspection.inspection_notes && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{distributorInspection.inspection_notes}</p>
                    )}
                  </div>
                ) : (
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-lg">
                      No inspection recorded
                    </span>
                  </div>
                );
              })()}
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
              {(() => {
                const retailerInspection = inspections.find(i => i.stage === 'retailer');
                return retailerInspection ? (
                  <div className="pt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg ${retailerInspection.result === 'PASS' ? 'bg-emerald-50 text-emerald-700' : retailerInspection.result === 'WARNING' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                      {retailerInspection.result === 'PASS' ? <CheckCircle className="w-3 h-3" /> : retailerInspection.result === 'WARNING' ? <AlertCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {retailerInspection.result === 'PASS' ? 'Passed' : retailerInspection.result === 'WARNING' ? 'Warning' : 'Failed'}
                    </span>
                    {retailerInspection.inspection_notes && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{retailerInspection.inspection_notes}</p>
                    )}
                  </div>
                ) : (
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
                      <CheckCircle className="w-3 h-3" />
                      Listed for Sale
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>

        {/* D. SUPPLY CHAIN JOURNEY - Compact Horizontal Flow */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Supply Chain Journey</h2>
            <span className="text-sm text-gray-500">
              {searchResult.timeline?.length || 0} events recorded
            </span>
          </div>

          {/* Compact Journey Flow */}
          <div className="relative mb-6">
            <div className="flex items-center justify-between relative">
              {/* Progress Line Background */}
              <div className="absolute left-0 right-0 top-6 h-1 bg-gray-200 rounded-full" />
              {/* Active Progress Line */}
              <div 
                className="absolute left-0 top-6 h-1 bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: '100%' }}
              />
              
              {/* Journey Nodes */}
              {[
                { icon: Sprout, label: 'Farm', sub: 'Origin', color: 'emerald' },
                { icon: Truck, label: 'Transport', sub: 'In Transit', color: 'blue' },
                { icon: Warehouse, label: 'Distributor', sub: 'Storage', color: 'purple' },
                { icon: Store, label: 'Retailer', sub: 'Point of Sale', color: 'orange' }
              ].map((node, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center bg-white px-2">
                  <div className={`w-12 h-12 bg-${node.color}-500 rounded-full flex items-center justify-center border-3 border-${node.color}-100 shadow-md`}>
                    <node.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 mt-1">{node.label}</span>
                  <span className="text-[10px] text-gray-400">{node.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Event History - Compact Grid */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Event History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {searchResult.timeline?.map((item, index) => {
                const getStageColor = (stage) => {
                  const s = stage.toLowerCase();
                  if (s.includes('farm') || s.includes('created')) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
                  if (s.includes('transport') || s.includes('transit')) return 'bg-blue-50 border-blue-200 text-blue-700';
                  if (s.includes('distributor') || s.includes('storage')) return 'bg-purple-50 border-purple-200 text-purple-700';
                  if (s.includes('retail') || s.includes('list') || s.includes('sale')) return 'bg-orange-50 border-orange-200 text-orange-700';
                  return 'bg-gray-50 border-gray-200 text-gray-700';
                };
                
                const getStageIcon = (stage) => {
                  const s = stage.toLowerCase();
                  if (s.includes('farm') || s.includes('created')) return <Sprout className="w-4 h-4" />;
                  if (s.includes('transport') || s.includes('transit')) return <Truck className="w-4 h-4" />;
                  if (s.includes('distributor') || s.includes('storage')) return <Warehouse className="w-4 h-4" />;
                  if (s.includes('retail') || s.includes('list') || s.includes('sale')) return <Store className="w-4 h-4" />;
                  return <CheckCircle className="w-4 h-4" />;
                };
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-2.5 rounded-lg border ${getStageColor(item.stage)}`}
                  >
                    <div className="mt-0.5">{getStageIcon(item.stage)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{item.stage}</span>
                        <span className="text-xs opacity-75">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs opacity-75 truncate">By: {item.actor}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* E. QUALITY INSPECTIONS - Real Data */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quality Inspections</h2>
          {inspections.length > 0 ? (
            <InspectionTimeline 
              batchId={searchResult.batch_id}
              inspections={inspections}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No quality inspections recorded for this batch yet.</p>
            </div>
          )}
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
