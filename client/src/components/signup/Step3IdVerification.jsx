import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { authApi } from '../../api/authApi';
import { Button } from '../common/Button';
import { IDCardUploader } from '../common/IDCardUploader';

export const Step3IdVerification = ({
  signupToken,
  studentDetails,
  onNext,
  onBack
}) => {
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = async () => {
    if (!file) {
      setErrorMessage('Please upload your Student ID Card image first.');
      return;
    }

    setIsScanning(true);
    setErrorMessage('');
    setScanResult(null);

    try {
      const response = await authApi.verifyIdCard(signupToken, file);
      if (response.success) {
        setScanResult(response);
        // Seamlessly auto-advance to password setup
        setTimeout(() => {
          onNext();
        }, 1200);
      } else {
        setErrorMessage(
          response.message ||
            'ID verification could not match your details. Please ensure you uploaded a clear, un-cropped student ID card.'
        );
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        'Verification failed. Please ensure the card photo is clear and legible.';
      setErrorMessage(msg);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Verify Student ID Card
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Upload your student ID card photo. 
        </p>
      </div>

      {/* Info Pill */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
        <div>
          <span className="text-slate-400 block text-[11px]">Expected Name:</span>
          <span className="font-semibold text-slate-900">{studentDetails?.fullName || 'Student'}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 block text-[11px]">Expected Reg. No:</span>
          <span className="font-mono font-bold text-indigo-600">
            {studentDetails?.registrationNumber || 'N/A'}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Zone */}
      {!scanResult && (
        <div className="space-y-4">
          <IDCardUploader
            file={file}
            onFileSelect={(f) => {
              setFile(f);
              setErrorMessage('');
            }}
            onFileRemove={() => setFile(null)}
            disabled={isScanning}
          />

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onBack}
              disabled={isScanning}
              className="w-1/3"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              isLoading={isScanning}
              disabled={!file}
              onClick={handleVerify}
              className="w-2/3 shadow-sm shadow-indigo-600/20"
            >
              {isScanning ? 'Verifying...' : 'Verify '} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* AI Vision Match Result State */}
      {scanResult && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Verification Passed!
              </h3>
              <p className="text-xs text-emerald-700">
                Name and Registration Number confirmed on your ID card.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="emerald"
            size="lg"
            onClick={onNext}
            className="w-full shadow-sm shadow-emerald-600/20"
          >
            Continue to Password Setup <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
