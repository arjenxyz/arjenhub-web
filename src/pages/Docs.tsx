import { Link } from 'react-router-dom';

import { CopyCode } from '../components/CopyCode';
import { SiteChrome } from '../components/SiteChrome';
import { SSO_BASE } from '../lib/sso';

const EMBED_SNIPPET = `<!-- Sign in with ArjenHub (PKCE — no client secret in the browser) -->
<script
  src="${SSO_BASE}/arjenhub-auth.js"
  data-sso-base="${SSO_BASE}"
  data-client-id="YOUR_CLIENT_ID"
></script>

<button
  type="button"
  data-arjenhub-signin
  onclick="ArjenHubAuth.signIn()"
  style="display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:0 18px;border-radius:999px;border:1px solid #c9d0d8;background:#fff;font:inherit;font-weight:650;cursor:pointer"
>
  <img
    class="arjenhub-mark"
    src="${SSO_BASE}/arjenhub-mark.png"
    width="22"
    height="22"
    alt=""
    aria-hidden="true"
    style="width:22px;height:22px;border-radius:6px;object-fit:cover;flex-shrink:0;display:block"
  />
  Sign in with ArjenHub
</button>

<script>
  ArjenHubAuth.handleCallback()
    .then(function (session) {
      if (session && session.user) {
        console.log('Signed in', session.user);
        // session.accessToken — call your APIs
      }
    })
    .catch(console.error);
</script>`;

const MANUAL_SIGNIN = `ArjenHubAuth.signIn({
  clientId: 'YOUR_CLIENT_ID',
  redirectUri: window.location.origin + '/',
  scopes: ['profile.name', 'profile.email'],
});`;

const SESSION_API = `// After redirect / on load
const session = await ArjenHubAuth.handleCallback();
// session = {
//   accessToken, tokenType, expiresIn, scope,
//   user: { name?, email?, avatar? },  // by granted scopes
//   at
// }
const user = ArjenHubAuth.getUser();           // or null
const token = ArjenHubAuth.getAccessToken();   // or null
const full = ArjenHubAuth.getSession();        // or null
await ArjenHubAuth.signOut();`;

const SESSION_SHAPE = `{
  "accessToken": "…",
  "tokenType": "bearer",
  "expiresIn": 3600,
  "scope": "profile.name profile.email",
  "user": {
    "name": "Ada",
    "email": "ada@example.com"
  },
  "at": "2026-01-01T12:00:00.000Z"
}`;

const USERINFO_EXAMPLE = `GET ${SSO_BASE}/userinfo
Authorization: Bearer ACCESS_TOKEN

→ { "name": "Ada", "email": "ada@example.com" }`;

const WORKSPACE_EXAMPLE = `GET ${SSO_BASE}/workspace
Authorization: Bearer ACCESS_TOKEN

→ {
  "storage": "On this device",
  "cloudSync": "Not connected",
  "milestone": "Foundation"
}`;

const TOKEN_EXCHANGE = `POST ${SSO_BASE}/token
Content-Type: application/json

{
  "clientId": "YOUR_CLIENT_ID",
  "code": "AUTH_CODE_FROM_REDIRECT",
  "codeVerifier": "PKCE_VERIFIER"
}`;

export function Docs() {
  return (
    <SiteChrome compact>
      <main className="docs">
        <p className="docs__eyebrow">ArjenHub · Private SSO</p>
        <h1 className="docs__title">Docs</h1>
        <p className="docs__lead">
          End-to-end guide for wiring <strong>Sign in with ArjenHub</strong> into your own sites.
          Stack: OAuth 2.0 Authorization Code + PKCE, TOTP gate, mobile approval, share consent.
          Secured by <strong>ARJENSAN</strong>. Create a Client ID in{' '}
          <Link to="/panel/developer">/panel/developer</Link>, then paste the embed snippet.
        </p>

        <section className="docs__section">
          <h2>0. Prerequisites</h2>
          <ul className="docs__list">
            <li>
              An ArjenHub owner account (web <Link to="/kayit">sign up</Link> /{' '}
              <Link to="/giris">sign in</Link>, or the Expo app).
            </li>
            <li>
              <strong>Authenticator (TOTP)</strong> enabled in the ArjenHub mobile app — the authorize
              gate asks for a 6-digit code.
            </li>
            <li>
              Phone app with <strong>Approvals</strong> — after TOTP, the owner must confirm on device.
            </li>
            <li>
              A registered OAuth client (Client ID <code>ah_…</code>) with your site’s redirect URI(s).
            </li>
          </ul>
          <p>
            This is a <strong>private SSO</strong>: relying parties do not self-register anonymously.
            The IdP owner creates clients and approves every login.
          </p>
        </section>

        <section className="docs__section">
          <h2>Base URLs</h2>
          <p>Production SSO Edge for this project:</p>
          <CopyCode code={SSO_BASE} label="SSO base" />
          <ul className="docs__list">
            <li>
              Authorize gate: <code>{SSO_BASE}/authorize</code>
            </li>
            <li>
              SDK: <code>{SSO_BASE}/arjenhub-auth.js</code>
            </li>
            <li>
              Mark: <code>{SSO_BASE}/arjenhub-mark.png</code>
            </li>
            <li>
              Token: <code>{SSO_BASE}/token</code>
            </li>
            <li>
              Userinfo: <code>{SSO_BASE}/userinfo</code>
            </li>
            <li>
              Workspace: <code>{SSO_BASE}/workspace</code>
            </li>
          </ul>
        </section>

        <section className="docs__section">
          <h2>1. Create an OAuth client</h2>
          <p>
            <strong>Primary (web):</strong> open <Link to="/panel/developer">/panel/developer</Link>{' '}
            (OAuth sites) → <strong>Connected sites</strong> → <strong>Add site</strong>. Set name,
            redirect URIs, and scopes. Copy the Client ID and HTML snippet (secret is shown once;
            SPA clients use PKCE and must not ship the secret).
          </p>
          <p>
            <strong>Alternative (Expo):</strong> Websites → Create SSO demo site or Add custom site.
          </p>
          <ol className="docs__steps">
            <li>Register exact redirect URI(s), e.g. <code>https://yoursite.com/</code>.</li>
            <li>
              For local demo, include both <code>http://127.0.0.1:5173/</code> and{' '}
              <code>http://localhost:5173/</code>.
            </li>
            <li>
              Copy Client ID (<code>ah_…</code>). Optional Client Secret only for confidential
              backends.
            </li>
          </ol>
          <CopyCode
            code={`http://127.0.0.1:5173/\nhttp://localhost:5173/`}
            label="Demo redirect URIs"
          />
        </section>

        <section className="docs__section">
          <h2>2. Embed Sign in with ArjenHub</h2>
          <p>
            Paste into any static HTML / SPA page. Replace <code>YOUR_CLIENT_ID</code> with the ID
            from step 1 (or copy the ready snippet from{' '}
            <Link to="/panel/developer">/panel/developer</Link>).
          </p>
          <CopyCode code={EMBED_SNIPPET} label="HTML embed" />
        </section>

        <section className="docs__section">
          <h2>3. What the user walks through</h2>
          <ol className="docs__steps">
            <li>
              User taps <strong>Sign in with ArjenHub</strong> → hosted authorize gate opens.
            </li>
            <li>
              Enters the 6-digit <strong>Authenticator (TOTP)</strong> code from the ArjenHub app.
            </li>
            <li>
              Gate waits → owner opens <strong>Approvals</strong> on the phone and confirms identity.
            </li>
            <li>
              Gate shows <strong>share consent</strong> (name, email, …). Approve → auth code;
              cancel → no data, no session.
            </li>
            <li>
              Browser redirects to <code>redirect_uri?code=…&state=…</code>.
            </li>
            <li>
              <code>ArjenHubAuth.handleCallback()</code> exchanges the code (PKCE) for an access
              token + user profile.
            </li>
          </ol>
        </section>

        <section className="docs__section">
          <h2>4. Session shape</h2>
          <p>
            After a successful callback, the SDK stores a session in <code>sessionStorage</code>:
          </p>
          <CopyCode code={SESSION_SHAPE} label="Session JSON" />
          <p>
            <code>user</code> fields follow granted scopes only (<code>name</code>,{' '}
            <code>email</code>, <code>avatar</code>).
          </p>
          <CopyCode code={SESSION_API} label="Session helpers" />
        </section>

        <section className="docs__section">
          <h2>5. Call APIs with the access token</h2>
          <p>
            Send <code>Authorization: Bearer &lt;accessToken&gt;</code>. The browser SDK already
            called <code>/userinfo</code> during <code>handleCallback</code>; you can call again or
            hit other endpoints from your backend.
          </p>
          <CopyCode code={USERINFO_EXAMPLE} label="GET /userinfo" />
          <CopyCode code={WORKSPACE_EXAMPLE} label="GET /workspace" />
          <p>
            <code>/workspace</code> requires the <code>workspace.basic</code> scope on the client
            and the issued token.
          </p>
        </section>

        <section className="docs__section">
          <h2>6. SDK API</h2>
          <CopyCode code={MANUAL_SIGNIN} label="signIn options" />
          <div className="docs__table-wrap">
            <table className="docs__table">
              <thead>
                <tr>
                  <th>Call</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>init(opts?)</code>
                  </td>
                  <td>Set ssoBaseUrl / clientId / scopes</td>
                </tr>
                <tr>
                  <td>
                    <code>signIn(opts?)</code>
                  </td>
                  <td>Start OAuth + PKCE login</td>
                </tr>
                <tr>
                  <td>
                    <code>handleCallback()</code>
                  </td>
                  <td>Exchange code → session</td>
                </tr>
                <tr>
                  <td>
                    <code>getSession()</code>
                  </td>
                  <td>Full session object or null</td>
                </tr>
                <tr>
                  <td>
                    <code>getUser()</code>
                  </td>
                  <td>Current user or null</td>
                </tr>
                <tr>
                  <td>
                    <code>getAccessToken()</code>
                  </td>
                  <td>Bearer token or null</td>
                </tr>
                <tr>
                  <td>
                    <code>signOut()</code>
                  </td>
                  <td>Clear local session</td>
                </tr>
                <tr>
                  <td>
                    <code>markUrl()</code>
                  </td>
                  <td>Absolute mark PNG URL</td>
                </tr>
                <tr>
                  <td>
                    <code>enhanceButtons()</code>
                  </td>
                  <td>Inject mark into buttons missing an img</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="docs__section">
          <h2>7. Scopes</h2>
          <p>Request with space-separated <code>scope</code> query / SDK <code>scopes</code> array:</p>
          <CopyCode
            code={`profile.name
profile.email
profile.avatar
workspace.basic`}
            label="Supported scopes"
          />
        </section>

        <section className="docs__section">
          <h2>8. Token exchange (advanced)</h2>
          <p>The browser SDK does this for you. Confidential backends can POST directly:</p>
          <CopyCode code={TOKEN_EXCHANGE} label="POST /token" />
          <p>
            Public clients send <code>codeVerifier</code>. Confidential clients may send{' '}
            <code>clientSecret</code> instead of (or in addition to) PKCE, depending on how the
            client was registered.
          </p>
        </section>

        <section className="docs__section">
          <h2>9. Local demo</h2>
          <ol className="docs__steps">
            <li>
              In <Link to="/panel/developer">/panel/developer</Link> (or Expo Websites), create a
              site with loopback
              redirects.
            </li>
            <li>
              In the <code>newapp</code> repo: <code>npm run sso-demo</code>
            </li>
            <li>
              Open <code>http://127.0.0.1:5173/</code> or <code>http://localhost:5173/</code>
            </li>
            <li>Paste Client ID if the demo asks → TOTP → Approvals → share consent → signed in.</li>
          </ol>
        </section>

        <section className="docs__section">
          <h2>10. Errors &amp; production checklist</h2>
          <ul className="docs__list">
            <li>
              <code>redirect_uri is not registered</code> — URI must match registration exactly
              (trailing slash matters; loopback soft-match is local-only).
            </li>
            <li>
              <code>state mismatch</code> — start and finish sign-in on the same origin / tab
              (CSRF protection).
            </li>
            <li>
              <code>Challenge expired</code> — complete TOTP + Approvals + share within ~5 minutes.
            </li>
            <li>
              Share <strong>denied</strong> — no auth code, no session; user cancelled data share.
            </li>
            <li>
              <code>Invalid code_verifier</code> / PKCE failure — do not clear sessionStorage mid-flow;
              avoid starting login from <code>file://</code>.
            </li>
          </ul>
          <p>Before production:</p>
          <ul className="docs__list">
            <li>Use HTTPS redirect URIs only (no localhost in the prod client).</li>
            <li>Never put the client secret in frontend JavaScript.</li>
            <li>Request the minimum scopes you need.</li>
            <li>Confirm TOTP + Approvals work on the owner’s phone before go-live.</li>
            <li>
              Treat access tokens as short-lived (~1h); call <code>signOut()</code> on logout.
            </li>
          </ul>
        </section>

        <section className="docs__section">
          <h2>Security notes</h2>
          <ul className="docs__list">
            <li>Never put the client secret in frontend JavaScript.</li>
            <li>Redirect URIs must match registration (loopback soft-match for local only).</li>
            <li>TOTP + mobile approval + share consent are required before an auth code is issued.</li>
            <li>ARJENSAN is the security layer behind ArjenHub SSO.</li>
          </ul>
        </section>
      </main>
    </SiteChrome>
  );
}
