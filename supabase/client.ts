import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    });
} else {
    console.warn(
        '[Supabase] VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY não configurados. Recurso remoto desabilitado; usando dados locais.'
    );
}

export const getSupabaseClient = (): SupabaseClient | null => supabase;

export const isSupabaseConfigured = (): boolean => supabase !== null;
