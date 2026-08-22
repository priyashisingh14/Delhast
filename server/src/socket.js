const mongoose = require('mongoose');
const { Server } = require('socket.io');
const Message = require('./models/message.model');
const Order = require('./models/order.model');
const User = require('./models/user.model');
const logger = require('./utils/logger');

let io = null;

const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`[Socket.IO] New client connected: ${socket.id}`);

    // Join a specific order's real-time communication room
    socket.on('join_order', ({ orderId, userId }) => {
      if (!orderId) return;
      const roomName = `order_${orderId}`;
      socket.join(roomName);
      logger.debug(`[Socket.IO] User ${userId || 'anonymous'} joined room: ${roomName}`);
      socket.to(roomName).emit('user_connected', { userId, timestamp: new Date() });
    });

    // Leave order room
    socket.on('leave_order', ({ orderId }) => {
      if (!orderId) return;
      const roomName = `order_${orderId}`;
      socket.leave(roomName);
      logger.debug(`[Socket.IO] Socket ${socket.id} left room: ${roomName}`);
    });

    // Handle real-time chat message dispatch
    socket.on('send_message', async (data, callback) => {
      try {
        const { orderId, senderId, senderName, senderRole, message } = data;
        if (!orderId || !message || !senderId) {
          if (callback) callback({ success: false, error: 'MISSING_FIELDS' });
          return;
        }

        // Verify order exists
        const order = await Order.findById(orderId);
        if (!order) {
          if (callback) callback({ success: false, error: 'ORDER_NOT_FOUND' });
          return;
        }

        // Prevent sending messages if order is already delivered
        if (order.status === 'RECEIVED') {
          if (callback) callback({
            success: false,
            error: 'ORDER_ALREADY_DELIVERED',
            message: 'This order has already been delivered. New messages cannot be sent.'
          });
          return;
        }

        // Save message to MongoDB
        const senderUser = await User.findById(senderId);
        const newMessage = await Message.create({
          orderId,
          senderId,
          senderName: senderUser?.fullName || senderName || 'User',
          senderRegistrationNumber: senderUser?.registrationNumber || data.senderRegistrationNumber || null,
          senderRole: senderRole || (order.customerId.toString() === senderId.toString() ? 'customer' : 'delivery'),
          message: message.trim()
        });

        // Broadcast to both customer & delivery partner in the room
        const roomName = `order_${orderId}`;
        io.to(roomName).emit('new_message', newMessage);

        // Broadcast notification globally so recipient's dashboard shows red unread badge immediately
        io.emit('new_message_notification', {
          _id: newMessage._id,
          orderId: newMessage.orderId,
          senderId: newMessage.senderId,
          senderName: newMessage.senderName,
          senderRegistrationNumber: newMessage.senderRegistrationNumber,
          senderRole: newMessage.senderRole,
          message: newMessage.message,
          customerId: order.customerId,
          deliveryPersonId: order.deliveryPersonId,
          createdAt: newMessage.createdAt
        });

        if (callback) callback({ success: true, message: newMessage });
      } catch (err) {
        logger.error('[Socket.IO] send_message error:', err.message);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Handle mark as read event
    socket.on('mark_as_read', async ({ orderId, userId }) => {
      if (!orderId || !userId) return;
      try {
        const userObjId = new mongoose.Types.ObjectId(userId);
        const orderObjId = new mongoose.Types.ObjectId(orderId);
        await Message.updateMany(
          {
            orderId: orderObjId,
            senderId: { $ne: userObjId }
          },
          {
            $addToSet: { readBy: userObjId },
            $set: { isRead: true }
          }
        );
        io.emit('messages_read', { orderId, userId });
      } catch (err) {
        logger.error('[Socket.IO] mark_as_read error:', err.message);
      }
    });

    // Handle order status lifecycle events
    socket.on('update_order_status', (data) => {
      const { orderId, status } = data;
      if (!orderId || !status) return;
      io.to(`order_${orderId}`).emit('order_status_updated', { orderId, status });
    });

    socket.on('disconnect', () => {
      logger.debug(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  logger.success('🚀 Socket.IO Real-Time Server initialized');
  return io;
};

const getIO = () => {
  return io;
};

module.exports = {
  initSocket,
  getIO
};
