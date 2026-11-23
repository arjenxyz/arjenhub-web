import type { User } from '@supabase/supabase-js';

import type { ArjenHubUser } from './arjenhubAuth';

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function displayNameFromUser(user: User | null | undefined): string {
  const meta = user?.user_metadata ?? {};
  return (
    [meta.full_name, meta.name, meta.display_name]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .find(Boolean) ||
    user?.email?.split('@')[0] ||
    'Account'
  );
}

export function avatarUrlFromUser(user: User | null | undefined): string | null {
  const meta = user?.user_metadata ?? {};
  if (typeof meta.avatar_url === 'string' && meta.avatar_url) return meta.avatar_url;
  if (typeof meta.picture === 'string' && meta.picture) return meta.picture;
  return null;
}

/** Prefer Supabase profile; fall back to ArjenHub SSO userinfo. */
export function portalDisplayName(
  user: User | null | undefined,
  arjenHubUser: ArjenHubUser | null | undefined,
): string {
  if (user) return displayNameFromUser(user);
  const fromArjen =
    (typeof arjenHubUser?.name === 'string' && arjenHubUser.name.trim()) ||
    (typeof arjenHubUser?.email === 'string' && arjenHubUser.email.split('@')[0]) ||
    '';
  return fromArjen || 'Account';
}

export function portalEmail(
  user: User | null | undefined,
  arjenHubUser: ArjenHubUser | null | undefined,
): string | null {
  return user?.email ?? arjenHubUser?.email ?? null;
}

export function portalAvatarUrl(
  user: User | null | undefined,
  arjenHubUser: ArjenHubUser | null | undefined,
): string | null {
  return avatarUrlFromUser(user) ?? (arjenHubUser?.avatar ? arjenHubUser.avatar : null);
}