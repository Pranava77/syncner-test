import { User } from '../redux/slices/authSlice';

export const getDefaultRoute = (user: User | null): string => {
  if (!user) {
    return '/login';
  }

  if (!user.profileComplete) {
    return '/onboarding';
  }

  switch (user.role) {
    case 'admin':
      return '/admin';
    case 'staff':
      return '/staff/dashboard';
    case 'student':
    case 'instructor':
    default:
      return '/student/dashboard';
  }
};

export const shouldRedirectToOnboarding = (user: User | null): boolean => {
  return user ? !user.profileComplete : false;
};

export const shouldRedirectToAdmin = (user: User | null): boolean => {
  return user ? user.role === 'admin' : false;
};

export const canAccessRoute = (
  user: User | null, 
  route: string, 
  requireAdmin: boolean = false
): boolean => {
  if (!user) return false;
  
  if (requireAdmin && user.role !== 'admin') return false;
  
  if (!user.profileComplete && route !== '/onboarding') return false;
  
  return true;
}; 