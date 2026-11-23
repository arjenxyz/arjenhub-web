import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { SiteChrome } from '../components/SiteChrome';
import { mapAuthError, useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

export function SignUp() {
  const { isAuthenticated, loading, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'form' | 'google' | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!loading && isAuthenticated) {
    return <Navigate replace to="/panel" />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setBusy('form');
    try {
      await signUp(email.trim(), password, displayName);
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/panel', { replace: true });
        return;
      }
      setInfo('Hesap oluşturuldu. E-posta onayı açıksa gelen kutunu kontrol et, sonra giriş yap.');
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

  return (
    <SiteChrome compact>
      <main className="auth-panel">
        <h1 className="auth-panel__title">Kayıt ol</h1>
        <p className="auth-panel__lead">Google ile veya e-posta ile hesap oluştur.</p>

        <div className="auth-oauth">
          <GoogleSignInButton
            busy={busy === 'google'}
            disabled={busy !== null && busy !== 'google'}
            label="Google ile kayıt ol"
            onClick={() => void onGoogle()}
          />
        </div>

        <div className="auth-divider" aria-hidden="true">
          <span>veya</span>
        </div>

        <form className="auth-form auth-form--tight" onSubmit={onSubmit}>
          <label className="field">
            <span>Görünen ad</span>
            <input
              autoComplete="name"
              onChange={(e) => setDisplayName(e.target.value)}
              required
              type="text"
              value={displayName}
            />
          </label>
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
              autoComplete="new-password"
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              required
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
          <button className="btn btn--primary btn--block" disabled={busy !== null} type="submit">
            {busy === 'form' ? 'Oluşturuluyor…' : 'Hesap oluştur'}
          </button>
        </form>
        <p className="auth-panel__footer">
          Zaten hesabın var mı? <Link to="/giris">Giriş</Link>
        </p>
      </main>
    </SiteChrome>
  );
}
