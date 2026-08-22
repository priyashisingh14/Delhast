const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
      index: true
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    customerRegistrationNumber: {
      type: String,
      default: null,
      trim: true
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true
    },
    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    deliveryPersonName: {
      type: String,
      default: null,
      trim: true
    },
    deliveryPersonRegistrationNumber: {
      type: String,
      default: null,
      trim: true
    },
    deliveryPersonPhone: {
      type: String,
      default: null,
      trim: true
    },
    foodDetails: {
      type: String,
      required: [true, 'Food and item details are required'],
      trim: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup / canteen location is required'],
      trim: true
    },
    deliveryLocation: {
      type: String,
      required: [true, 'Delivery drop-off location is required'],
      trim: true
    },
    specialInstructions: {
      type: String,
      default: '',
      trim: true
    },
    estimatedAmount: {
      type: Number,
      default: 0
    },
    deliveryFee: {
      type: Number,
      default: 20
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ACCEPTED', 'DELIVERY_IN_PROGRESS', 'RECEIVED', 'CANCELLED'],
      default: 'AVAILABLE',
      index: true
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    inProgressAt: {
      type: Date,
      default: null
    },
    receivedAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Helper function to generate clean human-readable order numbers (e.g. ORD-48921)
orderSchema.statics.generateOrderNumber = async function () {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `ORD-${randomSuffix}`;
  const existing = await this.findOne({ orderNumber });
  if (existing) {
    return this.generateOrderNumber();
  }
  return orderNumber;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
