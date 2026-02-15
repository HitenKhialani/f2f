import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardCheck, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { batchAPI, inspectionAPI } from '../../services/api';

const InspectionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        storage_conditions: '',
        passed: true,
        report_file: null,
    });

    useEffect(() => {
        fetchBatch();
    }, [id]);

    const fetchBatch = async () => {
        try {
            const response = await batchAPI.get(id);
            setBatch(response.data);
        } catch (error) {
            console.error('Error fetching batch:', error);
            alert('Failed to load batch details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('batch', id);
            formDataToSend.append('storage_conditions', formData.storage_conditions);
            formDataToSend.append('passed', formData.passed);
            if (formData.report_file) {
                formDataToSend.append('report_file', formData.report_file);
            }

            await inspectionAPI.create(formDataToSend);
            alert('Inspection report submitted successfully!');
            navigate('/distributor/dashboard');
        } catch (error) {
            console.error('Error submitting inspection:', error);
            alert(error.response?.data?.message || 'Failed to submit inspection');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading batch details...</div>
                </div>
            </MainLayout>
        );
    }

    if (!batch) {
        return (
            <MainLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Batch not found</p>
                    <button
                        onClick={() => navigate('/distributor/dashboard')}
                        className="mt-4 text-primary hover:underline"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/distributor/dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Batch Inspection</h1>
                        <p className="text-gray-600">Review and inspect incoming batch</p>
                    </div>
                </div>

                {/* Batch Details Card */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <ClipboardCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Batch Details</h2>
                            <p className="text-sm text-gray-500">ID: {batch.product_batch_id}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Crop Type</p>
                            <p className="font-medium text-gray-900">{batch.crop_type}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Quantity</p>
                            <p className="font-medium text-gray-900">{batch.quantity} kg</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Harvest Date</p>
                            <p className="font-medium text-gray-900">
                                {new Date(batch.harvest_date).toLocaleDateString('hi-IN')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Current Status</p>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${batch.status === 'RECEIVED_BY_DISTRIBUTOR' ? 'bg-yellow-100 text-yellow-700' :
                                    batch.status === 'INSPECTED' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {batch.status?.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Farm Location</p>
                            <p className="font-medium text-gray-900">{batch.farm_location || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Current Owner</p>
                            <p className="font-medium text-gray-900">{batch.current_owner_username || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Inspection Form */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Inspection Report</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Storage Conditions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Storage Conditions
                            </label>
                            <textarea
                                value={formData.storage_conditions}
                                onChange={(e) => setFormData({ ...formData, storage_conditions: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="Describe the storage conditions, temperature, humidity, etc."
                                required
                            />
                        </div>

                        {/* Inspection Result */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Inspection Result
                            </label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, passed: true })}
                                    className={`flex-1 p-4 border-2 rounded-lg flex items-center justify-center gap-3 transition-all ${formData.passed
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <CheckCircle className={`w-6 h-6 ${formData.passed ? 'text-green-600' : 'text-gray-400'}`} />
                                    <span className={`font-medium ${formData.passed ? 'text-green-700' : 'text-gray-600'}`}>
                                        Passed
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, passed: false })}
                                    className={`flex-1 p-4 border-2 rounded-lg flex items-center justify-center gap-3 transition-all ${!formData.passed
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <XCircle className={`w-6 h-6 ${!formData.passed ? 'text-red-600' : 'text-gray-400'}`} />
                                    <span className={`font-medium ${!formData.passed ? 'text-red-700' : 'text-gray-600'}`}>
                                        Failed
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Report File */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Inspection Report (Optional)
                            </label>
                            <input
                                type="file"
                                onChange={(e) => setFormData({ ...formData, report_file: e.target.files[0] })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                accept=".pdf,.doc,.docx"
                            />
                            <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/distributor/dashboard')}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Inspection'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default InspectionPage;
