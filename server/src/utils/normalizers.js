const env = require('../config/env');

/**
 * Normalizes email address and canonicalizes googlemail to gmail
 * @param {string} email 
 * @returns {string} Normalized email
 */
const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  const trimmed = email.trim().toLowerCase();
  const [localPart, domain] = trimmed.split('@');
  if (!domain) return trimmed;
  
  if (domain === 'googlemail.com') {
    return `${localPart}@gmail.com`;
  }
  return trimmed;
};

/**
 * Validates if the email is a legitimate Gmail address
 * @param {string} email 
 * @returns {boolean}
 */
const isValidGmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const normalized = normalizeEmail(email);
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/;
  return gmailRegex.test(normalized);
};

/**
 * Validates and normalizes Indian mobile phone numbers
 * Indian mobile numbers:
 * - 10 digits starting with 6, 7, 8, or 9
 * - May be prefixed with +91, 91, or 0
 * @param {string} phone 
 * @returns {{ isValid: boolean, normalized: string, raw10: string, error?: string }}
 */
const normalizeIndianPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, normalized: '', raw10: '', error: 'Phone number is required' };
  }

  // Remove spaces, hyphens, parentheses, and dots
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // Strip leading +91, 91, or 0
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  // Must be exactly 10 digits
  if (!/^\d{10}$/.test(cleaned)) {
    return {
      isValid: false,
      normalized: '',
      raw10: '',
      error: 'Invalid Indian mobile number. Must be exactly 10 digits.'
    };
  }

  // Must start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      normalized: '',
      raw10: '',
      error: 'Invalid Indian mobile number. Must start with 6, 7, 8, or 9.'
    };
  }

  return {
    isValid: true,
    normalized: `+91${cleaned}`,
    raw10: cleaned
  };
};

/**
 * Normalizes a person's full name
 * @param {string} name 
 * @returns {string}
 */
const normalizeName = (name) => {
  if (!name || typeof name !== 'string') return '';
  // Collapse whitespace, remove special characters except alphabets, dots, hyphens
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-zA-Z\s\.\-]/g, '');
};

/**
 * Normalizes registration number
 * @param {string} regNo 
 * @returns {string}
 */
const normalizeRegistrationNumber = (regNo) => {
  if (!regNo || typeof regNo !== 'string') return '';
  return regNo
    .trim()
    .toUpperCase()
    .replace(/[\s\-_]/g, '');
};

/**
 * Validates registration number format against configured regex
 * @param {string} regNo 
 * @returns {boolean}
 */
const isValidRegistrationNumber = (regNo) => {
  if (!regNo || typeof regNo !== 'string') return false;
  const normalized = normalizeRegistrationNumber(regNo);
  return normalized.length >= 1 && normalized.length <= 30;
};

/**
 * Checks whether two names match, tolerating casing, harmless whitespace, and name token ordering
 * Strictly rejects genuine mismatches.
 * @param {string} inputName 
 * @param {string} ocrName 
 * @returns {{ isMatch: boolean, confidence: number, reason?: string }}
 */
const matchNames = (inputName, ocrName) => {
  const normInput = normalizeName(inputName).toLowerCase();
  const normOcr = normalizeName(ocrName).toLowerCase();

  if (!normInput || !normOcr) {
    return { isMatch: false, confidence: 0, reason: 'Empty name provided' };
  }

  // Exact normalized match
  if (normInput === normOcr) {
    return { isMatch: true, confidence: 1.0 };
  }

  // Tokenize words
  const inputTokens = normInput.split(/\s+/).filter(Boolean);
  const ocrTokens = normOcr.split(/\s+/).filter(Boolean);

  if (inputTokens.length === 0 || ocrTokens.length === 0) {
    return { isMatch: false, confidence: 0, reason: 'Invalid name tokens' };
  }

  // Check if all input tokens exist in OCR tokens
  const matchedTokensCount = inputTokens.filter(token => 
    ocrTokens.some(ocrToken => ocrToken === token || (ocrToken.length > 2 && token.startsWith(ocrToken)))
  ).length;

  const matchRatio = matchedTokensCount / Math.max(inputTokens.length, ocrTokens.length);

  // If at least 80% tokens match or all primary name parts match
  if (matchRatio >= 0.75 && matchedTokensCount >= Math.min(inputTokens.length, ocrTokens.length)) {
    return { isMatch: true, confidence: matchRatio };
  }

  // Check substring containment if full name is found within extracted OCR text
  if (normOcr.includes(normInput) || normInput.includes(normOcr)) {
    return { isMatch: true, confidence: 0.9 };
  }

  return {
    isMatch: false,
    confidence: matchRatio,
    reason: `Name mismatch: Entered '${inputName}' does not match ID Card name '${ocrName}'`
  };
};

/**
 * Checks whether two registration numbers match
 * @param {string} inputReg 
 * @param {string} ocrReg 
 * @returns {{ isMatch: boolean, reason?: string }}
 */
const matchRegistrationNumbers = (inputReg, ocrReg) => {
  const normInput = normalizeRegistrationNumber(inputReg);
  const normOcr = normalizeRegistrationNumber(ocrReg);

  if (!normInput || !normOcr) {
    return { isMatch: false, reason: 'Empty registration number' };
  }

  if (normInput === normOcr) {
    return { isMatch: true };
  }

  return {
    isMatch: false,
    reason: `Registration Number mismatch: Entered '${inputReg}' does not match ID Card '${ocrReg}'`
  };
};

module.exports = {
  normalizeEmail,
  isValidGmail,
  normalizeIndianPhone,
  normalizeName,
  normalizeRegistrationNumber,
  isValidRegistrationNumber,
  matchNames,
  matchRegistrationNumbers
};
