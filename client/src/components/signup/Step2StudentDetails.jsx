import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Hash, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { studentDetailsSchema } from '../../schemas/authSchemas';
import { authApi } from '../../api/authApi';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const Step2StudentDetails = ({
  signupToken,
  verifiedEmail,
  initialData = {},
  onNext,
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
    resolver: zodResolver(studentDetailsSchema),
    defaultValues: {
      fullName: initialData.fullName || '',
      phone: initialData.phone || '',
      registrationNumber: initialData.registrationNumber || ''
    }
  });

  const phoneVal = watch('phone', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.saveStudentDetails(signupToken, {
        fullName: data.fullName,
        phone: data.phone,
        registrationNumber: data.registrationNumber
      });

      if (response.success) {
        onNext(data);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save details. Please check your information.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Student details
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Enter your information matching your student ID card.
        </p>
      </div>

      {/* Verified Email Banner */}
      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-800">
        <div className="flex items-center gap-2 truncate">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">
            Verified: <strong className="text-slate-900">{verifiedEmail}</strong>
          </span>
        </div>
        <span className="font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-[10px] shrink-0">
          ✓ Verified
        </span>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <Input
          label="Full Name"
          placeholder="e.g. Priyashi Singh"
          icon={User}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        {/* Mobile Number */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Mobile Number
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {phoneVal.length}/10
            </span>
          </div>
          <div className="relative flex rounded-xl shadow-xs">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-700 text-xs font-bold select-none">
              🇮🇳 +91
            </span>
            <input
              type="tel"
              placeholder="9876543210"
              maxLength={10}
              className={`w-full rounded-r-xl border bg-slate-50/60 py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all ${
                errors.phone
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 bg-rose-50/50 text-rose-900'
                  : 'border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10'
              }`}
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.phone.message}</span>
            </p>
          )}
        </div>

        {/* Registration Roll Number */}
        <Input
          label="Registration / Roll Number"
          placeholder="e.g. 2341019522"
          icon={Hash}
          error={errors.registrationNumber?.message}
          className="font-mono uppercase font-bold"
          {...register('registrationNumber')}
        />

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
            className="w-2/3 shadow-sm shadow-indigo-600/20"
          >
            Continue to ID Scan <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
