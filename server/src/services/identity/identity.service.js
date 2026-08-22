const MasterStudent = require('../../models/masterStudent.model');
const { matchNames, matchRegistrationNumbers, normalizeName, normalizeRegistrationNumber } = require('../../utils/normalizers');
const env = require('../../config/env');
const logger = require('../../utils/logger');

class IdentityService {
  /**
   * Verifies extracted OCR details against user-submitted details and Master College Database
   * @param {Object} params
   * @param {string} params.enteredName - Name entered by student in step 2
   * @param {string} params.enteredRegNo - Registration number entered by student in step 2
   * @param {string} params.ocrName - Name extracted by OCR
   * @param {string} params.ocrRegNo - Registration number extracted by OCR
   * @returns {Promise<{
   *   verified: boolean,
   *   errorType?: 'OCR_EXTRACTION_FAILED' | 'NAME_MISMATCH' | 'REGISTRATION_MISMATCH' | 'STUDENT_NOT_FOUND',
   *   message?: string,
   *   collegeDetails?: Object
   * }>}
   */
  async verifyIdentity({ enteredName, enteredRegNo, ocrName, ocrRegNo, rawText = '' }) {
    logger.info(`Verifying Identity: User [${enteredName}, ${enteredRegNo}] vs OCR [${ocrName}, ${ocrRegNo}]`);

    const cleanEnteredRegNo = (enteredRegNo || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const cleanRawText = (rawText || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const cleanOcrRegNo = (ocrRegNo || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // 1. Direct Registration Number Check in raw OCR text or extracted field
    const isRegInRawText = cleanEnteredRegNo && cleanRawText.includes(cleanEnteredRegNo);
    const isRegMatch = isRegInRawText || (cleanOcrRegNo && matchRegistrationNumbers(enteredRegNo, ocrRegNo).isMatch);

    if (!isRegMatch) {
      logger.warn(`Registration mismatch: Entered '${enteredRegNo}' not found in OCR text or '${ocrRegNo}'`);
      return {
        verified: false,
        errorType: 'REGISTRATION_MISMATCH',
        message: 'The registration number entered during signup does not match the registration number on your college ID card. Please check your details and try again.'
      };
    }

    // 2. Name Check in OCR extracted field or raw text
    const nameMatch = matchNames(enteredName, ocrName || '');
    const cleanEnteredName = normalizeName(enteredName).toLowerCase();
    const cleanRawTextLower = (rawText || '').toLowerCase();

    const nameTokens = cleanEnteredName.split(/\s+/).filter(t => t.length >= 2);
    const allTokensInRawText = nameTokens.length > 0 && nameTokens.every(token => cleanRawTextLower.includes(token));
    const isNameMatch = nameMatch.isMatch || allTokensInRawText || (cleanEnteredName.length > 3 && cleanRawTextLower.includes(cleanEnteredName));

    if (!isNameMatch) {
      logger.warn(`Name mismatch: Entered '${enteredName}' vs OCR '${ocrName}'`);
      return {
        verified: false,
        errorType: 'NAME_MISMATCH',
        message: 'The name entered during registration does not match the name found on your college ID card. Please check your details and try again.'
      };
    }

    // 4. Validate against College Master Student Database (if enabled)
    let collegeDetails = {
      course: 'B.Tech',
      department: 'Computer Science and Engineering',
      year: 2,
      status: 'active'
    };

    if (env.ENFORCE_MASTER_STUDENT_DB) {
      const masterRecord = await MasterStudent.findOne({
        registrationNumber: enteredRegNo.toUpperCase().trim()
      });

      if (!masterRecord || masterRecord.status !== 'active') {
        logger.warn(`Master student DB record not found or inactive for: ${enteredRegNo}`);
        return {
          verified: false,
          errorType: 'STUDENT_NOT_FOUND',
          message: 'Student record could not be verified in the college master database. Please verify your registration number with the academic department.'
        };
      }

      // Verify name against master record
      const masterNameMatch = matchNames(enteredName, masterRecord.name);
      if (!masterNameMatch.isMatch) {
        logger.warn(`Master DB Name mismatch for ${enteredRegNo}: Master '${masterRecord.name}' vs Entered '${enteredName}'`);
        return {
          verified: false,
          errorType: 'NAME_MISMATCH',
          message: 'The name entered does not match the official name on record in the college master database.'
        };
      }

      collegeDetails = {
        course: masterRecord.course,
        department: masterRecord.department,
        year: masterRecord.year,
        status: masterRecord.status
      };
    }

    logger.success(`Identity successfully verified for student ${enteredRegNo} (${enteredName})`);

    return {
      verified: true,
      collegeDetails
    };
  }
}

module.exports = new IdentityService();
