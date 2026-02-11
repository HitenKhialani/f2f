import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Sprout, User, Mail, Lock, Phone, Building2, MapPin, FileText, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegistrationPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organization: '',
    address: '',
    documentType: '',
    documentNumber: '',
  });

  const roleConfig = {
    farmer: {
      title: 'Farmer',
      subtitle: 'Farmer Registration',
      icon: <Sprout className="w-6 h-6" />,
      fields: ['organization', 'address'],
      labels: { organization: 'Farm Name', address: 'Address (Village/District/State)' },
    },
    distributor: {
      title: 'Distributor',
      subtitle: 'Distributor Registration',
      icon: <Building2 className="w-6 h-6" />,
      fields: ['organization', 'address'],
      labels: { organization: 'Company Name', address: 'Address (City/State)' },
    },
    transporter: {
      title: 'Transporter',
      subtitle: 'Transporter Registration',
      icon: <User className="w-6 h-6" />,
      fields: ['organization', 'address'],
      labels: { organization: 'Transport Company Name', address: 'Address (City/State)' },
    },
    retailer: {
      title: 'Retailer',
      subtitle: 'Retailer Registration',
      icon: <Building2 className="w-6 h-6" />,
      fields: ['organization', 'address'],
      labels: { organization: 'Shop Name', address: 'Address (Market/City)' },
    },
    consumer: {
      title: 'Consumer',
      subtitle: 'Consumer Registration',
      icon: <User className="w-6 h-6" />,
      fields: [],
      labels: {},
    },
  };

  const config = roleConfig[role] || roleConfig.consumer;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: role.toUpperCase(),
        phone: formData.phone,
        organization: formData.organization,
        address: formData.address,
      };

      await register(data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/kyc-pending');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your account has been created. You can use the dashboard after KYC approval.
          </p>
          <Link to="/kyc-pending" className="btn-primary inline-block">
            Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">AgriChain</span>
            </Link>
            <Link to="/role-selection" className="flex items-center gap-1 text-gray-600 hover:text-primary">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">1</span>
              <span className="text-sm font-medium">Account</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">2</span>
              <span className="text-sm font-medium">Profile</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-primary/5 border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-white p-2 rounded-lg">
                {config.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{config.title} Registration</h1>
                <p className="text-sm text-gray-500">{config.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Rajesh Kumar"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="rajesh@example.com"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full btn-primary py-3"
                  >
                    Next
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  {config.fields.includes('organization') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {config.labels.organization}
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="organization"
                          value={formData.organization}
                          onChange={handleChange}
                          placeholder="Organization name"
                          className="input-field pl-10"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {config.fields.includes('address') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {config.labels.address}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Enter your complete address"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 btn-secondary py-3"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Register</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RegistrationPage;
