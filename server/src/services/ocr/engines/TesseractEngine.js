const { createWorker } = require('tesseract.js');
const logger = require('../../../utils/logger');

/**
 * Tesseract.js OCR Engine (WASM-based, zero native system binaries required)
 */
class TesseractEngine {
  constructor() {
    this.worker = null;
    this.isInitializing = false;
  }

  async getWorker() {
    if (this.worker) return this.worker;
    
    try {
      this.isInitializing = true;
      logger.info('Initializing Tesseract OCR worker...');
      this.worker = await createWorker('eng');
      logger.success('Tesseract OCR worker initialized');
      this.isInitializing = false;
      return this.worker;
    } catch (error) {
      this.isInitializing = false;
      logger.error('Failed to initialize Tesseract worker:', error.message);
      throw error;
    }
  }

  /**
   * Perform OCR on an image buffer
   * @param {Buffer} imageBuffer 
   * @returns {Promise<{ text: string, confidence: number }>}
   */
  async recognize(imageBuffer) {
    try {
      const worker = await this.getWorker();
      const result = await worker.recognize(imageBuffer);

      return {
        text: result.data.text || '',
        confidence: result.data.confidence || 0,
        words: result.data.words || []
      };
    } catch (error) {
      logger.error('Tesseract recognition error:', error.message);
      throw error;
    }
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      logger.info('Tesseract OCR worker terminated');
    }
  }
}

module.exports = new TesseractEngine();
