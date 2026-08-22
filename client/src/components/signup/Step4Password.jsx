import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowRight, ArrowLeft, Check, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { passwordSetupSchema } from '../../schemas/authSchemas';
import { authApi } from '../../api/authApi';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const Step4Password = ({
  signupToken,
  studentDetails,
  onComplete,
  onBack
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(passwordSetupSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const passwordVal = watch('password', '');
  const confirmPasswordVal = watch('confirmPassword', '');

  // Password rules checklist
  const passwordRules = [
    { label: '8+ characters minimum', valid: passwordVal.length >= 8 },
    { label: 'At least 1 uppercase letter (A-Z)', valid: /[A-Z]/.test(passwordVal) },
    { label: 'At least 1 lowercase letter (a-z)', valid: /[a-z]/.test(passwordVal) },
    { label: 'At least 1 numeric digit (0-9)', valid: /[0-9]/.test(passwordVal) },
    { label: 'At least 1 special symbol (!@#$%^&*)', valid: /[^A-Za-z0-9]/.test(passwordVal) },
    {
      label: 'Passwords match',
      valid: confirmPasswordVal.length > 0 && passwordVal === confirmPasswordVal
    }
  ];

  const validCount = passwordRules.filter((r) => r.valid).length;

  const getStrengthMeta = () => {
    if (validCount <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600', percent: 25 };
    if (validCount <= 4) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600', percent: 50 };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600', percent: 100 };
  };

  const strength = getStrengthMeta();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.completeSignup(signupToken, data.password);
      if (response.success) {
        onComplete(response);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create account. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Set your password
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Create a secure password for your Delhast account.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Password */}
        <Input
          label="New Password"
          type="password"
          placeholder="Create a strong password"
          icon={Lock}
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Real-time Strength Meter */}
        {passwordVal.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Strength</span>
              <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
                style={{ width: `${strength.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          icon={Lock}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {/* Requirements Checklist */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
            Password Requirements
          </p>
          {passwordRules.map((rule, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 transition-colors ${
                rule.valid ? 'text-emerald-700 font-medium' : 'text-slate-400'
              }`}
            >
              {rule.valid ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
              <span>{rule.label}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="pt-3 flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            className="w-1/3"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={!passwordRules.every((r) => r.valid)}
            className="w-2/3 shadow-sm shadow-indigo-600/20"
          >
            Create Account <ShieldCheck className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
