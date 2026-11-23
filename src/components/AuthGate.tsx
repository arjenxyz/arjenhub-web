import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../lib/auth';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading" role="status">
        Yükleniyor…
      </div>
    );
  }

  if (!user) {
    return <Navigate replace state={{ from: location.pathname }} to="/giris" />;
  }

  return <>{children}</>;
}
