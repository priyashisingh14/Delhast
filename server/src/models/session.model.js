const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userAgent: {
      type: String,
      default: 'Unknown'
    },
    ipAddress: {
      type: String,
      default: 'Unknown'
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index: auto removal after 30 days
    },
    revokedAt: {
      type: Date
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

sessionSchema.index({ userId: 1, isRevoked: 1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
