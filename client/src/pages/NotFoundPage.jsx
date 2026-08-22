import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <AuthLayout>
      <Card className="text-center py-10 space-y-5 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-lavender-100 text-lavender-700 mx-auto flex items-center justify-center shadow-soft">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-violetMuted-900">404</h1>
          <p className="text-sm font-semibold text-violetMuted-700 mt-1">Page Not Found</p>
          <p className="text-xs text-violetMuted-500 mt-1">
            The page you requested is not available on the portal.
          </p>
        </div>
        <Link to="/">
          <Button variant="primary" size="md">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Registration
          </Button>
        </Link>
      </Card>
    </AuthLayout>
  );
};
