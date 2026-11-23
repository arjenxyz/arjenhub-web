# ArjenHub Web

Public identity portal for ArjenHub (landing, sign-in / sign-up, account dashboard).

Shares the same Supabase project as the owner mobile app (`newapp`). OAuth clients and embed
snippets are managed at `/panel/developer`; the account dashboard lives at `/panel`.

## Setup

```bash
cp .env.example .env
# set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

### Vercel

Set **build-time** env vars (Vite inlines `VITE_*` during `npm run build`):

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | Same as app `EXPO_PUBLIC_SUPABASE_URL` (also drives SSO base) |
| `VITE_SUPABASE_ANON_KEY` | Same as app publishable / anon key |
| `VITE_ARJENHUB_CLIENT_ID` | Public OAuth client id; register redirect `https://YOUR_DOMAIN/` (trailing slash) |
| `VITE_DEVELOPER_EMAIL` | (optional) owner email for `/panel/developer` |

Then **Redeploy**. Without these, production used to white-screen; it now shows a config missing page.

Also add SPA rewrite via `vercel.json` (already in repo): all routes → `index.html`.

Supabase → **Authentication → URL Configuration** → Redirect URLs, add:
`https://arjenhub-web.vercel.app/**` (and `/panel`, `/giris` if you prefer exact entries).

ArjenHub SSO client → register redirect URI exactly:
`https://arjenhub-web.vercel.app/` (trailing slash). Callback is handled once at app boot (`ArjenHubBoot`).

### Google sign-in

1. Supabase → **Authentication → Providers → Google** → enable; paste Google Cloud OAuth Client ID + Secret.
2. Google Cloud Console → OAuth client → Authorized redirect URI:
   `https://mcurnwkwitmpgqzqwbih.supabase.co/auth/v1/callback`
3. Supabase → **Authentication → URL Configuration** → add redirect URLs, e.g.
   `http://127.0.0.1:5173/panel`, `http://localhost:5173/panel` (match your Vite port; plus production `/panel`).

## Sign in with ArjenHub on any Vite site

Canonical pattern (same as this portal):

1. Register redirect URI = `https://YOUR_DOMAIN/` (trailing slash — never `/giris`).
2. Env: `VITE_ARJENHUB_CLIENT_ID` + `VITE_SUPABASE_URL` (SSO scripts live under `{SUPABASE_URL}/functions/v1/sso`).
3. Copy `src/lib/arjenhubAuth.ts` + `src/components/ArjenHubSignInButton.tsx`; call `handleArjenHubCallback()` once on app boot; `signInWithArjenHub()` always uses `redirectUri: origin + '/'`. Use one `<img class="arjenhub-mark">` — do **not** call `enhanceButtons()` on that button.

```ts
// boot (e.g. App.tsx inside the router)
await handleArjenHubCallback();

// click
await signInWithArjenHub(); // → ArjenHubAuth.signIn({ redirectUri: origin + '/' })
```

## Routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/giris` | Sign in |
| `/kayit` | Sign up |
| `/panel` | Account dashboard (auth required) |
| `/panel/developer` | OAuth sites — Connected sites, Client IDs, embed snippets |
