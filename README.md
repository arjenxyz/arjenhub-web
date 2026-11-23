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

### Google sign-in

1. Supabase → **Authentication → Providers → Google** → enable; paste Google Cloud OAuth Client ID + Secret.
2. Google Cloud Console → OAuth client → Authorized redirect URI:
   `https://mcurnwkwitmpgqzqwbih.supabase.co/auth/v1/callback`
3. Supabase → **Authentication → URL Configuration** → add redirect URLs, e.g.
   `http://127.0.0.1:5173/panel`, `http://localhost:5173/panel` (match your Vite port; plus production `/panel`).

## Routes

| Path | Page |
|------|------|
| `/` | Landing |
| `/giris` | Sign in |
| `/kayit` | Sign up |
| `/panel` | Account dashboard (auth required) |
| `/panel/developer` | OAuth sites — Connected sites, Client IDs, embed snippets |
