import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import { getDefaultRoute } from '../utils/routing';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const currentPath = window.location.pathname;

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <LoadingScreen 
        message="Verifying access..."
        showProgress={true}
        progressDuration={1200}
      />
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin access enforcement
  if (requireAdmin) {
    if (user.role !== 'admin') {
      // Student or staff trying to access admin route
      return <Navigate to={getDefaultRoute(user)} replace />;
    }
    // Admin should not access onboarding
    if (currentPath === '/onboarding') {
      return <Navigate to="/admin" replace />;
    }
    return <>{children}</>;
  }

  // Student access enforcement
  if (user.role === 'student') {
    if (!user.profileComplete) {
      // Only allow onboarding
      if (currentPath !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
      }
      return <>{children}</>;
    } else {
      // Profile complete: block onboarding
      if (currentPath === '/onboarding') {
        return <Navigate to="/student/dashboard" replace />;
      }
      // Block admin routes for students
      if (currentPath.startsWith('/admin')) {
        return <Navigate to="/student/dashboard" replace />;
      }
      return <>{children}</>;
    }
  }

  // Staff: allow access regardless of profileComplete
  if (user.role === 'staff') {
    // If staff somehow lands on onboarding, redirect to staff dashboard
    if (currentPath === '/onboarding') {
      return <Navigate to="/staff/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // Default: allow access
  return <>{children}</>;
};

export default ProtectedRoute;