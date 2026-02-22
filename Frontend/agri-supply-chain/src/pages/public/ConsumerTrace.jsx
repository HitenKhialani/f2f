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
  AlertCircle
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

  const getStageIcon = (stage) => {
    const s = stage.toLowerCase();
    if (s.includes('harvest') || s.includes('create')) return <Sprout className="w-5 h-5" />;
    if (s.includes('transport') || s.includes('transit')) return <Truck className="w-5 h-5" />;
    if (s.includes('inspect') || s.includes('quality') || s.includes('stored')) return <ClipboardCheck className="w-5 h-5" />;
    if (s.includes('list') || s.includes('sale') || s.includes('retailer')) return <Store className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
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

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8 pb-20">

        {/* A. PRODUCT SUMMARY CARD */}
        <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-3">
            <div className="p-8 md:col-span-2 space-y-6">
              <div>
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Product Summary</span>
                <h1 className="text-4xl font-black text-gray-900 mt-2">{searchResult.product_name}</h1>
                <p className="text-gray-400 font-mono text-sm mt-1">{searchResult.batch_id}</p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity</p>
                  <p className="text-xl font-bold text-gray-900">{searchResult.quantity}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Retail Price</p>
                  <p className="text-xl font-bold text-primary">₹{searchResult.retail_price} / kg</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="font-bold text-gray-700">{searchResult.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50/50 flex flex-col items-center justify-center border-l border-gray-100 text-center">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-4">
                {searchResult.qr_code_url ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${searchResult.qr_code_url}`}
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-gray-300">
                    <ScanLine className="w-12 h-12" />
                  </div>
                )}
              </div>
              <button
                onClick={handleDownloadQR}
                className="text-xs font-bold text-primary hover:underline uppercase tracking-widest py-2 px-4 border border-primary/20 rounded-lg hover:bg-primary/5 transition-all"
              >
                Download QR
              </button>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* B. ORIGIN DETAILS SECTION */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Sprout className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Origin Details</h2>
            </div>

            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-50 flex justify-between items-center">
                <span className="text-gray-500">Farmer Name</span>
                <span className="font-bold text-gray-900">{searchResult.origin.farmer_name}</span>
              </div>
              <div className="pb-4 border-b border-gray-50 flex justify-between items-center">
                <span className="text-gray-500">Farm Location</span>
                <span className="font-bold text-gray-900">{searchResult.origin.farm_location}</span>
              </div>
              <div className="pb-4 border-b border-gray-50 flex justify-between items-center">
                <span className="text-gray-500">Harvest Date</span>
                <span className="font-bold text-gray-900">{new Date(searchResult.origin.harvest_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Initial Quantity</span>
                <span className="font-bold text-gray-900">{searchResult.origin.parent_batch_quantity}</span>
              </div>
            </div>
          </section>

          {/* D. PRICE TRANSPARENCY SECTION */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Price Breakdown</h2>
            </div>

            <div className="space-y-4">
              <table className="w-full">
                <thead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <tr>
                    <th className="text-left pb-2">Component</th>
                    <th className="text-right pb-2">₹ / kg</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  <tr>
                    <td className="py-3 text-gray-600">Farmer Base Price</td>
                    <td className="py-3 text-right font-medium text-gray-900">{searchResult.price_breakdown.farmer_price.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-600">Transport Cost</td>
                    <td className="py-3 text-right font-medium text-gray-900">{searchResult.price_breakdown.transport_cost.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-600">Distributor Margin</td>
                    <td className="py-3 text-right font-medium text-gray-900">{searchResult.price_breakdown.distributor_margin.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-600">Retailer Margin</td>
                    <td className="py-3 text-right font-medium text-gray-900">{searchResult.price_breakdown.retailer_margin.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-primary/5">
                    <td className="py-4 px-2 font-bold text-gray-900">Total Retail Price</td>
                    <td className="py-4 px-2 text-right font-black text-primary text-lg">₹{searchResult.price_breakdown.total_price.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* C. SUPPLY CHAIN JOURNEY (TIMELINE) */}
        <section className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Supply Chain Journey</h2>
          </div>

          <div className="space-y-0">
            {searchResult.timeline.map((item, index) => (
              <div key={index} className="flex gap-8 group">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all group-hover:scale-110 ${index === searchResult.timeline.length - 1
                      ? 'bg-primary text-white ring-4 ring-primary/10'
                      : 'bg-white border-2 border-gray-100 text-gray-400'
                    }`}>
                    {getStageIcon(item.stage)}
                  </div>
                  {index < searchResult.timeline.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-100 my-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-10">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{item.stage}</h4>
                    <span className="text-xs font-medium text-gray-400">{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>
                    Actor: <span className="text-gray-900">{item.actor}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* F. INSPECTION TIMELINE SECTION */}
        <section className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Quality Inspections</h2>
          </div>
          <InspectionTimeline 
            batchId={searchResult.batch_id}
            inspections={inspections}
          />
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
