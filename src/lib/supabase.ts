import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const supabaseConfigured = Boolean(url && anonKey);

/** Safe placeholder so the bundle can boot; real calls only when configured. */
export const supabase: SupabaseClient = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'public-anon-key',
);
