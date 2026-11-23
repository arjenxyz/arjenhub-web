import { Navigate } from 'react-router-dom';

import { useAuth } from '../lib/auth';
import { isDeveloperEmail } from '../lib/developer';

/** Only the designated developer email may open the OAuth console. */
export function DeveloperGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading" role="status">
        Yükleniyor…
      </div>
    );
  }

  if (!user || !isDeveloperEmail(user.email)) {
    return <Navigate replace to="/panel" />;
  }

  return <>{children}</>;
}
