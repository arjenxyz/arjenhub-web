import { SSO_BASE } from './sso';

/** Canonical OAuth redirect — must match registered URI exactly (trailing slash). */
export const arjenHubRedirectUri = () => `${window.location.origin}/`;

export type ArjenHubConfig = {
  ssoBase: string;
  clientId: string;
};

export type ArjenHubUser = {
  name?: string;
  email?: string;
  avatar?: string;
};

export type ArjenHubSession = {
  accessToken: string;
  tokenType?: string;
  expiresIn?: number;
  scope?: string;
  user?: ArjenHubUser;
  at?: string;
};

export type ArjenHubAuthApi = {
  signIn: (opts?: {
    clientId?: string;
    ssoBaseUrl?: string;
    redirectUri?: string;
    scopes?: string[];
  }) => void | Promise<void>;
  handleCallback: () => Promise<ArjenHubSession | null>;
  getUser: () => ArjenHubUser | null;
  getAccessToken: () => string | null;
  getSession: () => ArjenHubSession | null;
  signOut: () => Promise<void> | void;
  enhanceButtons?: () => void;
  markUrl?: () => string;
};

declare global {
  interface Window {
    ArjenHubAuth?: ArjenHubAuthApi;
  }
}

export function getArjenHubConfig(): ArjenHubConfig {
  return {
    ssoBase: SSO_BASE.replace(/\/$/, ''),
    clientId: String(import.meta.env.VITE_ARJENHUB_CLIENT_ID ?? '').trim(),
  };
}

/** @deprecated Prefer getArjenHubConfig().clientId */
export const ARJENHUB_CLIENT_ID = String(import.meta.env.VITE_ARJENHUB_CLIENT_ID ?? '').trim();

export const ARJENHUB_MARK_URL = `${SSO_BASE.replace(/\/$/, '')}/arjenhub-mark.png`;

let loadPromise: Promise<ArjenHubAuthApi> | null = null;

/** Load arjenhub-auth.js once. Do not call enhanceButtons — buttons ship their own mark img. */
export function ensureArjenHubSdk(): Promise<ArjenHubAuthApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('ArjenHub SDK requires a browser'));
  }
  if (window.ArjenHubAuth) {
    return Promise.resolve(window.ArjenHubAuth);
  }
  if (loadPromise) return loadPromise;

  const { ssoBase, clientId } = getArjenHubConfig();
  const src = `${ssoBase}/arjenhub-auth.js`;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.ArjenHubAuth) resolve(window.ArjenHubAuth);
        else reject(new Error('ArjenHubAuth missing after script load'));
      });
      existing.addEventListener('error', () => reject(new Error('Failed to load ArjenHub auth SDK')));
      if (window.ArjenHubAuth) resolve(window.ArjenHubAuth);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.ssoBase = ssoBase;
    if (clientId) {
      script.dataset.clientId = clientId;
    }
    script.onload = () => {
      if (window.ArjenHubAuth) resolve(window.ArjenHubAuth);
      else reject(new Error('ArjenHubAuth missing after script load'));
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load ArjenHub auth SDK'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** Alias kept for call sites / copy-paste recipes. */
export const loadArjenHubSdk = ensureArjenHubSdk;

export async function signInWithArjenHub(): Promise<void> {
  const { ssoBase, clientId } = getArjenHubConfig();
  if (!clientId) {
    throw new Error('VITE_ARJENHUB_CLIENT_ID is not set');
  }
  const api = await ensureArjenHubSdk();
  await api.signIn({
    clientId,
    ssoBaseUrl: ssoBase,
    redirectUri: arjenHubRedirectUri(),
  });
}

export async function handleArjenHubCallback(): Promise<ArjenHubSession | null> {
  const { clientId } = getArjenHubConfig();
  if (!clientId) return null;
  const params = new URLSearchParams(window.location.search);
  if (!params.has('code') || !params.has('state')) return null;
  const api = await ensureArjenHubSdk();
  return api.handleCallback();
}

export function getArjenHubUser(): ArjenHubUser | null {
  return window.ArjenHubAuth?.getUser() ?? null;
}

export function getArjenHubSession(): ArjenHubSession | null {
  return window.ArjenHubAuth?.getSession() ?? null;
}

/** Strip OAuth query params after a successful (or failed) callback exchange. */
export function clearOAuthParamsFromUrl(): void {
  const url = new URL(window.location.href);
  let changed = false;
  for (const key of ['code', 'state', 'error', 'error_description']) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }
  if (changed) {
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }
}
