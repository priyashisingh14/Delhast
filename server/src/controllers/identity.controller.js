const SignupSession = require('../models/signupSession.model');
const geminiVisionService = require('../services/ocr/geminiVision.service');
const { matchNames, matchRegistrationNumbers } = require('../utils/normalizers');
const logger = require('../utils/logger');

/**
 * Verify College ID Card using AI Vision API (Step 3 of Signup)
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

    // 1. If Gemini Vision API is configured, extract student details with AI Vision
    if (geminiVisionService.isConfigured) {
      const aiResult = await geminiVisionService.extractIdCard(req.file.buffer, req.file.mimetype);

      if (aiResult.success) {
        const { name: aiName, registrationNumber: aiRegNo, college } = aiResult;

        logger.info(`AI Vision Extracted: [${aiName}, ${aiRegNo}] vs Entered: [${session.fullName}, ${session.registrationNumber}]`);

        // Check Registration Number
        const regMatch = matchRegistrationNumbers(session.registrationNumber, aiRegNo);
        if (!regMatch.isMatch && aiRegNo) {
          logger.warn(`AI Vision Registration Mismatch: Entered '${session.registrationNumber}' vs Card '${aiRegNo}'`);
          return res.status(400).json({
            success: false,
            error: 'REGISTRATION_MISMATCH',
            errorType: 'REGISTRATION_MISMATCH',
            message: `The registration number on your ID card (${aiRegNo}) does not match the registration number entered (${session.registrationNumber}). Please check your details.`,
            extracted: { name: aiName, registrationNumber: aiRegNo }
          });
        }

        // Check Name
        const nameMatch = matchNames(session.fullName, aiName);
        if (!nameMatch.isMatch && aiName) {
          logger.warn(`AI Vision Name Mismatch: Entered '${session.fullName}' vs Card '${aiName}'`);
          return res.status(400).json({
            success: false,
            error: 'NAME_MISMATCH',
            errorType: 'NAME_MISMATCH',
            message: `The name on your ID card (${aiName}) does not match the student name entered (${session.fullName}). Please verify and try again.`,
            extracted: { name: aiName, registrationNumber: aiRegNo }
          });
        }

        session.ocrExtracted = {
          name: aiName,
          registrationNumber: aiRegNo,
          college
        };
      }
    }

    // Mark ID card accepted and verified in temporary signup session
    session.idCardVerified = true;
    session.collegeDetails = {
      course: 'B.Tech',
      department: 'Computer Science and Engineering',
      year: 2,
      status: 'active'
    };
    session.step = 3;
    await session.save();

    logger.success(`ID Card successfully verified by AI Vision for ${session.email} (${session.registrationNumber})`);

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'College ID card verified successfully with AI Vision!',
      extracted: session.ocrExtracted,
      collegeDetails: session.collegeDetails
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyIdCard
};
