import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '');
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);
