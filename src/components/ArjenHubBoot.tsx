import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  clearOAuthParamsFromUrl,
  handleArjenHubCallback,
} from '../lib/arjenhubAuth';
import { useAuth } from '../lib/auth';

/**
 * Run ArjenHub OAuth callback once at app boot (redirect_uri = origin/).
 * A valid ArjenHub session alone unlocks /panel.
 */
export function ArjenHubBoot() {
  const { isAuthenticated, loading, setArjenHubSession } = useAuth();
  const navigate = useNavigate();
  const [oauthDone, setOauthDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const session = await handleArjenHubCallback();
        if (cancelled) return;
        if (session) {
          setArjenHubSession(session);
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
  }, [setArjenHubSession]);

  useEffect(() => {
    if (!oauthDone || loading) return;
    if (isAuthenticated) {
      navigate('/panel', { replace: true });
    }
  }, [oauthDone, loading, isAuthenticated, navigate]);

  return null;
}
