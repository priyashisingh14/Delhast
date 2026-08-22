const express = require('express');
const router = express.Router();
const identityController = require('../controllers/identity.controller');
const { uploadIdCard, validateImageBuffer } = require('../middleware/upload.middleware');
const { ocrUploadLimiter } = require('../middleware/rateLimiter.middleware');

// Upload and verify College ID Card
router.post(
  '/verify',
  ocrUploadLimiter,
  uploadIdCard,
  validateImageBuffer,
  identityController.verifyIdCard
);

module.exports = router;
