const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validate.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { loginLimiter } = require('../middleware/rateLimiter.middleware');
const { uploadIdCard } = require('../middleware/upload.middleware');
const {
  submitStudentDetailsSchema,
  completeSignupSchema,
  signInSchema
} = require('../validators/auth.validator');

// Direct Single-Step Registration
router.post(
  '/register',
  uploadIdCard,
  authController.directRegister
);

// Signup steps
router.post(
  '/signup/details',
  validateRequest(submitStudentDetailsSchema),
  authController.saveStudentDetails
);

router.post(
  '/signup/complete',
  validateRequest(completeSignupSchema),
  authController.completeSignup
);

// Sign In
router.post(
  '/signin',
  loginLimiter,
  validateRequest(signInSchema),
  authController.signIn
);

// Refresh Token
router.post('/refresh', authController.refreshAccessToken);

// Sign Out / Logout
router.post('/signout', authController.signOut);
router.post('/logout', authController.signOut);

// Authenticated User Profile
router.get('/me', authenticateToken, authController.getMe);

// Authenticated Password Change & Sessions Management
router.post('/change-password', authenticateToken, authController.changePassword);
router.get('/sessions', authenticateToken, authController.getSessions);
router.delete('/sessions/:sessionId', authenticateToken, authController.revokeSession);

module.exports = router;
