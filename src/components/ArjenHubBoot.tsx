import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  clearOAuthParamsFromUrl,
  handleArjenHubCallback,
} from '../lib/arjenhubAuth';
import { useAuth } from '../lib/auth';

/**
 * Run ArjenHub OAuth callback once at app boot (redirect_uri = origin/).
 * Portal UX: Supabase session → /panel; otherwise stay on current route with clean URL.
 */
export function ArjenHubBoot() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [oauthDone, setOauthDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const session = await handleArjenHubCallback();
        if (cancelled) return;
        if (session) {
          clearOAuthParamsFromUrl();
          setOauthDone(true);
        }
      } catch (caught) {
        console.error('[ArjenHub] callback failed', caught);
        clearOAuthParamsFromUrl();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!oauthDone || loading) return;
    if (user) {
      navigate('/panel', { replace: true });
    }
  }, [oauthDone, loading, user, navigate]);

  return null;
}
