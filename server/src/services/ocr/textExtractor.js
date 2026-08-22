const { normalizeRegistrationNumber, normalizeName } = require('../../utils/normalizers');
const env = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Heuristic parser to extract student Name and Registration Number from OCR text
 */
class TextExtractor {
  /**
   * Parse OCR text output to extract candidate name and registration number
   * @param {string} text 
   * @returns {{ name: string, registrationNumber: string, allMatches: Object }}
   */
  extract(text) {
    if (!text || typeof text !== 'string') {
      return { name: '', registrationNumber: '', allMatches: {} };
    }

    const lines = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const regNo = this.extractRegistrationNumber(text, lines);
    const name = this.extractName(text, lines, regNo);

    logger.debug(`Extracted from OCR -> Name: "${name}", RegNo: "${regNo}"`);

    return {
      name,
      registrationNumber: regNo,
      allMatches: {
        rawLinesCount: lines.length
      }
    };
  }

  /**
   * Extract registration number using regex and anchor keywords
   * @param {string} fullText 
   * @param {string[]} lines 
   * @returns {string}
   */
  /**
   * Extract registration number using regex and anchor keywords
   * @param {string} fullText 
   * @param {string[]} lines 
   * @returns {string}
   */
  extractRegistrationNumber(fullText, lines) {
    // 1. Look for explicit anchors with word boundaries
    const anchorRegexes = [
      /\b(?:Reg(?:istration)?\.?\s*(?:No|Num|Number|#)?|Roll\s*(?:No|Num|Number|#)?|Student\s*ID|ID\s*(?:No|Num|Number|#)|URN|Enrollment\s*(?:No|Number)?|Adm(?:ission)?\s*(?:No|Number)?)\s*[:.\-]?\s*([A-Za-z0-9\-_\s%|]{4,25})/i,
      /\b(?:Reg|Roll)\s*[:.\-]?\s*([A-Za-z0-9\-_\s%|]{4,25})/i
    ];

    for (const regex of anchorRegexes) {
      const match = fullText.match(regex);
      if (match && match[1]) {
        const candidate = match[1].replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (/\d/.test(candidate) && candidate.length >= 4) {
          return candidate;
        }
      }
    }

    // 2. Look for long numeric sequences (e.g. 2341019522) or alphanumeric patterns
    const numberMatches = fullText.match(/\b([0-9]{6,16})\b/g);
    if (numberMatches && numberMatches.length > 0) {
      // Pick the longest valid numeric sequence
      return numberMatches[0];
    }

    // 3. Scan each line for alphanumeric roll codes (e.g. 23CSE101, 22ECE045, etc.)
    for (const line of lines) {
      const words = line.split(/\s+/);
      for (const word of words) {
        const cleaned = word.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (/\d/.test(cleaned) && cleaned.length >= 5 && cleaned.length <= 20) {
          return cleaned;
        }
      }
    }

    return '';
  }

  /**
   * Extract student name using anchors or line heuristics
   * @param {string} fullText 
   * @param {string[]} lines 
   * @param {string} foundRegNo 
   * @returns {string}
   */
  extractName(fullText, lines, foundRegNo = '') {
    // 1. Look for explicit Name anchors: "Name:", "Student Name:", "Full Name:"
    const nameAnchorRegexes = [
      /\b(?:Student\s*Name|Full\s*Name|Name\s*of\s*Student|Name)\s*[:.\-]?\s*([A-Za-z\s.\-]{3,35})(?:\n|$|\s{2,})/i,
      /\b(?:Candidate\s*Name)\s*[:.\-]?\s*([A-Za-z\s.\-]{3,35})/i
    ];

    for (const regex of nameAnchorRegexes) {
      const match = fullText.match(regex);
      if (match && match[1]) {
        const candidate = this.cleanNameCandidate(match[1]);
        if (this.isValidNameCandidate(candidate)) {
          return candidate;
        }
      }
    }

    // 2. Scan lines right before or after Registration Number or College title
    const stopWords = [
      'college', 'university', 'institute', 'technology', 'engineering', 'identity',
      'card', 'student', 'department', 'semester', 'academic', 'year', 'branch',
      'course', 'b.tech', 'm.tech', 'bca', 'mca', 'valid', 'upto', 'signature',
      'principal', 'director', 'blood', 'group', 'dob', 'date', 'birth', 'address'
    ];

    for (const line of lines) {
      const lower = line.toLowerCase();
      const containsStopWord = stopWords.some(w => lower.includes(w));
      const containsDigits = /\d/.test(line);

      if (!containsStopWord && !containsDigits) {
        const candidate = this.cleanNameCandidate(line);
        if (this.isValidNameCandidate(candidate)) {
          return candidate;
        }
      }
    }

    return '';
  }

  cleanNameCandidate(raw) {
    if (!raw) return '';
    let cleaned = raw
      .replace(/(?:Student|Name|Course|Dept|Year|DOB|ID|Card|Valid|Upto)[:\s\-]*/gi, '')
      .trim();
    return normalizeName(cleaned);
  }

  isValidNameCandidate(name) {
    if (!name || name.length < 3 || name.length > 40) return false;
    const parts = name.split(/\s+/).filter(Boolean);
    return parts.length >= 1 && parts.every(p => /^[A-Za-z.\-]+$/.test(p));
  }
}

module.exports = new TextExtractor();
