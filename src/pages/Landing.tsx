import { Link } from 'react-router-dom';

import { BrandMark } from '../components/BrandMark';
import { LogoCarousel } from '../components/LogoCarousel';
import { SiteChrome } from '../components/SiteChrome';
import { useAuth } from '../lib/auth';

export function Landing() {
  const { user } = useAuth();

  return (
    <SiteChrome>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__glow" aria-hidden="true" />

        <div className="hero__frame">
          <div className="hero__layout">
            <div className="hero__copy">
              <h1 className="hero__title" id="hero-title">
                <span className="arjen">Arjen</span>
                <span className="hub">Hub</span>
              </h1>
              <p className="hero__tagline">Private SSO for my own products.</p>

              <div className="hero__actions">
                {user ? (
                  <Link className="btn btn--primary" to="/panel">
                    Open dashboard →
                  </Link>
                ) : (
                  <>
                    <Link className="btn btn--primary" to="/kayit">
                      Get started →
                    </Link>
                    <a className="btn btn--ghost" href="mailto:newlifearjen@gmail.com">
                      Talk to me
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="hero__visual" aria-hidden="true">
              <div className="hero__burst" />
              <div className="hero__mark-wrap">
                <BrandMark size={72} />
              </div>
            </div>

            <aside className="hero__aside">
              <p className="hero__support">
                One identity. A 6-digit code in your menu. Sign in with ArjenHub on every site I
                ship — without handing the keys to a big IdP.
              </p>
            </aside>
          </div>

          <div className="hero__rail">
            <p className="hero__trust">
              Private SSO · Identity code · Secured by Arjensan
            </p>
            <LogoCarousel />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
