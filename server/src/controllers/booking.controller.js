const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');
const { getIO } = require('../socket');
const logger = require('../utils/logger');

/**
 * 1. Create a New Food Booking (User as Customer)
 */
const createBooking = async (req, res, next) => {
  try {
    const {
      foodDetails,
      quantity = 1,
      pickupLocation,
      deliveryLocation,
      specialInstructions = '',
      estimatedAmount = 0,
      deliveryFee = 20
    } = req.body;

    if (!foodDetails || !pickupLocation || !deliveryLocation) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Food details, pickup location, and delivery location are required.'
      });
    }

    // Fetch customer details from User model
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Authenticated user account not found.'
      });
    }

    const orderNumber = await Order.generateOrderNumber();

    const newOrder = await Order.create({
      orderNumber,
      customerId: user._id,
      customerName: user.fullName,
      customerRegistrationNumber: user.registrationNumber,
      customerPhone: user.phone,
      foodDetails: foodDetails.trim(),
      quantity: Number(quantity) || 1,
      pickupLocation: pickupLocation.trim(),
      deliveryLocation: deliveryLocation.trim(),
      specialInstructions: specialInstructions.trim(),
      estimatedAmount: Number(estimatedAmount) || 0,
      deliveryFee: Number(deliveryFee) || 20,
      status: 'AVAILABLE'
    });

    logger.success(`[Order Created] ${newOrder.orderNumber} by ${user.fullName} (${user.email})`);

    // Broadcast new available order to dashboard viewers
    const io = getIO();
    if (io) {
      io.emit('order_created', newOrder);
    }

    return res.status(201).json({
      success: true,
      message: 'Food booking created successfully and listed on dashboard!',
      order: newOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get Bookings Feed with Filters (Available / My Orders / My Deliveries)
 */
const getBookings = async (req, res, next) => {
  try {
    const { type = 'available' } = req.query;
    const userId = req.user.userId;

    let query = {};

    if (type === 'available') {
      // Orders that are currently AVAILABLE and created by other students
      query = {
        status: 'AVAILABLE',
        customerId: { $ne: userId }
      };
    } else if (type === 'my_orders') {
      // All orders placed by the current user as Customer
      query = { customerId: userId };
    } else if (type === 'my_deliveries') {
      // All orders where the current user is the assigned Delivery Partner
      query = { deliveryPersonId: userId };
    } else if (type === 'all_active') {
      query = {
        $or: [
          { status: 'AVAILABLE' },
          { customerId: userId },
          { deliveryPersonId: userId }
        ]
      };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    // Compute unread message counts per order for the authenticated user
    const orderIds = orders.map((o) => o._id);
    let unreadMap = {};

    if (orderIds.length > 0) {
      try {
        const userObjId = new mongoose.Types.ObjectId(userId);
        const unreadCountsGrouped = await Message.aggregate([
          {
            $match: {
              orderId: { $in: orderIds },
              senderId: { $ne: userObjId },
              readBy: { $ne: userObjId }
            }
          },
          {
            $group: {
              _id: '$orderId',
              count: { $sum: 1 }
            }
          }
        ]);

        unreadCountsGrouped.forEach((item) => {
          unreadMap[item._id.toString()] = item.count;
        });
      } catch (aggErr) {
        logger.error('[Aggregate Unread Error]', aggErr.message);
      }
    }

    const ordersWithUnread = orders.map((order) => {
      const o = order.toObject();
      o.unreadCount = unreadMap[order._id.toString()] || 0;
      return o;
    });

    return res.status(200).json({
      success: true,
      count: ordersWithUnread.length,
      orders: ordersWithUnread
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Get Single Booking by ID
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('customerId', 'fullName registrationNumber phone email')
      .populate('deliveryPersonId', 'fullName registrationNumber phone email');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'The requested order does not exist.'
      });
    }

    const orderObj = order.toObject();
    if (!orderObj.customerRegistrationNumber && orderObj.customerId?.registrationNumber) {
      orderObj.customerRegistrationNumber = orderObj.customerId.registrationNumber;
    }
    if (!orderObj.deliveryPersonRegistrationNumber && orderObj.deliveryPersonId?.registrationNumber) {
      orderObj.deliveryPersonRegistrationNumber = orderObj.deliveryPersonId.registrationNumber;
    }

    return res.status(200).json({
      success: true,
      order: orderObj
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Accept Order (Race-Condition Safe Atomic MongoDB Update)
 */
const acceptBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Fetch delivery partner user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User account not found.'
      });
    }

    // Atomic find and update: guarantees ONLY ONE user can accept the order
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: id,
        status: 'AVAILABLE',
        customerId: { $ne: userId } // Customer cannot deliver their own order
      },
      {
        $set: {
          status: 'ACCEPTED',
          deliveryPersonId: user._id,
          deliveryPersonName: user.fullName,
          deliveryPersonRegistrationNumber: user.registrationNumber,
          deliveryPersonPhone: user.phone,
          acceptedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedOrder) {
      // Check why atomic update did not match
      const checkOrder = await Order.findById(id);
      if (!checkOrder) {
        return res.status(404).json({
          success: false,
          error: 'ORDER_NOT_FOUND',
          message: 'Order does not exist.'
        });
      }

      if (checkOrder.customerId.toString() === userId.toString()) {
        return res.status(400).json({
          success: false,
          error: 'CANNOT_ACCEPT_OWN_ORDER',
          message: 'You cannot accept your own food order booking.'
        });
      }

      return res.status(409).json({
        success: false,
        error: 'ORDER_ALREADY_ACCEPTED',
        message: 'This order has already been accepted by another delivery partner.'
      });
    }

    logger.success(`[Order Accepted] ${updatedOrder.orderNumber} accepted by ${user.fullName}`);

    // Notify connected parties via Socket.IO
    const io = getIO();
    if (io) {
      io.to(`order_${id}`).emit('order_accepted', updatedOrder);
      io.emit('order_status_updated', { orderId: id, status: 'ACCEPTED' });
    }

    return res.status(200).json({
      success: true,
      message: `You have successfully accepted order ${updatedOrder.orderNumber}!`,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Update Order Status (e.g. DELIVERY_IN_PROGRESS)
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const allowedStatuses = ['ACCEPTED', 'DELIVERY_IN_PROGRESS', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'Order not found.'
      });
    }

    // Only assigned delivery partner or customer can change status
    const isDeliveryPerson = order.deliveryPersonId && order.deliveryPersonId.toString() === userId.toString();
    const isCustomer = order.customerId.toString() === userId.toString();

    if (!isDeliveryPerson && !isCustomer) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'You are not authorized to update this order.'
      });
    }

    order.status = status;
    if (status === 'DELIVERY_IN_PROGRESS') {
      order.inProgressAt = new Date();
    } else if (status === 'CANCELLED') {
      order.cancelledAt = new Date();
    }

    await order.save();

    logger.info(`[Order Status Updated] ${order.orderNumber} -> ${status}`);

    const io = getIO();
    if (io) {
      io.to(`order_${id}`).emit('order_status_updated', { orderId: id, status });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Mark Order as Received (Customer Only)
 */
const markBookingReceived = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'Order not found.'
      });
    }

    // Strict Authorization: ONLY the customer who created the booking can mark received
    if (order.customerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Only the customer who placed this order can confirm receipt.'
      });
    }

    if (order.status === 'RECEIVED') {
      return res.status(200).json({
        success: true,
        message: 'Order is already marked as received.',
        order
      });
    }

    order.status = 'RECEIVED';
    order.receivedAt = new Date();
    await order.save();

    logger.success(`[Order Completed] ${order.orderNumber} marked as RECEIVED by customer`);

    const io = getIO();
    if (io) {
      io.to(`order_${id}`).emit('order_status_updated', { orderId: id, status: 'RECEIVED' });
    }

    return res.status(200).json({
      success: true,
      message: 'Order received successfully! Thank you for using Delhast.',
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Get Order Chat Messages
 */
const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'Order not found.'
      });
    }

    // Check authorization: User must be customer or assigned delivery partner
    const isCustomer = order.customerId.toString() === userId.toString();
    const isDeliveryPerson = order.deliveryPersonId && order.deliveryPersonId.toString() === userId.toString();

    if (!isCustomer && !isDeliveryPerson) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'You are not authorized to view this private chat.'
      });
    }

    const messages = await Message.find({ orderId: id }).sort({ createdAt: 1 });

    // Mark messages from the other user as read
    try {
      await Message.updateMany(
        {
          orderId: id,
          senderId: { $ne: new mongoose.Types.ObjectId(userId) }
        },
        {
          $addToSet: { readBy: new mongoose.Types.ObjectId(userId) },
          $set: { isRead: true }
        }
      );
    } catch (readErr) {
      logger.error('[Mark Read Error]', readErr.message);
    }

    return res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Send Chat Message (HTTP fallback for Socket.IO)
 */
const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Message text cannot be empty.'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'Order not found.'
      });
    }

    const isCustomer = order.customerId.toString() === userId.toString();
    const isDeliveryPerson = order.deliveryPersonId && order.deliveryPersonId.toString() === userId.toString();

    if (!isCustomer && !isDeliveryPerson) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'You are not authorized to send messages in this order.'
      });
    }

    if (order.status === 'RECEIVED') {
      return res.status(400).json({
        success: false,
        error: 'ORDER_ALREADY_DELIVERED',
        message: 'This order has already been delivered. New messages cannot be sent.'
      });
    }

    const user = await User.findById(userId);

    const newMessage = await Message.create({
      orderId: id,
      senderId: user._id,
      senderName: user.fullName,
      senderRegistrationNumber: user.registrationNumber,
      senderRole: isCustomer ? 'customer' : 'delivery',
      message: message.trim()
    });

    const io = getIO();
    if (io) {
      io.to(`order_${id}`).emit('new_message', newMessage);
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
    }

    return res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 9. Cancel Food Booking (Customer only, only if AVAILABLE)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'Order not found.'
      });
    }

    if (order.customerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Only the customer who created this order can remove it.'
      });
    }

    if (order.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        error: 'ORDER_ALREADY_ACCEPTED',
        message: 'This order has already been accepted and cannot be removed.'
      });
    }

    await Order.findByIdAndDelete(id);

    logger.info(`[Order Cancelled/Removed] ${order.orderNumber} by customer`);

    const io = getIO();
    if (io) {
      io.emit('order_cancelled', { orderId: id });
      io.emit('order_status_updated', { orderId: id, status: 'CANCELLED' });
    }

    return res.status(200).json({
      success: true,
      message: 'Food order cancelled and removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  acceptBooking,
  updateBookingStatus,
  markBookingReceived,
  getMessages,
  sendMessage,
  cancelBooking
};
