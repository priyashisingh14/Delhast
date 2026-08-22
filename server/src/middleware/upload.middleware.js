const multer = require('multer');
const sharp = require('sharp');
const env = require('../config/env');
const logger = require('../utils/logger');

// Store files in memory for zero-persistence processing and fast OCR
const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 // e.g. 5 MB
  },
  fileFilter
});

/**
 * Middleware to strictly validate image buffer integrity with Sharp
 */
const validateImageBuffer = async (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({
      success: false,
      error: 'FILE_REQUIRED',
      message: 'College ID card image file is required.'
    });
  }

  try {
    const image = sharp(req.file.buffer);
    const metadata = await image.metadata();

    if (!metadata || !metadata.format) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_IMAGE',
        message: 'The uploaded file is not a valid image.'
      });
    }

    if (metadata.width < 200 || metadata.height < 200) {
      return res.status(400).json({
        success: false,
        error: 'IMAGE_TOO_SMALL',
        message: 'Image resolution is too low. Please upload a clear photo of your ID card.'
      });
    }

    req.imageMetadata = metadata;
    next();
  } catch (error) {
    logger.warn('Image verification failed:', error.message);
    return res.status(400).json({
      success: false,
      error: 'CORRUPT_IMAGE',
      message: 'Corrupted or unreadable image file.'
    });
  }
};

module.exports = {
  uploadIdCard: upload.single('idCardImage'),
  validateImageBuffer
};
