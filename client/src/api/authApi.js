import apiClient from './apiClient';

export const authApi = {
  // Direct All-in-One Registration (Delhast)
  register: async ({ fullName, registrationNumber, phone, email, password, file }) => {
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('registrationNumber', registrationNumber);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('password', password);
    if (file) {
      formData.append('idCardImage', file);
    }

    const response = await apiClient.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Step 1: Email OTP
  sendEmailOtp: async (email) => {
    const response = await apiClient.post('/auth/email/send-otp', { email });
    return response.data;
  },

  verifyEmailOtp: async (email, otp) => {
    const response = await apiClient.post('/auth/email/verify-otp', { email, otp });
    return response.data;
  },

  // Step 2: Student Details
  saveStudentDetails: async (signupToken, { fullName, phone, registrationNumber }) => {
    const response = await apiClient.post('/auth/signup/details', {
      signupToken,
      fullName,
      phone,
      registrationNumber
    });
    return response.data;
  },

  // Step 3: College ID Card OCR
  verifyIdCard: async (signupToken, file) => {
    const formData = new FormData();
    formData.append('signupToken', signupToken);
    formData.append('idCardImage', file);

    const response = await apiClient.post('/auth/identity/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Step 4: Complete Registration
  completeSignup: async (signupToken, password) => {
    const response = await apiClient.post('/auth/signup/complete', {
      signupToken,
      password
    });
    return response.data;
  },

  // Sign In
  signIn: async (email, password) => {
    const response = await apiClient.post('/auth/signin', { email, password });
    return response.data;
  },

  // Refresh Session
  refreshSession: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  // Sign Out
  signOut: async () => {
    const response = await apiClient.post('/auth/signout');
    return response.data;
  },

  // Current User Profile
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Forgot Password Flow
  requestPasswordReset: async (email) => {
    const response = await apiClient.post('/auth/password/forgot', { email });
    return response.data;
  },

  verifyPasswordResetOtp: async (email, otp) => {
    const response = await apiClient.post('/auth/password/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (resetToken, newPassword, confirmPassword) => {
    const response = await apiClient.post('/auth/password/reset', {
      resetToken,
      newPassword,
      confirmPassword
    });
    return response.data;
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Active Sessions
  getSessions: async () => {
    const response = await apiClient.get('/auth/sessions');
    return response.data;
  },

  // Revoke Specific Session
  revokeSession: async (sessionId) => {
    const response = await apiClient.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  }
};
