import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { ArjenHubSignInButton } from '../components/ArjenHubSignInButton';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { SiteChrome } from '../components/SiteChrome';
import {
  ARJENHUB_CLIENT_ID,
  ensureArjenHubSdk,
  getArjenHubUser,
  signInWithArjenHub,
  type ArjenHubUser,
} from '../lib/arjenhubAuth';
import { mapAuthError, useAuth } from '../lib/auth';

export function SignIn() {
  const { user, loading, signIn, signInWithGoogle, signInWithMagicLink, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/panel';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [arjenHubUser, setArjenHubUser] = useState<ArjenHubUser | null>(null);
  const [busy, setBusy] = useState<'password' | 'google' | 'arjenhub' | 'magic' | 'reset' | null>(
    null,
  );

  // OAuth callback is handled once in ArjenHubBoot — here we only reflect existing SSO session.
  useEffect(() => {
    if (!ARJENHUB_CLIENT_ID) return;
    let cancelled = false;
    void (async () => {
      try {
        await ensureArjenHubSdk();
        if (cancelled) return;
        const ssoUser = getArjenHubUser();
        if (ssoUser) {
          setArjenHubUser(ssoUser);
          const label = [ssoUser.name, ssoUser.email].filter(Boolean).join(' · ');
          setInfo(
            label
              ? `ArjenHub oturumu açık (${label}). Portal /panel için hâlâ Google veya e-posta ile giriş gerekir.`
              : 'ArjenHub oturumu açık. Portal /panel için hâlâ Google veya e-posta ile giriş gerekir.',
          );
        }
      } catch {
        // SDK optional on this page when not signing in yet
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Supabase portal session wins — ArjenHub SSO alone does not unlock /panel.
  if (!loading && user) {
    return <Navigate replace to="/panel" />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setBusy('password');
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (caught) {
      setError(mapAuthError(caught));
    } finally {
      setBusy(null);
    }
  }

  async function onGoogle() {
    setError(null);
    setInfo(null);
    setBusy('google');
    try {
      await signInWithGoogle();
    } catch (caught) {
      setError(mapAuthError(caught));
      setBusy(null);
    }
  }

  async function onArjenHub() {
    setError(null);
    setInfo(null);
    setBusy('arjenhub');
    try {
      await signInWithArjenHub();
    } catch (caught) {
      setError(mapAuthError(caught));
      setBusy(null);
    }
  }

  async function onMagicLink() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Magic link için e-posta gerekli.');
      return;
    }
    setBusy('magic');
    try {
      await signInWithMagicLink(email.trim());
      setInfo('Magic link gönderildi. Gelen kutunu (ve spam) kontrol et; link /panel’e açılır.');
    } catch (caught) {
      setError(mapAuthError(caught));
    } finally {
      setBusy(null);
    }
  }

  async function onReset() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Şifre sıfırlama için e-posta gerekli.');
      return;
    }
    setBusy('reset');
    try {
      await resetPassword(email.trim());
      setInfo('Şifre sıfırlama maili gönderildi (hesap varsa).');
    } catch (caught) {
      setError(mapAuthError(caught));
    } finally {
      setBusy(null);
    }
  }

  return (
    <SiteChrome compact>
      <main className="auth-panel">
        <h1 className="auth-panel__title">Giriş</h1>
        <p className="auth-panel__lead">ArjenHub, Google veya e-posta + şifre.</p>

        {arjenHubUser ? (
          <p className="form-info" role="status">
            ArjenHub oturumu: {[arjenHubUser.name, arjenHubUser.email].filter(Boolean).join(' · ') ||
              'açık'}
            . /panel için Google veya e-posta ile giriş yap.
          </p>
        ) : null}

        <div className="auth-oauth">
          {ARJENHUB_CLIENT_ID ? (
            <ArjenHubSignInButton
              busy={busy === 'arjenhub'}
              disabled={busy !== null && busy !== 'arjenhub'}
              onClick={() => void onArjenHub()}
            />
          ) : (
            <p className="auth-oauth__note">
              Sign in with ArjenHub henüz yapılandırılmadı (VITE_ARJENHUB_CLIENT_ID).
            </p>
          )}
          <GoogleSignInButton
            busy={busy === 'google'}
            disabled={busy !== null && busy !== 'google'}
            onClick={() => void onGoogle()}
          />
        </div>

        <div className="auth-divider" aria-hidden="true">
          <span>veya</span>
        </div>

        <form className="auth-form auth-form--tight" onSubmit={onSubmit}>
          <label className="field">
            <span>E-posta</span>
            <input
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="field">
            <span>Şifre</span>
            <input
              autoComplete="current-password"
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              value={password}
            />
          </label>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="form-info" role="status">
              {info}
            </p>
          ) : null}
          <button
            className="btn btn--primary btn--block"
            disabled={busy !== null || !password}
            type="submit"
          >
            {busy === 'password' ? 'Giriş yapılıyor…' : 'Giriş yap'}
          </button>
          <button
            className="btn btn--ghost btn--block"
            disabled={busy !== null}
            onClick={() => void onMagicLink()}
            type="button"
          >
            {busy === 'magic' ? 'Gönderiliyor…' : 'Magic link gönder'}
          </button>
          <button
            className="btn btn--ghost btn--block"
            disabled={busy !== null}
            onClick={() => void onReset()}
            type="button"
          >
            {busy === 'reset' ? 'Gönderiliyor…' : 'Şifremi unuttum'}
          </button>
        </form>
        <p className="auth-panel__footer">
          Hesabın yok mu? <Link to="/kayit">Kayıt ol</Link>
        </p>
      </main>
    </SiteChrome>
  );
}
