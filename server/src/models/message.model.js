const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender user ID is required'],
      index: true
    },
    senderName: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true
    },
    senderRegistrationNumber: {
      type: String,
      default: null,
      trim: true
    },
    senderRole: {
      type: String,
      enum: ['customer', 'delivery'],
      required: true
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound index for high-speed chronological chat retrieval per order
messageSchema.index({ orderId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
