import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { bookingApi } from '../api/bookingApi';
import { getSocket } from '../socket/socket';
import { AppNavbar } from '../components/layout/AppNavbar';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import {
  CampusArchitectureIllustration,
  HeroDeliveryIllustration,
  StudentAvatarIllustration,
  FooterFoodBagIllustration,
  FooterScooterIllustration
} from '../components/common/DashboardIllustrations';
import {
  UtensilsCrossed,
  Bike,
  PackageCheck,
  Clock,
  MapPin,
  ShoppingBag,
  SlidersHorizontal,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Phone,
  User,
  X,
  Plus,
  Search,
  ArrowRight,
  Trash2
} from 'lucide-react';

// Curated food thumbnails matching canteen meals
const FOOD_IMAGES = {
  chole: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&auto=format&fit=crop&q=80',
  paneer: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop&q=80',
  thali: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop&q=80',
  sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&auto=format&fit=crop&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
  dosa: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&auto=format&fit=crop&q=80',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80',
  coffee: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80'
};

const getFoodImage = (foodText) => {
  if (!foodText) return FOOD_IMAGES.default;
  const lower = foodText.toLowerCase();
  if (lower.includes('chole') || lower.includes('bhature')) return FOOD_IMAGES.chole;
  if (lower.includes('paneer') || lower.includes('thali') || lower.includes('rice')) return FOOD_IMAGES.paneer;
  if (lower.includes('sandwich') || lower.includes('toast')) return FOOD_IMAGES.sandwich;
  if (lower.includes('burger')) return FOOD_IMAGES.burger;
  if (lower.includes('dosa') || lower.includes('idli')) return FOOD_IMAGES.dosa;
  if (lower.includes('biryani')) return FOOD_IMAGES.biryani;
  if (lower.includes('coffee') || lower.includes('chai') || lower.includes('tea')) return FOOD_IMAGES.coffee;
  return FOOD_IMAGES.default;
};

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read initial tab directly from URL query parameters (e.g. /dashboard?tab=my_orders)
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['available', 'my_orders', 'my_deliveries'].includes(tabParam)) {
      return tabParam;
    }
    return 'available';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingOrderId, setAcceptingOrderId] = useState(null);
  const [receivingOrderId, setReceivingOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  // Unread chat counts per order
  const [unreadCounts, setUnreadCounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('delhast_unread_chat') || '{}');
    } catch {
      return {};
    }
  });

  // Mapping orderId -> 'my_orders' | 'my_deliveries' to route badges to correct tab
  const [unreadRoleMap, setUnreadRoleMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('delhast_unread_roles') || '{}');
    } catch {
      return {};
    }
  });

  // Filter Bar State
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [formData, setFormData] = useState({
    foodDetails: '',
    quantity: 1,
    pickupLocation: '',
    deliveryLocation: '',
    specialInstructions: '',
    estimatedAmount: '',
    deliveryFee: 20
  });

  const feedSectionRef = useRef(null);
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Sync state if URL query parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const actionParam = searchParams.get('action');

    if (tabParam && ['available', 'my_orders', 'my_deliveries'].includes(tabParam)) {
      if (tabParam !== activeTab) {
        setActiveTab(tabParam);
      }
    }
    if (actionParam === 'create-order') {
      setIsBookingModalOpen(true);
    }
  }, [searchParams]);

  // Fetch orders according to active tab with race-condition guard
  const fetchOrders = async (tabToFetch = activeTab, silent = false) => {
    if (!silent) setIsLoading(true);
    setError('');
    try {
      const data = await bookingApi.getBookings(tabToFetch);
      // Guard: only update state if the user is still on this tab
      if (data.success && activeTabRef.current === tabToFetch) {
        setOrders(data.orders || []);

        // Sync backend unread counts into state
        const backendUnreads = {};
        (data.orders || []).forEach((o) => {
          backendUnreads[o._id] = typeof o.unreadCount === 'number' ? o.unreadCount : 0;
        });

        setUnreadCounts((prev) => {
          const updated = { ...backendUnreads };
          try {
            localStorage.setItem('delhast_unread_chat', JSON.stringify(updated));
          } catch {}
          return updated;
        });

        // Register role map for fetched orders
        setUnreadRoleMap((prev) => {
          const updated = { ...prev };
          (data.orders || []).forEach((o) => {
            const isCust = o.customerId?._id?.toString() === user?.id?.toString() || o.customerId?.toString() === user?.id?.toString();
            updated[o._id] = isCust ? 'my_orders' : 'my_deliveries';
          });
          try {
            localStorage.setItem('delhast_unread_roles', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch (err) {
      if (activeTabRef.current === tabToFetch) {
        setError(err.response?.data?.message || 'Failed to load delivery orders. Please try again.');
      }
    } finally {
      if (activeTabRef.current === tabToFetch && !silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const socket = getSocket();

    const handleOrderCreated = () => {
      if (activeTab === 'available') {
        fetchOrders('available', true);
      }
    };

    const handleOrderStatusUpdated = () => {
      fetchOrders(activeTab, true);
    };

    const handleOrderCancelled = () => {
      fetchOrders(activeTab, true);
    };

    const handleNewGlobalMessage = (msg) => {
      if (!msg || !msg.orderId) return;

      const msgSenderId = msg.senderId?._id?.toString() || msg.senderId?.toString();
      const currentUserId = user?.id?.toString() || user?._id?.toString();

      // Only increment for the recipient
      if (msgSenderId && currentUserId && msgSenderId !== currentUserId) {
        setUnreadCounts((prev) => {
          const updated = { ...prev, [msg.orderId]: (prev[msg.orderId] || 0) + 1 };
          try {
            localStorage.setItem('delhast_unread_chat', JSON.stringify(updated));
          } catch {}
          return updated;
        });

        if (msg.senderRole) {
          setUnreadRoleMap((prev) => {
            const targetTab = msg.senderRole === 'delivery' ? 'my_orders' : 'my_deliveries';
            const updated = { ...prev, [msg.orderId]: targetTab };
            try {
              localStorage.setItem('delhast_unread_roles', JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      }
    };

    const handleMessagesRead = ({ orderId, userId: readUserId }) => {
      const currentUserId = user?.id?.toString() || user?._id?.toString();
      if (readUserId?.toString() === currentUserId?.toString()) {
        setUnreadCounts((prev) => {
          const updated = { ...prev, [orderId]: 0 };
          try {
            localStorage.setItem('delhast_unread_chat', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    };

    socket.on('order_created', handleOrderCreated);
    socket.on('order_status_updated', handleOrderStatusUpdated);
    socket.on('order_accepted', handleOrderStatusUpdated);
    socket.on('order_cancelled', handleOrderCancelled);
    socket.on('new_message', handleNewGlobalMessage);
    socket.on('new_message_notification', handleNewGlobalMessage);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('order_created', handleOrderCreated);
      socket.off('order_status_updated', handleOrderStatusUpdated);
      socket.off('order_accepted', handleOrderStatusUpdated);
      socket.off('order_cancelled', handleOrderCancelled);
      socket.off('new_message', handleNewGlobalMessage);
      socket.off('new_message_notification', handleNewGlobalMessage);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [activeTab, user?.id]);

  // Handle Tab Click
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchQuery('');
    navigate(`/dashboard?tab=${newTab}`, { replace: true });
  };

  // Handle Open Chat (Clear unread)
  const handleOpenChat = (orderId) => {
    setUnreadCounts((prev) => {
      const updated = { ...prev, [orderId]: 0 };
      try {
        localStorage.setItem('delhast_unread_chat', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const socket = getSocket();
    socket.emit('mark_as_read', { orderId, userId: user?.id });
  };

  // Handle Cancel Order (Customer only, only if AVAILABLE)
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel and remove this food order?')) return;
    setCancellingOrderId(orderId);
    setActionSuccessMessage('');
    setError('');
    try {
      const res = await bookingApi.cancelBooking(orderId);
      if (res.success) {
        setActionSuccessMessage('Food order removed successfully.');
        fetchOrders(activeTab, true);
        setTimeout(() => setActionSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Handle Accept Order
  const handleAcceptOrder = async (orderId) => {
    setAcceptingOrderId(orderId);
    setActionSuccessMessage('');
    setError('');
    try {
      const res = await bookingApi.acceptBooking(orderId);
      if (res.success) {
        setActionSuccessMessage(`Order #${res.order?.orderNumber || ''} accepted! Moved to your active deliveries.`);
        setTimeout(() => {
          setActiveTab('my_deliveries');
          setActionSuccessMessage('');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not accept order. It may have already been taken.');
      fetchOrders(activeTab, true);
    } finally {
      setAcceptingOrderId(null);
    }
  };

  // Handle Start Delivery
  const handleStartDelivery = async (orderId) => {
    setUpdatingStatusId(orderId);
    setError('');
    try {
      const res = await bookingApi.updateBookingStatus(orderId, 'DELIVERY_IN_PROGRESS');
      if (res.success) {
        setActionSuccessMessage('Status updated: Out for delivery! 🛵');
        fetchOrders(activeTab, true);
        setTimeout(() => setActionSuccessMessage(''), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Handle Mark Received
  const handleMarkReceived = async (orderId) => {
    setReceivingOrderId(orderId);
    setError('');
    try {
      const res = await bookingApi.markBookingReceived(orderId);
      if (res.success) {
        setActionSuccessMessage('Order marked as received! Delivery completed successfully. ✓');
        fetchOrders(activeTab, true);
        setTimeout(() => setActionSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark order as received.');
    } finally {
      setReceivingOrderId(null);
    }
  };

  // Handle Booking Form Submit
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!formData.foodDetails.trim()) {
      setBookingError('Please enter what food items or meal you would like to order.');
      return;
    }
    if (!formData.pickupLocation.trim()) {
      setBookingError('Please specify the canteen, food stall, or pickup location.');
      return;
    }
    if (!formData.deliveryLocation.trim()) {
      setBookingError('Please specify your delivery drop-off location (e.g. Hostel & Room No).');
      return;
    }

    setIsCreatingOrder(true);

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
        setIsBookingModalOpen(false);
        setActionSuccessMessage(`Food order #${result.order?.orderNumber} posted successfully!`);
        setActiveTab('my_orders');
        fetchOrders('my_orders');

        // Reset form
        setFormData({
          foodDetails: '',
          quantity: 1,
          pickupLocation: '',
          deliveryLocation: '',
          specialInstructions: '',
          estimatedAmount: '',
          deliveryFee: 20
        });

        setTimeout(() => setActionSuccessMessage(''), 3500);
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to post order. Please check your details.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Helper date / time format
  const formatOrderTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filtered orders list based on search query
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.foodDetails?.toLowerCase().includes(q) ||
      order.pickupLocation?.toLowerCase().includes(q) ||
      order.deliveryLocation?.toLowerCase().includes(q) ||
      order.customerName?.toLowerCase().includes(q)
    );
  });

  // Calculate total unread counts per tab
  let myOrdersUnreadCount = 0;
  let myDeliveriesUnreadCount = 0;

  // 1. Calculate from loaded orders in current view
  orders.forEach((o) => {
    const isCust = o.customerId?._id?.toString() === user?.id?.toString() || o.customerId?.toString() === user?.id?.toString();
    const count = unreadCounts[o._id] !== undefined ? unreadCounts[o._id] : (o.unreadCount || 0);
    if (count > 0) {
      if (isCust) {
        myOrdersUnreadCount += count;
      } else {
        myDeliveriesUnreadCount += count;
      }
    }
  });

  // 2. Also incorporate real-time unread messages for mapped orders
  Object.entries(unreadCounts).forEach(([orderId, count]) => {
    if (count > 0) {
      const alreadyInList = orders.some((o) => o._id?.toString() === orderId.toString());
      if (!alreadyInList) {
        const targetTab = unreadRoleMap[orderId];
        if (targetTab === 'my_orders') {
          myOrdersUnreadCount += count;
        } else if (targetTab === 'my_deliveries') {
          myDeliveriesUnreadCount += count;
        }
      }
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/40 pb-16">
      <AppNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1. TOP STUDENT PROFILE BANNER (Warm Peach with Campus Architecture) */}
        <div className="bg-gradient-to-r from-[#FFF5ED] via-[#FFF8F2] to-[#FFF0E5] border border-[#FDE5D2] rounded-3xl p-4 sm:p-5 relative overflow-hidden flex items-center justify-between shadow-2xs">
          {/* Left Student Info */}
          <div className="flex items-center gap-4 z-10">
            {/* Student Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xs bg-amber-50">
              <StudentAvatarIllustration />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-1.5">
                <span>{user?.fullName || 'Verified Student'}</span>
                <span className="text-amber-500 text-sm">☀️</span>
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                {user?.registrationNumber && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-amber-200/70 text-slate-700 text-xs font-medium shadow-2xs">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reg. No: {user.registrationNumber}</span>
                  </div>
                )}

                {user?.phoneNumber && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-amber-200/70 text-slate-700 text-xs font-medium shadow-2xs">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Campus Illustration (Decorative) */}
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-80 pointer-events-none">
            <CampusArchitectureIllustration />
          </div>
        </div>

        {/* 2. HERO / PROMO BANNER (Soft Mint Green with Delivery Scooter Graphic) */}
        <div className="bg-gradient-to-r from-[#F0FDF4] via-[#E8F8F0] to-[#DCFCE7] border border-[#D1F2E2] rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
          {/* Left Text & Action */}
          <div className="space-y-3.5 z-10 max-w-lg text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#183B2B] tracking-tight">
              Hey, {user?.fullName?.split(' ')[0] || 'Student'} 👋
            </h1>

            <p className="text-xs sm:text-sm text-[#3D6353] leading-relaxed font-normal">
              Order meals from any campus canteen or earn delivery fees by picking up food for peers across hostels.
            </p>

            <div className="pt-2 flex justify-center md:justify-start">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#236B48] hover:bg-[#1B5638] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/15 hover:shadow-lg transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>New Food Order</span>
              </button>
            </div>
          </div>

          {/* Right Hero Graphic Illustration */}
          <div className="z-10 flex justify-center md:justify-end w-full md:w-auto">
            <HeroDeliveryIllustration />
          </div>
        </div>

        {/* 3. FEED NAVIGATION TABS (No Scrollbar, Full Flex Width) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-100/80 border border-slate-200/70 p-1.5 rounded-2xl w-full sm:w-auto shadow-2xs">
          {/* Tab 1: Available to Deliver */}
          <button
            type="button"
            onClick={() => handleTabChange('available')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'available'
                ? 'bg-white text-[#236B48] shadow-xs border border-emerald-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeTab === 'available' ? 'bg-[#236B48] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <Bike className="w-3 h-3" />
            </div>
            <span>Available to Deliver</span>
          </button>

          {/* Tab 2: My Food Orders */}
          <button
            type="button"
            onClick={() => handleTabChange('my_orders')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
              activeTab === 'my_orders'
                ? 'bg-white text-[#236B48] shadow-xs border border-emerald-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeTab === 'my_orders' ? 'bg-[#236B48] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <ShoppingBag className="w-3 h-3" />
            </div>
            <span>My Food Orders</span>
            {myOrdersUnreadCount > 0 && (
              <span className="min-w-4.5 h-4.5 px-1.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                {myOrdersUnreadCount}
              </span>
            )}
          </button>

          {/* Tab 3: My Active Deliveries */}
          <button
            type="button"
            onClick={() => handleTabChange('my_deliveries')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
              activeTab === 'my_deliveries'
                ? 'bg-white text-[#236B48] shadow-xs border border-emerald-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeTab === 'my_deliveries' ? 'bg-[#236B48] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <PackageCheck className="w-3 h-3" />
            </div>
            <span>My Active Deliveries</span>
            {myDeliveriesUnreadCount > 0 && (
              <span className="min-w-4.5 h-4.5 px-1.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                {myDeliveriesUnreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Global Action Notifications */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3 shadow-xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => fetchOrders(activeTab)}
              className="text-xs font-bold underline hover:text-rose-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* 4. FEED SECTION */}
        <div ref={feedSectionRef} className="space-y-4">
          {/* Feed Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {activeTab === 'available' && 'Available to Deliver'}
                {activeTab === 'my_orders' && 'My Food Orders'}
                {activeTab === 'my_deliveries' && 'My Active Deliveries'}
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                {activeTab === 'available' && 'Pick up orders and earn delivery fees'}
                {activeTab === 'my_orders' && 'Orders placed by you across campus canteens'}
                {activeTab === 'my_deliveries' && 'Orders you have accepted to deliver'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#236B48] hover:bg-[#1B5638] shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Place Food Order</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFilterBar(!showFilterBar)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-2xs transition-all cursor-pointer ${
                  showFilterBar || searchQuery
                    ? 'bg-emerald-50 text-[#236B48] border-emerald-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 bg-white border-slate-200 hover:bg-slate-50'
                }`}
                title="Filter & Search"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Interactive Search / Filter Bar */}
          {showFilterBar && (
            <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 animate-in fade-in">
              <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              <input
                type="text"
                placeholder="Filter by food item, canteen, or drop-off location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs placeholder:text-slate-400 outline-hidden bg-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-2xs flex items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-slate-200 rounded-md" />
                      <div className="h-3 w-24 bg-slate-100 rounded-md" />
                      <div className="h-3 w-40 bg-slate-100 rounded-md" />
                    </div>
                  </div>
                  <div className="h-10 w-28 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredOrders.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 text-center space-y-4 max-w-md mx-auto my-4 shadow-2xs animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#236B48] flex items-center justify-center mx-auto shadow-2xs">
                {activeTab === 'available' && <Bike className="w-7 h-7" />}
                {activeTab === 'my_orders' && <ShoppingBag className="w-7 h-7" />}
                {activeTab === 'my_deliveries' && <PackageCheck className="w-7 h-7" />}
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800">
                  {activeTab === 'available' && 'No Available Deliveries Right Now'}
                  {activeTab === 'my_orders' && 'No Food Orders Placed Yet'}
                  {activeTab === 'my_deliveries' && 'No Active Deliveries Yet'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {activeTab === 'available' && 'All current canteen orders have been accepted! Create your own food order or check back shortly.'}
                  {activeTab === 'my_orders' && 'You have not placed any food orders. Order from any campus canteen to get meals delivered to your room!'}
                  {activeTab === 'my_deliveries' && 'You have not accepted any orders. Go to the "Available to Deliver" tab to pick up orders and earn delivery fees.'}
                </p>
              </div>

              <div className="pt-2">
                {activeTab === 'my_deliveries' ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('available')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#236B48] text-white font-bold text-xs hover:bg-[#1B5638] shadow-xs cursor-pointer"
                  >
                    <Bike className="w-4 h-4" />
                    <span>Explore Available Deliveries</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#236B48] text-white font-bold text-xs hover:bg-[#1B5638] shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Place Food Order</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 5. HORIZONTAL LIST ORDER CARDS */}
          {!isLoading && filteredOrders.length > 0 && (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const isCustomer = order.customerId?._id?.toString() === user?.id?.toString() || order.customerId?.toString() === user?.id?.toString();
                const isDeliveryPerson = order.deliveryPersonId?._id?.toString() === user?.id?.toString() || order.deliveryPersonId?.toString() === user?.id?.toString();
                const foodImage = getFoodImage(order.foodDetails);

                return (
                  <div
                    key={order._id}
                    className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Dish Thumbnail & Details */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Circular Food Photo */}
                      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full shrink-0 overflow-hidden border-2 border-orange-100 shadow-2xs bg-orange-50">
                        <img
                          src={foodImage}
                          alt={order.foodDetails}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 text-xs shadow-2xs">
                          🍴
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate">
                          {order.foodDetails}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {order.pickupLocation}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">To: {order.deliveryLocation}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400">Qty: {order.quantity}</span>
                          {order.estimatedAmount > 0 && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400">₹{order.estimatedAmount}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Delivery Fee & Pickup Time */}
                    <div className="flex items-center justify-around md:justify-end gap-6 sm:gap-10 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      {/* Delivery Fee Pill */}
                      <div className="flex flex-col items-center">
                        <span className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-xl border border-emerald-200/60 text-xs sm:text-sm">
                          ₹{order.deliveryFee}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">Delivery Fee</span>
                      </div>

                      {/* Pickup Time / Created Time */}
                      <div className="flex flex-col items-center">
                        <span className="text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatOrderTime(order.createdAt)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">Posted Time</span>
                      </div>

                      {/* Right Action Button */}
                      <div className="flex items-center gap-2">
                        {/* CASE 1: AVAILABLE ORDER */}
                        {order.status === 'AVAILABLE' && (
                          <>
                            {isCustomer ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                                  Waiting for partner...
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCancelOrder(order._id)}
                                  disabled={cancellingOrderId === order._id}
                                  className="px-3 py-1.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Cancel and remove this food order"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{cancellingOrderId === order._id ? 'Removing...' : 'Cancel Order'}</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAcceptOrder(order._id)}
                                disabled={acceptingOrderId === order._id}
                                className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1F4C37] text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
                              >
                                {acceptingOrderId === order._id ? 'Accepting...' : 'Accept Order'}
                              </button>
                            )}
                          </>
                        )}

                        {/* CASE 2: ACCEPTED / OUT FOR DELIVERY */}
                        {(order.status === 'ACCEPTED' || order.status === 'DELIVERY_IN_PROGRESS') && (
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/chat/${order._id}`}
                              state={{ fromTab: activeTab }}
                              onClick={() => handleOpenChat(order._id)}
                              className="relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all shadow-2xs"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Chat</span>
                              {unreadCounts[order._id] > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white font-mono text-[9px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                                  {unreadCounts[order._id]}
                                </span>
                              )}
                            </Link>

                            {isCustomer && (
                              <button
                                type="button"
                                onClick={() => handleMarkReceived(order._id)}
                                disabled={receivingOrderId === order._id}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{receivingOrderId === order._id ? 'Updating...' : 'Received'}</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* CASE 3: RECEIVED */}
                        {order.status === 'RECEIVED' && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Delivered ✓</span>
                            </span>
                            <Link
                              to={`/chat/${order._id}`}
                              state={{ fromTab: activeTab }}
                              onClick={() => handleOpenChat(order._id)}
                              className="relative inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors shadow-2xs"
                              title="View Chat History"
                            >
                              <MessageSquare className="w-3 h-3 text-slate-500" />
                              <span>View Chat</span>
                              {unreadCounts[order._id] > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 rounded-full bg-rose-600 text-white font-mono text-[9px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                                  {unreadCounts[order._id]}
                                </span>
                              )}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. BOTTOM PROMOTIONAL FOOTER BANNER */}
        <div className="bg-gradient-to-r from-[#FFFDF9] via-[#FFF8F0] to-[#FFF5EB] border border-[#FDECD8] rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left shadow-2xs">
          {/* Left Paper Food Bag Vector */}
          <div className="shrink-0 flex items-center justify-center">
            <FooterFoodBagIllustration />
          </div>

          {/* Center Message */}
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-slate-800">
              Deliver happiness. Earn with every delivery!
            </h4>
            <p className="text-xs text-slate-500 font-normal">
              Help your peers and make campus life easier, one delivery at a time.
            </p>
          </div>

          {/* Right Scooter Vector */}
          <div className="shrink-0 flex items-center justify-center">
            <FooterScooterIllustration />
          </div>
        </div>

        {/* 7. WATERMARK / ALL RIGHTS RESERVED COPYRIGHT */}
        <footer className="w-full pt-8 pb-4 text-center select-none">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 font-medium">
            <span>© 2026 Delhast Inc. All Rights Reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span>Campus Peer-to-Peer Food Delivery Network</span>
          </div>
        </footer>
      </main>

      {/* POPUP FOOD ORDER BOOKING MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !isCreatingOrder && setIsBookingModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 z-10 overflow-hidden space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#236B48] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Create Food Order on Delhast
                  </h2>
                </div>
                <p className="text-xs text-slate-500 pl-10">
                  Broadcast your meal request on the active campus feed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => !isCreatingOrder && setIsBookingModalOpen(false)}
                disabled={isCreatingOrder}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Alert */}
            {bookingError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <Input
                    label="Food / Meal Details *"
                    name="foodDetails"
                    placeholder="e.g. 2x Masala Dosa + 1x Cold Coffee"
                    value={formData.foodDetails}
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <Input
                    label="Pickup Canteen / Stall *"
                    name="pickupLocation"
                    placeholder="e.g. Central Food Court (Stall 3)"
                    value={formData.pickupLocation}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Drop-Off Location *"
                    name="deliveryLocation"
                    placeholder="e.g. Hostel 4, Room 312"
                    value={formData.deliveryLocation}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <Input
                    label="Estimated Food Cost (₹)"
                    name="estimatedAmount"
                    type="number"
                    min="0"
                    placeholder="e.g. 180"
                    value={formData.estimatedAmount}
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Instructions (Optional)
                </label>
                <textarea
                  name="specialInstructions"
                  rows="2"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#236B48] focus:ring-2 focus:ring-[#236B48]/20 text-xs placeholder:text-slate-400 bg-white transition-all outline-hidden resize-none"
                  placeholder="e.g. Please ask for extra green chutney or call when downstairs."
                  value={formData.specialInstructions}
                  onChange={handleFormChange}
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBookingModalOpen(false)}
                  disabled={isCreatingOrder}
                  className="w-full sm:w-auto font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isCreatingOrder}
                  className="w-full sm:w-auto font-bold bg-[#236B48] hover:bg-[#1B5638] text-white shadow-md shadow-emerald-900/15"
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                  <span>{isCreatingOrder ? 'Posting Order...' : 'Post Food Order'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
