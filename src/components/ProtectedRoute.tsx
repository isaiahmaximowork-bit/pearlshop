import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isPublicDomain } from '@/lib/domain';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // If on the public domain, redirect to app domain login
    if (isPublicDomain) {
      window.location.href = 'https://app.pearlshop.io/login';
      return null;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
