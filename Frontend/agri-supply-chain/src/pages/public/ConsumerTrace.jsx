import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ScanLine, Search, ArrowLeft, Truck, ClipboardCheck, Store, CheckCircle } from 'lucide-react';

const ConsumerTrace = () => {
  const [batchId, setBatchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSearchResult({
        batchId: batchId,
        cropType: 'गेहूं (Wheat)',
        variety: 'HD-2967',
        quantity: '50 क्विंटल',
        farmer: {
          name: 'राजेश कुमार',
          location: 'मुजफ्फरनगर, उत्तर प्रदेश',
          farmSize: '10 एकड़',
          organic: true,
        },
        timeline: [
          { 
            stage: 'बुवाई', 
            icon: <Sprout className="w-5 h-5" />, 
            date: '15 नवंबर 2023', 
            actor: 'राजेश कुमार (किसान)', 
            location: 'मुजफ्फरनगर, UP',
            details: 'HD-2967 किस्म का बीज बोया गया'
          },
          { 
            stage: 'कटाई', 
            icon: <Sprout className="w-5 h-5" />, 
            date: '20 अप्रैल 2024', 
            actor: 'राजेश कुमार (किसान)', 
            location: 'मुजफ्फरनगर, UP',
            details: '50 क्विंटल उपज'
          },
          { 
            stage: 'परिवहन', 
            icon: <Truck className="w-5 h-5" />, 
            date: '22 अप्रैल 2024', 
            actor: 'अमित ट्रांसपोर्ट सर्विस', 
            location: 'मुजफ्फरनगर → दिल्ली',
            details: 'ट्रक नंबर: UP11 AB 1234'
          },
          { 
            stage: 'निरीक्षण', 
            icon: <ClipboardCheck className="w-5 h-5" />, 
            date: '23 अप्रैल 2024', 
            actor: 'एग्रो डिस्ट्रीब्यूशन प्राइवेट लिमिटेड', 
            location: 'आजादपुर मंडी, दिल्ली',
            details: 'गुणवत्ता निरीक्षण - A ग्रेड'
          },
          { 
            stage: 'खुदरा विक्रय', 
            icon: <Store className="w-5 h-5" />, 
            date: '25 अप्रैल 2024', 
            actor: 'श्याम किराना स्टोर', 
            location: 'करोल बाग, दिल्ली',
            details: 'खुदरा मूल्य: ₹25/किलो'
          },
        ]
      });
      setLoading(false);
    }, 1000);
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
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-primary">
                <ArrowLeft className="w-4 h-4" />
                <span>वापस</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!searchResult ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ScanLine className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              फसल ट्रेसेबिलिटी
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              बैच ID या QR कोड दर्ज करके भारतीय कृषि उत्पाद की पूरी यात्रा देखें। 
              खेत से लेकर आपकी थाली तक पूरा ब्योरा।
            </p>
            
            <form onSubmit={handleSearch} className="max-w-lg mx-auto">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="बैच ID दर्ज करें (उदा: 550e8400-e29b)"
                  className="flex-1 input-field text-lg"
                />
                <button
                  type="submit"
                  disabled={loading || !batchId}
                  className="btn-primary px-8 text-lg"
                >
                  {loading ? 'खोज रहा है...' : 'खोजें'}
                </button>
              </div>
            </form>

            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Sprout className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">किसान से जुड़ें</h3>
                <p className="text-sm text-gray-600">जानें कि आपका खाना किस किसान ने उगाया</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Truck className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">परिवहन ट्रैक करें</h3>
                <p className="text-sm text-gray-600">फसल की यात्रा का पूरा ब्योरा</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">गुणवत्ता सत्यापन</h3>
                <p className="text-sm text-gray-600">निरीक्षण रिपोर्ट देखें</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setSearchResult(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>नई खोज करें</span>
            </button>

            {/* Result Card */}
            <div className="card overflow-hidden">
              {/* Header */}
              <div className="p-6 bg-primary text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-green-200 text-sm mb-1">ट्रेसेबिलिटी रिपोर्ट</p>
                    <h2 className="text-2xl font-bold">{searchResult.cropType}</h2>
                    <p className="text-green-100">{searchResult.variety} • {searchResult.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-200">बैच ID</p>
                    <p className="font-mono text-sm">{searchResult.batchId}</p>
                  </div>
                </div>
              </div>

              {/* Farmer Info */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">उत्पादक जानकारी</h3>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sprout className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{searchResult.farmer.name}</h4>
                    <p className="text-sm text-gray-600">{searchResult.farmer.location}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-500">खेत: {searchResult.farmer.farmSize}</span>
                      {searchResult.farmer.organic && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          ऑर्गेनिक
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-6">आपूर्ति श्रृंखला यात्रा</h3>
                <div className="space-y-6">
                  {searchResult.timeline.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          {item.icon}
                        </div>
                        {index < searchResult.timeline.length - 1 && (
                          <div className="w-0.5 flex-1 bg-primary/20 my-2 min-h-[40px]"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-gray-900">{item.stage}</h4>
                          <span className="text-sm text-gray-500">{item.date}</span>
                        </div>
                        <p className="font-medium text-gray-700">{item.actor}</p>
                        <p className="text-sm text-gray-500">{item.location}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification */}
              <div className="p-6 bg-green-50 border-t border-green-100">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">ब्लॉकचेन पर सत्यापित</p>
                    <p className="text-sm text-green-600">यह ट्रेसेबिलिटी रिकॉर्ड AgriChain ब्लॉकचेन पर अपरिवर्तनीय रूप से संग्रहीत है।</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ConsumerTrace;
