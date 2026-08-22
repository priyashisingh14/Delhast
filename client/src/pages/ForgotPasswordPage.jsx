import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import {
  forgotPasswordEmailSchema,
  resetPasswordSchema
} from '../schemas/authSchemas';
import { authApi } from '../api/authApi';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 1 Form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail }
  } = useForm({
    resolver: zodResolver(forgotPasswordEmailSchema)
  });

  // Step 3 Form (New Password)
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    formState: { errors: errorsPassword }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange'
  });

  const newPass = watchPassword('newPassword', '');
  const confirmPass = watchPassword('confirmPassword', '');

  const rules = [
    { label: '8+ characters', valid: newPass.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(newPass) },
    { label: 'Lowercase letter', valid: /[a-z]/.test(newPass) },
    { label: 'Numeric digit', valid: /[0-9]/.test(newPass) },
    { label: 'Special symbol (!@#$)', valid: /[^A-Za-z0-9]/.test(newPass) },
    {
      label: 'Passwords match',
      valid: confirmPass.length > 0 && newPass === confirmPass
    }
  ];

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Send Reset OTP
  const onSendOtp = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await authApi.requestPasswordReset(data.email);
      setEmail(data.email);
      setCooldown(60);
      setStep(2);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send verification code.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend OTP
  const onResendOtp = async () => {
    if (cooldown > 0 || !email) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      await authApi.requestPasswordReset(email);
      setCooldown(60);
    } catch (error) {
      setErrorMessage('Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Reset OTP
  const onVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpValue || otpValue.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await authApi.verifyPasswordResetOtp(email, otpValue);
      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setStep(3);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid or expired code.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set New Password
  const onResetPassword = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await authApi.resetPassword(resetToken, data.newPassword, data.confirmPassword);
      if (res.success) {
        setStep(4);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reset password. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card elevated={true} className="w-full relative overflow-hidden p-6 sm:p-8">
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Enter Gmail */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-left">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Reset password
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Enter your Gmail to receive a password reset code.
              </p>
            </div>

            <form onSubmit={handleSubmitEmail(onSendOtp)} className="space-y-4">
              <Input
                label="Gmail Address"
                placeholder="your.email@gmail.com"
                type="email"
                icon={Mail}
                error={errorsEmail.email?.message}
                {...registerEmail('email')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full font-semibold shadow-sm shadow-indigo-600/20"
              >
                Send Reset Code <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-left">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Enter verification code
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                We sent a 6-digit code to <strong className="text-slate-900">{email}</strong>
              </p>
            </div>

            <form onSubmit={onVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Verification Code
                </span>
                <button
                  type="button"
                  onClick={onResendOtp}
                  disabled={cooldown > 0 || isLoading}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-slate-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend Code'}
                </button>
              </div>

              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                icon={KeyRound}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                className="text-center font-mono text-xl tracking-widest font-bold"
                helperText="Code expires in 5 minutes."
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setStep(1)}
                  className="w-1/3"
                >
                  Change
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  disabled={otpValue.length !== 6}
                  className="w-2/3"
                >
                  Verify <CheckCircle2 className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Create New Password */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-left">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Create new password
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Code verified. Set your new account password.
              </p>
            </div>

            <form onSubmit={handleSubmitPassword(onResetPassword)} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                icon={Lock}
                error={errorsPassword.newPassword?.message}
                {...registerPassword('newPassword')}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                icon={Lock}
                error={errorsPassword.confirmPassword?.message}
                {...registerPassword('confirmPassword')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={!rules.every((r) => r.valid)}
                className="w-full shadow-sm shadow-indigo-600/20"
              >
                Update Password <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">
                Password updated
              </h3>
              <p className="text-xs text-slate-500">
                Your password has been changed. You can now sign in.
              </p>
            </div>

            <Link to="/signin" className="block pt-2">
              <Button variant="primary" size="lg" className="w-full">
                Sign In to Delhast <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {/* Bottom Link to Sign In */}
        {step !== 4 && (
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/signin"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        )}
      </Card>
    </AuthLayout>
  );
};
