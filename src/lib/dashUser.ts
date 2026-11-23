import type { User } from '@supabase/supabase-js';

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