const logger = require('../../../utils/logger');
const textExtractor = require('../textExtractor');

/**
 * Mock OCR Engine for automated tests and offline environments.
 * Parses image buffer metadata or SVG markers if present, or parses standard test cards.
 */
class MockOcrEngine {
  async recognize(imageBuffer) {
    logger.info('Mock OCR Engine processing image buffer...');
    
    const bufferStr = imageBuffer.toString('utf8', 0, Math.min(imageBuffer.length, 5000));

    // Check if buffer contains recognizable text (e.g. from generated SVG/PNG)
    if (bufferStr.includes('Priyashi Singh') || bufferStr.includes('valid_id_priyashi')) {
      return {
        text: 'Apex Institute of Technology\nStudent Name: Priyashi Singh\nReg No: 23CSE101\nCourse: B.Tech\nDepartment: Computer Science and Engineering',
        confidence: 98
      };
    }

    if (bufferStr.includes('Rahul Sharma') || bufferStr.includes('mismatch_name_id')) {
      return {
        text: 'Apex Institute of Technology\nStudent Name: Rahul Sharma\nReg No: 23CSE102\nCourse: B.Tech\nDepartment: Computer Science and Engineering',
        confidence: 96
      };
    }

    if (bufferStr.includes('23CSE999') || bufferStr.includes('mismatch_reg_id')) {
      return {
        text: 'Apex Institute of Technology\nStudent Name: Priyashi Singh\nReg No: 23CSE999\nCourse: B.Tech\nDepartment: Computer Science and Engineering',
        confidence: 96
      };
    }

    if (bufferStr.includes('Rahul Kumar') || bufferStr.includes('valid_id_rahul')) {
      return {
        text: 'Apex Institute of Technology\nStudent Name: Rahul Kumar\nReg No: 23CSE102\nCourse: B.Tech\nDepartment: Computer Science and Engineering',
        confidence: 98
      };
    }

    // Default test extraction from sample cards
    return {
      text: 'Apex Institute of Technology\nStudent Name: Priyashi Singh\nReg No: 23CSE101\nCourse: B.Tech\nDepartment: Computer Science and Engineering',
      confidence: 95
    };
  }
}

module.exports = new MockOcrEngine();
