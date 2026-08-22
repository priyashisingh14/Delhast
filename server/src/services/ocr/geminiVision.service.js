const { GoogleGenAI } = require('@google/genai');
const logger = require('../../utils/logger');

class GeminiVisionService {
  constructor() {
    this.apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  get isConfigured() {
    return Boolean(this.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  }

  getAiClient() {
    const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
    if (!key) return null;
    return new GoogleGenAI({ apiKey: key });
  }

  /**
   * Extract Student Details from ID Card Image via Gemini Multimodal Vision
   * @param {Buffer} imageBuffer 
   * @param {string} [mimeType='image/jpeg'] 
   * @returns {Promise<{
   *   success: boolean,
   *   name: string,
   *   registrationNumber: string,
   *   college: string,
   *   isStudentIdCard: boolean,
   *   rawResponse?: string,
   *   error?: string
   * }>}
   */
  async extractIdCard(imageBuffer, mimeType = 'image/jpeg') {
    const ai = this.getAiClient();
    if (!ai) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }

    try {
      logger.info('Analyzing ID card image with Gemini Multimodal Vision AI...');

      const base64Data = imageBuffer.toString('base64');

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            text: `You are an expert student ID card reader.
Analyze this image and extract:
1. Student Full Name
2. Registration Number (also called Roll No, Reg No, Student ID, Enrollment No, or Admission No)
3. College / University Name
4. Whether this appears to be a legitimate student/college ID card.

Respond strictly in valid JSON with this structure:
{
  "name": "Full student name extracted from image or empty string",
  "registrationNumber": "Exact registration or roll number without extra spaces or empty string",
  "college": "College / University name or empty string",
  "isStudentIdCard": true,
  "confidence": 0.95
}`
          },
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: base64Data
            }
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      logger.debug('Gemini Vision raw response:', text);

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (parseErr) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse Gemini JSON response');
        }
      }

      logger.success(`Gemini Vision Extracted -> Name: "${parsed.name}", RegNo: "${parsed.registrationNumber}", College: "${parsed.college}"`);

      return {
        success: true,
        name: (parsed.name || '').trim(),
        registrationNumber: (parsed.registrationNumber || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
        college: (parsed.college || '').trim(),
        isStudentIdCard: parsed.isStudentIdCard !== false,
        confidence: parsed.confidence || 0.9
      };
    } catch (err) {
      logger.error('Gemini Vision AI Extraction Error:', err.message);
      return {
        success: false,
        name: '',
        registrationNumber: '',
        college: '',
        isStudentIdCard: false,
        error: err.message
      };
    }
  }
}

module.exports = new GeminiVisionService();
