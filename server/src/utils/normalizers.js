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
 * Calculates Levenshtein edit distance between two strings
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
const levenshteinDistance = (a = '', b = '') => {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) matrix[i][0] = i;
  for (let j = 0; j <= bl; j++) matrix[0][j] = j;

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[al][bl];
};

/**
 * Calculates similarity ratio between 0.0 and 1.0
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
const stringSimilarity = (a = '', b = '') => {
  if (!a || !b) return 0;
  if (a === b) return 1.0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(a, b);
  return (maxLen - dist) / maxLen;
};

/**
 * Normalizes common OCR misread characters (homoglyphs)
 * E.g. 'O'/'Q'/'D' <-> '0', 'I'/'L'/'T' <-> '1', 'S' <-> '5', 'B' <-> '8', 'Z' <-> '2'
 * @param {string} str 
 * @returns {string}
 */
const normalizeOcrConfusion = (str = '') => {
  return (str || '')
    .toUpperCase()
    .replace(/[OQD]/g, '0')
    .replace(/[ILT|!/]/g, '1')
    .replace(/S/g, '5')
    .replace(/B/g, '8')
    .replace(/Z/g, '2');
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

  // Check Levenshtein similarity directly
  const directSim = stringSimilarity(normInput, normOcr);
  if (directSim >= 0.70) {
    return { isMatch: true, confidence: directSim };
  }

  // Tokenize words
  const inputTokens = normInput.split(/\s+/).filter(Boolean);
  const ocrTokens = normOcr.split(/\s+/).filter(Boolean);

  if (inputTokens.length === 0 || ocrTokens.length === 0) {
    return { isMatch: false, confidence: 0, reason: 'Invalid name tokens' };
  }

  // Check if input tokens exist in OCR tokens with fuzzy tolerance
  const matchedTokensCount = inputTokens.filter(token => 
    ocrTokens.some(ocrToken => {
      if (ocrToken === token) return true;
      if (token.length > 2 && ocrToken.startsWith(token)) return true;
      if (ocrToken.length > 2 && token.startsWith(ocrToken)) return true;
      return stringSimilarity(token, ocrToken) >= 0.70;
    })
  ).length;

  const matchRatio = matchedTokensCount / Math.max(inputTokens.length, ocrTokens.length);

  if (matchRatio >= 0.50 || matchedTokensCount >= Math.min(inputTokens.length, ocrTokens.length)) {
    return { isMatch: true, confidence: Math.max(matchRatio, 0.8) };
  }

  // Check substring containment
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
 * Checks whether two registration numbers match, tolerating common OCR homoglyph substitutions
 * @param {string} inputReg 
 * @param {string} ocrReg 
 * @param {string} [rawText]
 * @returns {{ isMatch: boolean, confidence: number, reason?: string }}
 */
const matchRegistrationNumbers = (inputReg, ocrReg, rawText = '') => {
  const normInput = normalizeRegistrationNumber(inputReg);
  const normOcr = normalizeRegistrationNumber(ocrReg);

  if (!normInput) {
    return { isMatch: false, confidence: 0, reason: 'Empty registration number' };
  }

  // 1. Exact match
  if (normInput === normOcr) {
    return { isMatch: true, confidence: 1.0 };
  }

  // 2. Homoglyph normalized match (O<->0, I<->1, S<->5, B<->8, Z<->2)
  const confInput = normalizeOcrConfusion(normInput);
  const confOcr = normalizeOcrConfusion(normOcr);

  if (confInput === confOcr) {
    return { isMatch: true, confidence: 0.95 };
  }

  // 3. Check Levenshtein similarity between input and ocrReg
  const sim = stringSimilarity(confInput, confOcr);
  if (sim >= 0.70) {
    return { isMatch: true, confidence: sim };
  }

  // 4. Search raw OCR text for registration number or its homoglyph equivalent
  if (rawText) {
    const cleanRaw = rawText.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const confRaw = normalizeOcrConfusion(cleanRaw);

    if (cleanRaw.includes(normInput) || confRaw.includes(confInput)) {
      return { isMatch: true, confidence: 0.95 };
    }

    // Extract core numbers (e.g. '2341019522' -> extract digits)
    const inputDigits = normInput.replace(/[^0-9]/g, '');
    if (inputDigits.length >= 5 && cleanRaw.includes(inputDigits)) {
      return { isMatch: true, confidence: 0.90 };
    }

    // Check sliding window over raw text words
    const words = rawText.split(/\s+/).map(w => w.replace(/[^A-Za-z0-9]/g, '').toUpperCase()).filter(w => w.length >= 4);
    for (const word of words) {
      const confWord = normalizeOcrConfusion(word);
      if (stringSimilarity(confInput, confWord) >= 0.70) {
        return { isMatch: true, confidence: 0.85 };
      }
    }
  }

  return {
    isMatch: false,
    confidence: sim,
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
  matchRegistrationNumbers,
  levenshteinDistance,
  stringSimilarity,
  normalizeOcrConfusion
};
