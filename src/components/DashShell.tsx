import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { BrandMark } from './BrandMark';
import { useAuth } from '../lib/auth';
import { initials, portalAvatarUrl, portalDisplayName, portalEmail } from '../lib/dashUser';
import { isDeveloperEmail } from '../lib/developer';
import { getIdentityCode } from '../lib/sso';

type DashShellProps = {
  children: ReactNode;
};

export function DashShell({ children }: DashShellProps) {
  const { user, arjenHubUser, isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [identityCode, setIdentityCode] = useState<string | null>(null);
  const [identityNote, setIdentityNote] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  const displayName = portalDisplayName(user, arjenHubUser);
  const email = portalEmail(user, arjenHubUser);
  const avatarUrl = portalAvatarUrl(user, arjenHubUser);
  const developer = isDeveloperEmail(user?.email ?? arjenHubUser?.email);
  const onDeveloper = location.pathname.startsWith('/panel/developer');

  useEffect(() => {
    if (!isAuthenticated) {
      setIdentityCode(null);
      setIdentityNote(null);
      return;
    }
    let active = true;
    setIdentityNote(null);
    void getIdentityCode()
      .then((profile) => {
        if (!active) return;
        setIdentityCode(profile.identityCode);
        setIdentityNote(null);
      })
      .catch(() => {
        if (!active) return;
        setIdentityCode(null);
        if (!user) {
          setIdentityNote(
            'Kimlik kodu şu an kullanılamıyor (SSO API Supabase oturumu bekliyor olabilir). Profil açık kalır.',
          );
        }
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  async function onSignOut() {
    setMenuOpen(false);
    setBusy(true);
    try {
      await signOut();
    } catch {
      setBusy(false);
    }
  }

  async function onCopyCode() {
    if (!identityCode) return;
    try {
      await navigator.clipboard.writeText(identityCode);
      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="dash">
      <div className="dash__glow" aria-hidden="true" />

      <header className="dash__nav">
        <div className="dash__nav-inner">
          <Link className="dash__brand" to="/">
            <BrandMark size={28} />
            <span>
              <span className="arjen">Arjen</span>
              <span className="hub">Hub</span>
            </span>
          </Link>

          <div className="dash__menu" ref={menuRef}>
            <button
              aria-controls={menuId}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
              className="dash__avatar-btn"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {avatarUrl ? (
                <img alt="" className="dash__avatar-img" src={avatarUrl} />
              ) : (
                <span aria-hidden="true">{initials(displayName)}</span>
              )}
            </button>

            {menuOpen ? (
              <div className="dash__dropdown" id={menuId} role="menu">
                <div className="dash__dropdown-head">
                  <strong>{displayName}</strong>
                  <span>{email ?? '—'}</span>
                </div>

                {identityCode ? (
                  <div className="dash__dropdown-code">
                    <span className="dash__dropdown-code-label">ArjenHub kodu</span>
                    <div className="dash__dropdown-code-row">
                      <code className="dash__dropdown-code-value">{identityCode}</code>
                      <button
                        className="dash__dropdown-code-copy"
                        onClick={() => void onCopyCode()}
                        type="button"
                      >
                        {codeCopied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="dash__dropdown-code-hint">
                      Use this 6-digit code to sign in with ArjenHub on connected sites.
                    </p>
                  </div>
                ) : identityNote ? (
                  <p className="dash__dropdown-code-hint" style={{ opacity: 0.7, margin: '0.5rem 0.75rem' }}>
                    {identityNote}
                  </p>
                ) : null}

                {developer && user ? (
                  onDeveloper ? (
                    <Link
                      className="dash__dropdown-item"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                      to="/panel"
                    >
                      Account
                    </Link>
                  ) : (
                    <Link
                      className="dash__dropdown-item"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                      to="/panel/developer"
                    >
                      OAuth sites
                    </Link>
                  )
                ) : null}

                <button
                  className="dash__dropdown-item dash__dropdown-item--danger"
                  disabled={busy}
                  onClick={() => void onSignOut()}
                  role="menuitem"
                  type="button"
                >
                  {busy ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="dash__main">{children}</main>
    </div>
  );
}
