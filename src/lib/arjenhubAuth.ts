import { SSO_BASE } from './sso';

/** OAuth redirect URI — must match the client’s registered redirect URIs exactly. */
export const ARJENHUB_REDIRECT_URI = () => `${window.location.origin}/giris`;

export const ARJENHUB_CLIENT_ID = String(import.meta.env.VITE_ARJENHUB_CLIENT_ID ?? '').trim();

export const ARJENHUB_MARK_URL = `${SSO_BASE.replace(/\/$/, '')}/arjenhub-mark.png`;

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
};

declare global {
  interface Window {
    ArjenHubAuth?: ArjenHubAuthApi;
  }
}

let loadPromise: Promise<ArjenHubAuthApi> | null = null;

export function loadArjenHubSdk(): Promise<ArjenHubAuthApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('ArjenHub SDK requires a browser'));
  }
  if (window.ArjenHubAuth) {
    return Promise.resolve(window.ArjenHubAuth);
  }
  if (loadPromise) return loadPromise;

  const base = SSO_BASE.replace(/\/$/, '');
  const src = `${base}/arjenhub-auth.js`;

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
    script.dataset.ssoBase = base;
    if (ARJENHUB_CLIENT_ID) {
      script.dataset.clientId = ARJENHUB_CLIENT_ID;
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

export async function signInWithArjenHub(): Promise<void> {
  if (!ARJENHUB_CLIENT_ID) {
    throw new Error('VITE_ARJENHUB_CLIENT_ID is not set');
  }
  const api = await loadArjenHubSdk();
  await api.signIn({
    clientId: ARJENHUB_CLIENT_ID,
    ssoBaseUrl: SSO_BASE.replace(/\/$/, ''),
    redirectUri: ARJENHUB_REDIRECT_URI(),
  });
}

export async function handleArjenHubCallback(): Promise<ArjenHubSession | null> {
  if (!ARJENHUB_CLIENT_ID) return null;
  const api = await loadArjenHubSdk();
  return api.handleCallback();
}
