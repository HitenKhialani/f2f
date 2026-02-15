import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ScanLine,
  Package,
  ClipboardCheck
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

const ConsumerDashboard = () => {
  const [batchId, setBatchId] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!batchId.trim()) {
      alert('Please enter a batch ID');
      return;
    }
    navigate(`/trace/${batchId.trim()}`);
  };

  return (
    <MainLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 py-12">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">AgriChain</h1>
          <p className="text-xl text-primary font-medium">Verify Your Product Authenticity</p>
        </div>

        {/* Search Section */}
        <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ScanLine className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Trace Your Produce</h2>
              <p className="text-gray-500 mt-1">Enter your unique Batch ID to see its journey</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="CB-20260215-53952C63"
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-lg focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <button
                type="submit"
                disabled={!batchId.trim()}
                className="w-full py-4 bg-primary text-white rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                Scan QR on product or enter batch ID to view traceability.
              </p>
            </div>
          </div>
        </div>

        {/* Features Minimal */}
        <div className="grid grid-cols-3 gap-8 w-full max-w-3xl pt-12 text-center border-t border-gray-100">
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">100%</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Transparent</p>
          </div>
          <div className="space-y-1 border-x border-gray-100 px-4">
            <p className="text-lg font-bold text-gray-900">Verified</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Ownership</p>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">Secure</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Blockchain Ready</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ConsumerDashboard;
