import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { bookingApi } from '../api/bookingApi';
import { getSocket } from '../socket/socket';
import { AppNavbar } from '../components/layout/AppNavbar';
import { Card } from '../components/common/Card';
import {
  ArrowLeft,
  Send,
  Radio,
  Clock,
  Bike,
  User,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCheck
} from 'lucide-react';

export const ChatPage = () => {
  const { orderId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial Load: Fetch Order and Message History
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [orderRes, msgRes] = await Promise.all([
          bookingApi.getBookingById(orderId),
          bookingApi.getMessages(orderId)
        ]);

        if (orderRes.success) {
          setOrder(orderRes.order);
        }
        if (msgRes.success) {
          setMessages(msgRes.messages || []);
        }

        // Clear unread count for this order
        try {
          const current = JSON.parse(localStorage.getItem('delhast_unread_chat') || '{}');
          current[orderId] = 0;
          localStorage.setItem('delhast_unread_chat', JSON.stringify(current));
        } catch {}

        // Emit mark_as_read to inform all clients and update MongoDB
        const socket = getSocket();
        socket.emit('mark_as_read', { orderId, userId: user?.id });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order conversation.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, [orderId, user?.id]);

  // Socket.IO Room Joining & Real-Time Incoming Messages
  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();
    socket.emit('join_order', { orderId, userId: user?.id });
    socket.emit('mark_as_read', { orderId, userId: user?.id });

    const handleNewMessage = (newMessage) => {
      if (newMessage.orderId?.toString() === orderId.toString()) {
        setMessages((prev) => {
          // Avoid duplicate messages if already present
          const exists = prev.some((m) => m._id?.toString() === newMessage._id?.toString());
          if (exists) return prev;
          return [...prev, newMessage];
        });

        // Since user is actively on this chat screen, immediately mark read
        socket.emit('mark_as_read', { orderId, userId: user?.id });
        try {
          const current = JSON.parse(localStorage.getItem('delhast_unread_chat') || '{}');
          current[orderId] = 0;
          localStorage.setItem('delhast_unread_chat', JSON.stringify(current));
        } catch {}
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.emit('leave_order', { orderId });
      socket.off('new_message', handleNewMessage);
    };
  }, [orderId, user?.id]);

  // Send Message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    setInputText('');
    setIsSending(true);

    const isCustomer = order?.customerId?._id?.toString() === user?.id?.toString() || order?.customerId?.toString() === user?.id?.toString();
    const senderRole = isCustomer ? 'customer' : 'delivery';

    const socket = getSocket();

    // Send through Socket.IO with HTTP fallback
    socket.emit(
      'send_message',
      {
        orderId,
        senderId: user?.id,
        senderName: user?.fullName,
        senderRole,
        message: trimmed
      },
      async (ack) => {
        setIsSending(false);
        if (!ack || !ack.success) {
          // Fallback to REST API
          try {
            const fallbackRes = await bookingApi.sendMessage(orderId, trimmed);
            if (fallbackRes.success) {
              setMessages((prev) => [...prev, fallbackRes.message]);
            }
          } catch (err) {
            console.error('Failed to send message:', err);
          }
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <AppNavbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-sm font-medium text-slate-600">Connecting to secure chat...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <AppNavbar />
        <div className="flex-1 max-w-md mx-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-800">Chat Unavailable</h2>
          <p className="text-xs text-slate-500">{error || 'Order conversation not found.'}</p>
          <button
            onClick={() => navigate('/dashboard?tab=my_orders')}
            className="px-4 py-2 rounded-xl bg-[#236B48] text-white text-xs font-bold hover:bg-[#1B5638] cursor-pointer"
          >
            Back to My Food Orders
          </button>
        </div>
      </div>
    );
  }

  const isCustomer = order.customerId?._id?.toString() === user?.id?.toString() || order.customerId?.toString() === user?.id?.toString();
  const otherPartyName = isCustomer ? order.deliveryPersonName || 'Delivery Partner' : order.customerName || 'Customer';
  const otherPartyRegNo = isCustomer ? order.deliveryPersonRegistrationNumber : order.customerRegistrationNumber;
  const otherPartyPhone = isCustomer ? order.deliveryPersonPhone : order.customerPhone;
  const otherPartyRole = isCustomer ? 'Delivery Partner 🛵' : 'Customer 👤';

  const handleGoBack = () => {
    const fromTab = location.state?.fromTab;
    if (fromTab) {
      navigate(`/dashboard?tab=${fromTab}`);
    } else if (isCustomer) {
      navigate('/dashboard?tab=my_orders');
    } else {
      navigate('/dashboard?tab=my_deliveries');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 pb-16 md:pb-8">
      <AppNavbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col h-[calc(100vh-5rem)]">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col flex-1 overflow-hidden">
          {/* Chat Header */}
          <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-white/90 backdrop-blur-xs flex items-center justify-between gap-3">
            {/* Left Side: Back + Avatar + Name + Role + Order Number */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handleGoBack}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0"
                title="Back to Orders"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-[#236B48] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {otherPartyName.charAt(0)}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm sm:text-base truncate">{otherPartyName}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-[#236B48] border border-emerald-200/60 shrink-0">
                    {otherPartyRole}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="text-[11px] font-medium">Order #{order.orderNumber}</span>
                </div>
              </div>
            </div>

            {/* Right Side: Registration Number */}
            <div className="shrink-0 flex items-center">
              <span className="inline-flex items-center gap-1.5 font-mono font-bold text-xs sm:text-sm text-amber-900 bg-amber-50/90 px-3 py-1.5 rounded-xl border border-amber-200/80 shadow-2xs">
                <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Reg. No: {otherPartyRegNo || 'Student'}</span>
              </span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#236B48] flex items-center justify-center">
                  💬
                </div>
                <h4 className="text-sm font-bold text-slate-700">Direct Delivery Chat</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Coordinate pickup details, room directions, or item substitutions in real-time.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.senderId?.toString() === user?.id?.toString();
                const time = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';
                const senderReg = msg.senderRegistrationNumber || (isMe ? user?.registrationNumber : otherPartyRegNo);

                return (
                  <div
                    key={msg._id || index}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {/* Name + Registration Number Label */}
                    <div className={`flex items-center gap-1.5 mb-1 text-[11px] px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <span className={`font-bold ${isMe ? 'text-indigo-600' : 'text-[#236B48]'}`}>
                        {isMe ? 'You' : msg.senderName}
                      </span>
                      {senderReg && (
                        <span className="font-mono text-[10px] font-semibold text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded-md">
                          ({senderReg})
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      <p className="break-words font-normal">{msg.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1 font-mono">
                      {time}
                      {isMe && <CheckCheck className="w-3 h-3 text-indigo-500" />}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bar or Read-Only Banner */}
          {order.status === 'RECEIVED' ? (
            <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-center gap-2 text-center text-xs font-semibold text-slate-500">
              <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>This order has been completed and delivered. Chat is now in read-only mode.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm placeholder:text-slate-400 bg-slate-50/50 outline-hidden transition-all"
                placeholder={`Message ${otherPartyName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all shadow-xs shadow-indigo-600/25 cursor-pointer disabled:cursor-not-allowed"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Watermark / All Rights Reserved */}
        <div className="mt-3 text-center select-none">
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
            © 2026 Delhast Inc. All Rights Reserved. • Campus Delivery Platform
          </p>
        </div>
      </main>
    </div>
  );
};
