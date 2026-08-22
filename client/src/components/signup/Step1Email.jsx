import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { emailStepSchema } from '../../schemas/authSchemas';
import { authApi } from '../../api/authApi';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const Step1Email = ({ onVerified, initialEmail = '' }) => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const inputRefs = useRef([]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(emailStepSchema),
    defaultValues: {
      email: initialEmail
    }
  });

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await authApi.sendEmailOtp(data.email);
      if (response.success) {
        setIsOtpSent(true);
        setCooldown(60);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send verification code. Please check your email.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    const email = getValues('email');
    if (!email) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await authApi.sendEmailOtp(email);
      if (response.success) {
        setCooldown(60);
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to resend code.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const otpValue = otpDigits.join('');

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (otpValue.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    const email = getValues('email');
    setIsVerifying(true);
    setErrorMessage('');

    try {
      const response = await authApi.verifyEmailOtp(email, otpValue);
      if (response.success && response.signupToken) {
        onVerified({
          email,
          signupToken: response.signupToken
        });
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid or expired code.';
      setErrorMessage(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Verify your email
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Enter your Gmail address to receive your 6-digit verification code.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1A: Email Input */}
      <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-4">
        <Input
          label="Gmail Address"
          placeholder="your.email@gmail.com"
          type="email"
          icon={Mail}
          disabled={isOtpSent}
          error={errors.email?.message}
          {...register('email')}
        />

        {!isOtpSent && (
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full font-semibold shadow-sm shadow-indigo-600/20"
          >
            Send Verification Code <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </form>

      {/* Step 1B: 6-Box OTP Verification Input */}
      {isOtpSent && (
        <form onSubmit={handleVerifyOtp} className="space-y-5 pt-4 border-t border-slate-100 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 block">
                Verification Code
              </span>
              <span className="text-xs text-slate-500">
                Sent to <strong className="text-slate-900">{getValues('email')}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={cooldown > 0 || isLoading}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-slate-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend'}
            </button>
          </div>

          {/* 6 Individual Digit Boxes */}
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 sm:w-14 sm:h-14 text-center font-mono text-xl font-bold text-slate-900 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 focus:outline-none shadow-2xs transition-all"
              />
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setIsOtpSent(false);
                setOtpDigits(['', '', '', '', '', '']);
                setErrorMessage('');
              }}
              className="w-1/3"
            >
              Change
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isVerifying}
              disabled={otpValue.length !== 6}
              className="w-2/3 shadow-sm shadow-indigo-600/20"
            >
              Verify Code <CheckCircle2 className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
