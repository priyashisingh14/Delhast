import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/common/Card';
import { StepIndicator } from '../components/signup/StepIndicator';
import { Step1Email } from '../components/signup/Step1Email';
import { Step2StudentDetails } from '../components/signup/Step2StudentDetails';
import { Step3IdVerification } from '../components/signup/Step3IdVerification';
import { Step4Password } from '../components/signup/Step4Password';
import { useAuthStore } from '../store/useAuthStore';

export const SignUpPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [signupToken, setSignupToken] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [studentDetails, setStudentDetails] = useState({
    fullName: '',
    phone: '',
    registrationNumber: ''
  });

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  // Step 1 Complete: Gmail OTP Verified
  const handleEmailVerified = ({ email, signupToken: token }) => {
    setVerifiedEmail(email);
    setSignupToken(token);
    setCurrentStep(2);
  };

  // Step 2 Complete: Student Details Saved
  const handleDetailsSaved = (details) => {
    setStudentDetails(details);
    setCurrentStep(3);
  };

  // Step 3 Complete: ID Card Verified
  const handleIdVerified = () => {
    setCurrentStep(4);
  };

  // Step 4 Complete: Account Created -> Take user directly to Dashboard
  const handleSignupComplete = (response) => {
    setAuth(response.user, response.accessToken);
    navigate('/dashboard');
  };

  return (
    <AuthLayout>
      <Card elevated={true} className="w-full relative overflow-hidden p-6 sm:p-8">
        {/* Step Indicator Progress Bar */}
        <StepIndicator currentStep={currentStep} />

        {/* Multi-Step Pipeline Content */}
        {currentStep === 1 && (
          <Step1Email
            initialEmail={verifiedEmail}
            onVerified={handleEmailVerified}
          />
        )}

        {currentStep === 2 && (
          <Step2StudentDetails
            signupToken={signupToken}
            verifiedEmail={verifiedEmail}
            initialData={studentDetails}
            onNext={handleDetailsSaved}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3IdVerification
            signupToken={signupToken}
            studentDetails={studentDetails}
            onNext={handleIdVerified}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4Password
            signupToken={signupToken}
            studentDetails={studentDetails}
            onComplete={handleSignupComplete}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {/* Bottom Sign In Link */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/signin"
              className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
};
