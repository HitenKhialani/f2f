import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search,
  ScanLine,
  History,
  Sprout,
  Truck,
  ClipboardCheck,
  Store,
  ArrowRight
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

const ConsumerDashboard = () => {
  const [batchId, setBatchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    // API call would go here
    setTimeout(() => {
      setSearchResult({
        batchId: batchId,
        cropType: 'Wheat',
        farmer: 'Rajesh Kumar',
        location: 'Muzaffarnagar, Uttar Pradesh',
        timeline: [
          { stage: 'Crop Production', icon: <Sprout className="w-5 h-5" />, date: '2024-01-15', actor: 'Rajesh Kumar (Farmer)', location: 'Muzaffarnagar, UP' },
          { stage: 'Transport', icon: <Truck className="w-5 h-5" />, date: '2024-01-20', actor: 'Amit Transport', location: 'Muzaffarnagar → Delhi' },
          { stage: 'Inspection', icon: <ClipboardCheck className="w-5 h-5" />, date: '2024-01-21', actor: 'Agro Distribution', location: 'Delhi' },
          { stage: 'Retail Sale', icon: <Store className="w-5 h-5" />, date: '2024-01-25', actor: 'Kirana Store', location: 'Delhi' },
        ]
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consumer Dashboard</h1>
          <p className="text-gray-600">Trace crop origin and journey</p>
        </div>

        {/* Search Section */}
        <div className="card p-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ScanLine className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Crop Traceability</h2>
            <p className="text-gray-600 mb-6">
              Enter Batch ID or QR code to view the complete journey of the crop
            </p>
            
            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="Enter Batch ID (e.g.: 550e8400-e29b)"
                className="flex-1 input-field"
              />
              <button
                type="submit"
                disabled={loading || !batchId}
                className="btn-primary px-8"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="card overflow-hidden">
            <div className="p-6 bg-primary/5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{searchResult.cropType}</h3>
                  <p className="text-sm text-gray-600">बैच ID: {searchResult.batchId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">उत्पादक</p>
                  <p className="font-medium text-gray-900">{searchResult.farmer}</p>
                  <p className="text-xs text-gray-500">{searchResult.location}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-6">Supply Chain Journey</h3>
              <div className="space-y-6">
                {searchResult.timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        {item.icon}
                      </div>
                      {index < searchResult.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-primary/20 my-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900">{item.stage}</h5>
                        <span className="text-sm text-gray-500">{item.date}</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.actor}</p>
                      <p className="text-xs text-gray-400">{item.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/consumer/trace" className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <ScanLine className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Scan QR Code</h3>
                <p className="text-sm text-gray-600">Scan QR code with camera</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Search History</h3>
                <p className="text-sm text-gray-600">View your previous searches</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ConsumerDashboard;
