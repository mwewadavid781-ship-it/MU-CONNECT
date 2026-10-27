import { createClient } from '@supabase/supabase-js';
import { env, hasSupabase } from '../config/env.js';

// Keep the service-role key on the server only. Never expose it to browser code.
export const supabase = hasSupabase
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;
