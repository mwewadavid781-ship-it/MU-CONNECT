const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables in backend.');
}

// Server-side client using service role for administrative database actions
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
