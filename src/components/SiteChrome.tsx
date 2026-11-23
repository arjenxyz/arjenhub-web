import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../lib/auth';
import { BrandMark } from './BrandMark';

export function SiteMetaExtras({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <div className={className ? `site-meta-extras ${className}` : 'site-meta-extras'}>
      <a className="site-footer__status" href="#" onClick={onNavigate}>
        <span className="site-footer__status-dot" aria-hidden="true" />
        All Systems Operational
        <span aria-hidden="true">↗</span>
      </a>
      <Link className="site-footer__privacy" onClick={onNavigate} to="/docs">
        <span aria-hidden="true" className="site-footer__privacy-icon">
          <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
            <circle cx="7" cy="7" r="6.25" stroke="#3b82f6" strokeWidth="1.5" />
            <path
              d="M4.2 7.1 6.1 9l3.7-4.2"
              stroke="#3b82f6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </span>
        Your Privacy Choices
      </Link>
    </div>
  );
}

function SecuredBy() {
  return (
    <div className="secured-dock" aria-label="Güvenlik">
      <p className="site-footer__infra">
        <svg
          aria-hidden="true"
          className="site-footer__infra-icon"
          fill="none"
          height="14"
          viewBox="0 0 24 24"
          width="14"
        >
          <path
            d="M12 3 5 6.2v5.1c0 4.4 2.9 8.4 7 9.7 4.1-1.3 7-5.3 7-9.7V6.2L12 3Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="m9.2 12.1 1.9 1.9 3.7-3.8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
        Secured by <span className="site-footer__infra-brand">ARJENSAN</span>
      </p>
    </div>
  );
}

export function SiteChrome({
  children,
  compact,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className={`site ${compact ? 'site--compact' : ''}`}>
      <header className="site-nav">
        <div className="site-nav__inner">
          <Link className="site-nav__brand" onClick={closeMenu} to="/">
            <BrandMark size={28} />
            <span className="site-nav__name">
              <span className="arjen">Arjen</span>
              <span className="hub">Hub</span>
            </span>
          </Link>

          <nav className="site-nav__desktop" aria-label="Ana">
            {isAuthenticated ? (
              <Link className="site-nav__dashboard" to="/panel">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/giris">Giriş</Link>
                <Link className="site-nav__dashboard" to="/kayit">
                  Get started
                </Link>
              </>
            )}
          </nav>

          <button
            aria-controls={menuId}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            className={`site-nav__menu-btn${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <span className="site-nav__menu-icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div aria-modal="true" className="site-menu" id={menuId} role="dialog">
          <div className="site-menu__top">
            <Link className="site-nav__brand" onClick={closeMenu} to="/">
              <BrandMark size={28} />
              <span className="site-nav__name">
                <span className="arjen">Arjen</span>
                <span className="hub">Hub</span>
              </span>
            </Link>
            <button
              aria-label="Menüyü kapat"
              className="site-nav__menu-btn is-open"
              onClick={closeMenu}
              type="button"
            >
              <span className="site-nav__menu-icon" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>

          <div className="site-menu__actions">
            {isAuthenticated ? (
              <Link className="site-menu__btn site-menu__btn--primary" onClick={closeMenu} to="/panel">
                Panel
              </Link>
            ) : (
              <>
                <Link className="site-menu__btn site-menu__btn--ghost" onClick={closeMenu} to="/giris">
                  Giriş
                </Link>
                <Link className="site-menu__btn site-menu__btn--primary" onClick={closeMenu} to="/kayit">
                  Kayıt ol
                </Link>
              </>
            )}
          </div>

          <nav aria-label="Mobil menü" className="site-menu__list">
            {isAuthenticated ? (
              <Link onClick={closeMenu} to="/panel">
                Hesap
              </Link>
            ) : (
              <>
                <Link onClick={closeMenu} to="/giris">
                  Giriş
                </Link>
                <Link onClick={closeMenu} to="/kayit">
                  Kayıt ol
                </Link>
              </>
            )}
          </nav>

          <div className="site-menu__meta">
            <SiteMetaExtras onNavigate={closeMenu} />
          </div>
        </div>
      ) : null}

      {children}
      <SecuredBy />
    </div>
  );
}
