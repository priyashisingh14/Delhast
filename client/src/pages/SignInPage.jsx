import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { signInSchema } from '../schemas/authSchemas';
import { useAuthStore } from '../store/useAuthStore';

export const SignInPage = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');

    const result = await login(data.email, data.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(result.message || 'Invalid Gmail address or password.');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card elevated={true} className="w-full relative overflow-hidden p-6 sm:p-8">
        {/* Header */}
        <div className="text-left mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Sign in to continue to Delhast.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Gmail */}
          <Input
            label="Gmail Address"
            placeholder="Enter your Gmail address"
            type="email"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="Enter your password"
              icon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-semibold shadow-sm shadow-indigo-600/20"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </form>

        {/* Bottom Switch to Sign Up */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
};
