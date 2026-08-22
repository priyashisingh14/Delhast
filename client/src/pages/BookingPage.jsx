import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { bookingApi } from '../api/bookingApi';
import { AppNavbar } from '../components/layout/AppNavbar';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import {
  UtensilsCrossed,
  Bike,
  PackageCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  X,
  Clock,
  MessageSquare,
  DollarSign
} from 'lucide-react';

export const BookingPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Booking Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    foodDetails: '',
    quantity: 1,
    pickupLocation: '',
    deliveryLocation: '',
    specialInstructions: '',
    estimatedAmount: '',
    deliveryFee: 20
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenModal = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      setIsModalOpen(false);
      setErrorMessage('');
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.foodDetails.trim()) {
      setErrorMessage('Please enter what food items or meal you would like to order.');
      return;
    }
    if (!formData.pickupLocation.trim()) {
      setErrorMessage('Please specify the canteen, food stall, or pickup location.');
      return;
    }
    if (!formData.deliveryLocation.trim()) {
      setErrorMessage('Please specify your delivery drop-off location (e.g. Hostel & Room No).');
      return;
    }

    setIsLoading(true);

    try {
      const result = await bookingApi.createBooking({
        foodDetails: formData.foodDetails.trim(),
        quantity: Number(formData.quantity) || 1,
        pickupLocation: formData.pickupLocation.trim(),
        deliveryLocation: formData.deliveryLocation.trim(),
        specialInstructions: formData.specialInstructions.trim(),
        estimatedAmount: Number(formData.estimatedAmount) || 0,
        deliveryFee: Number(formData.deliveryFee) || 20
      });

      if (result.success) {
        setSuccessMessage(`Order #${result.order?.orderNumber} placed successfully!`);
        setTimeout(() => {
          setIsModalOpen(false);
          navigate('/dashboard');
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to create booking. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 pb-16">
      <AppNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Delhast Branding Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-indigo-700 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Delhast • Delhivery Your Way !</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Campus Food & Delivery Hub
          </h1>

          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto font-normal">
            Every verified student on <strong>Delhast</strong> can place food orders from any campus canteen or earn by picking up meals for peers across hostels.
          </p>
        </div>

        {/* 3 Option Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Card 1: Deliver & Earn */}
          <Card className="p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:shadow-md hover:border-amber-300 transition-all border-slate-200/80 bg-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center shadow-2xs">
                  <Bike className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Earn ₹20-50 / trip
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">Deliver an Order</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Already at the food court or canteen? Accept an order on your route and deliver it to a hostel room for a quick fee.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Choose any open order on the feed</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Real-time 1-on-1 chat with customer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Earn delivery fee upon completion</span>
                </li>
              </ul>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs"
            >
              <span>Explore Available Deliveries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Card 2: Order Food to Your Door (Primary Action) */}
          <Card className="p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:shadow-md hover:border-indigo-400 transition-all border-indigo-200 bg-gradient-to-br from-white via-indigo-50/20 to-violet-50/20 relative overflow-hidden ring-2 ring-indigo-500/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <UtensilsCrossed className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Direct to Room
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">Order Food to Your Door</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Busy studying or tired? Post what you want from any canteen, Nescafe, or food stall, and a student peer will bring it.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Order from any campus eatery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Direct chat with assigned partner</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Mark "Received" when food arrives</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm shadow-indigo-600/25 cursor-pointer"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Create Food Booking</span>
            </button>
          </Card>

          {/* Card 3: Active Orders & Live Chat */}
          <Card className="p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:shadow-md hover:border-emerald-300 transition-all border-slate-200/80 bg-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shadow-2xs">
                  <PackageCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Feed & Chat
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">My Orders & Live Chat</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Track the real-time status of your food orders, chat 1-on-1 with delivery peers, and view your completed delivery history.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time status updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct 1-on-1 socket chat messaging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Manage active food deliveries</span>
                </li>
              </ul>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs"
            >
              <span>View My Active Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>
      </main>

      {/* Clean Food Order Booking Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={handleCloseModal}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 z-10 overflow-hidden space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Create Food Order on Delhast
                  </h2>
                </div>
                <p className="text-xs text-slate-500 pl-10">
                  Fill in your food details to broadcast on the campus delivery feed.
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                disabled={isLoading}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Alert */}
            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage} Opening your dashboard...</span>
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Food Details & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <Input
                    label="Food / Meal Details *"
                    name="foodDetails"
                    placeholder="e.g. 2x Masala Dosa + 1x Cold Coffee"
                    value={formData.foodDetails}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Quantity *"
                    name="quantity"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Pickup & Delivery Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <Input
                    label="Pickup Canteen / Stall *"
                    name="pickupLocation"
                    placeholder="e.g. Central Food Court (Stall 3)"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Drop-Off Location *"
                    name="deliveryLocation"
                    placeholder="e.g. Hostel 4, Room 312"
                    value={formData.deliveryLocation}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Estimated Amount & Delivery Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <Input
                    label="Estimated Food Cost (₹)"
                    name="estimatedAmount"
                    type="number"
                    min="0"
                    placeholder="e.g. 180"
                    value={formData.estimatedAmount}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Input
                    label="Delivery Fee / Tip (₹) *"
                    name="deliveryFee"
                    type="number"
                    min="10"
                    placeholder="20"
                    value={formData.deliveryFee}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Instructions (Optional)
                </label>
                <textarea
                  name="specialInstructions"
                  rows="2"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs placeholder:text-slate-400 bg-white transition-all outline-hidden resize-none"
                  placeholder="e.g. Please ask for extra green chutney or call when downstairs."
                  value={formData.specialInstructions}
                  onChange={handleChange}
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="w-full sm:w-auto font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isLoading}
                  className="w-full sm:w-auto font-bold shadow-md shadow-indigo-600/20"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 mr-1.5" />
                  <span>{isLoading ? 'Posting Order...' : 'Post Food Order'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
