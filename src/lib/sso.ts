import { getArjenHubSession } from './arjenhubAuth';
import { supabase } from './supabase';

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '');

export const SSO_BASE = `${supabaseUrl}/functions/v1/sso`;

export const SSO_SCOPES = [
  'profile.name',
  'profile.email',
  'profile.avatar',
  'workspace.basic',
] as const;

export type SsoScope = (typeof SSO_SCOPES)[number];

export type OAuthClient = {
  id: string;
  name: string;
  clientId: string;
  redirectUris: string[];
  allowedScopes: string[];
  isPublic: boolean;
  createdAt: string;
  websiteUrl?: string | null;
  description?: string | null;
  iconUrl?: string | null;
  metaTitle?: string | null;
  clientSecret?: string;
};

export type SiteMeta = {
  title: string | null;
  description: string | null;
  iconUrl: string | null;
  websiteUrl?: string;
};

export function buildEmbedSnippet(clientId: string): string {
  const base = SSO_BASE.replace(/\/$/, '');
  const sdk = `${base}/arjenhub-auth.js`;
  const mark = `${base}/arjenhub-mark.png`;
  return `<!-- Sign in with ArjenHub (PKCE — no secret in the browser) -->
<script
  src="${sdk}"
  data-sso-base="${base}"
  data-client-id="${clientId}"
></script>
<button type="button" data-arjenhub-signin onclick="ArjenHubAuth.signIn()"
  style="display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:0 18px;border-radius:999px;border:1px solid #c9d0d8;background:#fff;font:inherit;font-weight:650;cursor:pointer">
  <img class="arjenhub-mark" src="${mark}" width="22" height="22" alt="" aria-hidden="true"
    style="width:22px;height:22px;border-radius:6px;object-fit:cover;flex-shrink:0;display:block" />
  Sign in with ArjenHub
</button>
<script>
  ArjenHubAuth.handleCallback().then(function (s) {
    if (s && s.user) console.log('Signed in', s.user);
  }).catch(console.error);
</script>`;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const supabaseToken = data.session?.access_token;
  if (supabaseToken) {
    return {
      Authorization: `Bearer ${supabaseToken}`,
      apikey: anonKey,
      'Content-Type': 'application/json',
    };
  }

  const arjenToken = getArjenHubSession()?.accessToken ?? null;
  if (arjenToken) {
    return {
      Authorization: `Bearer ${arjenToken}`,
      ...(anonKey ? { apikey: anonKey } : {}),
      'Content-Type': 'application/json',
    };
  }

  throw new Error('Oturum gerekli. Tekrar giriş yapın.');
}

async function ssoFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = {
    ...(await authHeaders()),
    ...(init?.headers ?? {}),
  };
  const response = await fetch(`${SSO_BASE}${path}`, { ...init, headers });
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  } & T;
  if (!response.ok) {
    throw new Error(body.error ?? body.message ?? `SSO request failed (${response.status})`);
  }
  return body;
}

export async function listClients(): Promise<OAuthClient[]> {
  const result = await ssoFetch<{ clients: OAuthClient[] }>('/clients');
  return result.clients ?? [];
}

export async function createClient(input: {
  name: string;
  redirectUris: string[];
  allowedScopes: string[];
  isPublic?: boolean;
  websiteUrl?: string | null;
  description?: string | null;
  iconUrl?: string | null;
  metaTitle?: string | null;
}): Promise<OAuthClient> {
  return ssoFetch<OAuthClient>('/clients', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      redirectUris: input.redirectUris,
      allowedScopes: input.allowedScopes,
      isPublic: input.isPublic !== false,
      websiteUrl: input.websiteUrl || null,
      description: input.description || null,
      iconUrl: input.iconUrl || null,
      metaTitle: input.metaTitle || null,
    }),
  });
}

export async function updateClient(
  id: string,
  input: {
    name?: string;
    redirectUris?: string[];
    allowedScopes?: string[];
    isPublic?: boolean;
    websiteUrl?: string | null;
    description?: string | null;
    iconUrl?: string | null;
    metaTitle?: string | null;
  },
): Promise<OAuthClient> {
  return ssoFetch<OAuthClient>(`/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function fetchSiteMeta(url: string): Promise<SiteMeta> {
  return ssoFetch<SiteMeta>('/clients/fetch-meta', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export async function refreshClientMeta(id: string): Promise<OAuthClient> {
  return ssoFetch<OAuthClient>(`/clients/${id}/refresh-meta`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function deleteClient(id: string): Promise<void> {
  await ssoFetch(`/clients/${id}`, { method: 'DELETE' });
}

export type IdentityProfile = {
  identityCode: string;
  isDeveloper: boolean;
  displayName?: string;
};

export async function getIdentityCode(): Promise<IdentityProfile> {
  return ssoFetch<IdentityProfile>('/me/identity-code');
}
