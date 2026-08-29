import { createClient } from '@supabase/supabase-js';

// Vite exposes env vars prefixed with VITE_ through import.meta.env
// (this is Vite's own mechanism — different from Node's process.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);