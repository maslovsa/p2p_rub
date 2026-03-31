import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set in .env');
} else {
  console.log('[Supabase] Connecting to', supabaseUrl);
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Test connection on startup
supabase
  .from('p2p_snapshots')
  .select('id', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('[Supabase] Connection failed:', error.message);
    } else {
      console.log(`[Supabase] Connected OK — ${count} snapshots in DB`);
    }
  })
  .catch((e) => {
    console.error('[Supabase] Connection error:', e.message);
  });
