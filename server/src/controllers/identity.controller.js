const SignupSession = require('../models/signupSession.model');
const ocrService = require('../services/ocr/ocr.service');
const identityService = require('../services/identity/identity.service');
const logger = require('../utils/logger');

/**
 * Verify College ID Card (Step 3 of Signup)
 */
const verifyIdCard = async (req, res, next) => {
  try {
    const { signupToken } = req.body;

    if (!signupToken) {
      return res.status(400).json({
        success: false,
        error: 'SESSION_TOKEN_REQUIRED',
        message: 'Signup session token is required.'
      });
    }

    const session = await SignupSession.findOne({ signupToken });
    if (!session || !session.emailVerified || !session.studentDetailsVerified) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_SESSION_STATE',
        message: 'Please complete email and student details steps before uploading ID card.'
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        error: 'IMAGE_REQUIRED',
        message: 'Please upload your College ID card image.'
      });
    }

    // 1. Run OCR pipeline on image buffer
    const ocrResult = await ocrService.processIdCard(req.file.buffer);

    if (!ocrResult.success) {
      return res.status(400).json({
        success: false,
        error: 'OCR_READ_ERROR',
        errorType: 'OCR_EXTRACTION_FAILED',
        message: ocrResult.error || "We couldn't clearly read your ID card. Please upload a clearer image."
      });
    }

    const { name: ocrName, registrationNumber: ocrRegNo } = ocrResult.extracted;

    // 2. Perform Identity Verification (Matching + Master DB check)
    const verification = await identityService.verifyIdentity({
      enteredName: session.fullName,
      enteredRegNo: session.registrationNumber,
      ocrName,
      ocrRegNo,
      rawText: ocrResult.rawText
    });

    if (!verification.verified) {
      return res.status(400).json({
        success: false,
        error: verification.errorType,
        errorType: verification.errorType,
        message: verification.message,
        ocrExtracted: {
          name: ocrName,
          registrationNumber: ocrRegNo
        }
      });
    }

    // 3. Mark ID card verified in temporary signup session
    session.idCardVerified = true;
    session.ocrExtracted = {
      name: ocrName,
      registrationNumber: ocrRegNo,
      confidence: ocrResult.confidence
    };
    session.collegeDetails = verification.collegeDetails;
    session.step = 3;
    await session.save();

    logger.success(`ID Card verification passed for ${session.email}`);

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'College ID card verified successfully!',
      extracted: {
        name: ocrName,
        registrationNumber: ocrRegNo,
        confidence: ocrResult.confidence
      },
      collegeDetails: verification.collegeDetails
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyIdCard
};
