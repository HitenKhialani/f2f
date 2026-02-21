import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, ArrowLeft, Package } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { batchAPI, retailAPI } from '../../services/api';

const NewListingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        batch: '',
        farmer_base_price: 0,
        transport_fees: 0,
        distributor_margin: 0,
        retailer_margin: '',
    });

    useEffect(() => {
        fetchInspectedBatches();
    }, []);

    const fetchInspectedBatches = async () => {
        try {
            const response = await batchAPI.list();
            // Filter for batches that are delivered to retailer and owned by current user
            const deliveredBatches = response.data.filter(
                batch => batch.status === 'DELIVERED_TO_RETAILER' && batch.current_owner === user?.id
            );
            setBatches(deliveredBatches);
        } catch (error) {
            console.error('Error fetching batches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBatchChange = (e) => {
        const batchId = e.target.value;
        const selected = batches.find(b => b.id.toString() === batchId.toString());

        if (selected) {
            setFormData({
                ...formData,
                batch: batchId,
                farmer_base_price: Number(selected.farmer_base_price_per_unit) || 0,
                transport_fees: Number(selected.total_transport_fees) || 0,
                distributor_margin: Number(selected.distributor_margin_per_unit) || 0,
            });
        } else {
            setFormData({
                ...formData,
                batch: '',
                farmer_base_price: 0,
                transport_fees: 0,
                distributor_margin: 0,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await retailAPI.create({
                batch: formData.batch,
                retailer_margin: formData.retailer_margin,
                is_for_sale: true,
            });
            alert('Listing created successfully!');
            navigate('/retailer/dashboard');
        } catch (error) {
            console.error('Error creating listing:', error);
            alert(error.response?.data?.message || 'Failed to create listing');
        } finally {
            setSubmitting(false);
        }
    };

    const calculateTotalPrice = () => {
        const base = parseFloat(formData.farmer_base_price) || 0;
        const transport = parseFloat(formData.transport_fees) || 0;
        const distMargin = parseFloat(formData.distributor_margin) || 0;
        const retailMargin = parseFloat(formData.retailer_margin) || 0;
        return base + transport + distMargin + retailMargin;
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/retailer/dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
                        <p className="text-gray-600">List an inspected batch for retail sale</p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Store className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Listing Details</h2>
                            <p className="text-sm text-gray-500">Set pricing and select batch</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Batch Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Batch <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.batch}
                                onChange={handleBatchChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                required
                            >
                                <option value="">Choose a batch...</option>
                                {batches.map(batch => (
                                    <option key={batch.id} value={batch.id}>
                                        {batch.product_batch_id} - {batch.crop_type} ({batch.quantity} kg)
                                    </option>
                                ))}
                            </select>
                            {batches.length === 0 && !loading && (
                                <p className="text-sm text-amber-600 mt-1">
                                    No delivered batches available. Batches must be delivered to retailer before listing.
                                </p>
                            )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                    Farmer Base Price (₹)
                                </label>
                                <div className="text-lg font-bold text-gray-700">
                                    ₹{Number(formData.farmer_base_price || 0).toFixed(2)}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Locked (Set by Farmer)</p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                    Total Transport Fees (₹)
                                </label>
                                <div className="text-lg font-bold text-gray-700">
                                    ₹{Number(formData.transport_fees || 0).toFixed(2)}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Locked (Accumulated from all legs)</p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                    Distributor Margin (₹)
                                </label>
                                <div className="text-lg font-bold text-gray-700">
                                    ₹{Number(formData.distributor_margin || 0).toFixed(2)}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Locked (Set by Distributor)</p>
                            </div>

                            <div className="bg-white p-3 rounded-lg border-2 border-primary/30 ring-1 ring-primary/10 shadow-sm">
                                <label className="block text-xs font-bold text-primary uppercase mb-1">
                                    Your Retailer Margin (₹) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.retailer_margin}
                                    onChange={(e) => setFormData({ ...formData, retailer_margin: e.target.value })}
                                    className="w-full px-2 py-1 text-lg font-bold text-gray-900 border-none focus:ring-0 focus:outline-none bg-transparent"
                                    placeholder="0.00"
                                    step="0.01"
                                    required
                                    min="0"
                                />
                                <p className="text-[10px] text-primary/70 mt-1 font-medium italic">Adjust your margin here</p>
                            </div>
                        </div>

                        {/* Total Price Display */}
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    <span className="font-medium text-gray-900">Total Retail Price</span>
                                </div>
                                <span className="text-2xl font-bold text-primary">
                                    ₹{calculateTotalPrice().toLocaleString('hi-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                                This is the final price consumers will see
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/retailer/dashboard')}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || batches.length === 0}
                                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                            >
                                {submitting ? 'Creating...' : 'Create Listing'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default NewListingPage;
