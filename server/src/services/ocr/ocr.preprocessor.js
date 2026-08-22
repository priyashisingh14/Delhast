const sharp = require('sharp');
const logger = require('../../utils/logger');

/**
 * Image preprocessor for OCR accuracy.
 * Enhances contrast, converts to grayscale, removes noise, and standardizes resolution.
 */
class ImagePreprocessor {
  /**
   * Preprocess image buffer or file path
   * @param {Buffer|string} input 
   * @returns {Promise<Buffer>} Preprocessed image buffer (PNG)
   */
  async preprocess(input) {
    try {
      let image = sharp(input);

      const metadata = await image.metadata();
      logger.debug(`Original image dimensions: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

      // Standardize size (upscale if small, downscale if huge)
      let resizeOptions = {};
      if (metadata.width && metadata.width < 1200) {
        resizeOptions.width = 1600;
      } else if (metadata.width && metadata.width > 3000) {
        resizeOptions.width = 2400;
      }

      let pipeline = image
        .rotate() // Auto-orient based on EXIF
        .grayscale() // Remove color noise
        .normalise() // Enhance dynamic range / contrast
        .sharpen(); // Crisp character edges

      if (resizeOptions.width) {
        pipeline = pipeline.resize({ width: resizeOptions.width, withoutEnlargement: false });
      }

      const preprocessedBuffer = await pipeline.png().toBuffer();
      logger.debug('Image preprocessing completed successfully');

      return preprocessedBuffer;
    } catch (error) {
      logger.warn('Sharp preprocessing warning, falling back to original buffer:', error.message);
      if (Buffer.isBuffer(input)) return input;
      return await sharp(input).toBuffer();
    }
  }
}

module.exports = new ImagePreprocessor();
