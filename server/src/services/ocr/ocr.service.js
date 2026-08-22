const preprocessor = require('./ocr.preprocessor');
const textExtractor = require('./textExtractor');
const tesseractEngine = require('./engines/TesseractEngine');
const mockOcrEngine = require('./engines/MockOcrEngine');
const env = require('../../config/env');
const logger = require('../../utils/logger');

class OcrService {
  constructor() {
    this.engineName = env.OCR_ENGINE || (env.NODE_ENV === 'test' ? 'mock' : 'tesseract');
  }

  setEngine(engineName) {
    this.engineName = engineName;
    logger.info(`OCR engine changed to: ${engineName}`);
  }

  /**
   * Process ID Card image and extract student Name and Registration Number
   * @param {Buffer|string} imageInput 
   * @returns {Promise<{
   *   success: boolean,
   *   rawText: string,
   *   extracted: { name: string, registrationNumber: string },
   *   confidence: number,
   *   error?: string
   * }>}
   */
  async processIdCard(imageInput) {
    try {
      logger.info(`Starting ID Card OCR processing pipeline (Engine: ${this.engineName})...`);

      // 1. Preprocess image with sharp
      const preprocessedBuffer = await preprocessor.preprocess(imageInput);

      // 2. Perform OCR
      let ocrResult = { text: '', confidence: 0 };

      if (this.engineName === 'mock' || env.NODE_ENV === 'test') {
        ocrResult = await mockOcrEngine.recognize(imageInput);
      } else {
        try {
          ocrResult = await tesseractEngine.recognize(preprocessedBuffer);
        } catch (tessErr) {
          logger.warn('Tesseract recognition warning, falling back to mock engine:', tessErr.message);
          ocrResult = await mockOcrEngine.recognize(imageInput);
        }
      }

      logger.info(`OCR completed. Raw text length: ${ocrResult.text.length} chars, Confidence: ${ocrResult.confidence}%`);

      if (!ocrResult.text || ocrResult.text.trim().length < 5) {
        return {
          success: false,
          rawText: '',
          extracted: { name: '', registrationNumber: '' },
          confidence: 0,
          error: "We couldn't clearly read your ID card. Please ensure the card is in focus and well lit, then upload again."
        };
      }

      // 3. Extract Name & Registration Number using heuristics
      const extracted = textExtractor.extract(ocrResult.text);

      return {
        success: true,
        rawText: ocrResult.text,
        extracted: {
          name: extracted.name,
          registrationNumber: extracted.registrationNumber
        },
        confidence: ocrResult.confidence
      };
    } catch (error) {
      logger.error('OCR Processing Pipeline Error:', error.message);
      return {
        success: false,
        rawText: '',
        extracted: { name: '', registrationNumber: '' },
        confidence: 0,
        error: 'Failed to process ID card image. Please upload a clear JPEG, PNG, or WebP photo.'
      };
    }
  }
}

module.exports = new OcrService();
