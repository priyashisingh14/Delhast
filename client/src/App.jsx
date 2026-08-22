import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignUpPage } from './pages/SignUpPage';
import { SignInPage } from './pages/SignInPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { WelcomePage } from './pages/WelcomePage';
import { DashboardPage } from './pages/DashboardPage';
import { BookingPage } from './pages/BookingPage';
import { ChatPage } from './pages/ChatPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

// If user is already logged in, redirect away from public auth pages to /dashboard
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (isInitialized && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Root route: / -> if logged in, go to /dashboard; if not logged in, go to /signup
const RootRoute = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (isInitialized && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <SignUpPage />;
};

export const App = () => {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    // Attempt automatic session restoration using 30-day refresh cookie
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Routes (Auto-redirect to /dashboard if already logged in) */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
        <Route path="/signin" element={<PublicRoute><SignInPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/welcome" element={<WelcomePage />} />

        {/* Protected Food Delivery & Booking Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/chat/:orderId" element={<ChatPage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
