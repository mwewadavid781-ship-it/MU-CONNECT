import 'dotenv/config';

const splitOrigins = (value = '') =>
  value.split(',').map((origin) => origin.trim()).filter(Boolean);

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  groqApiKey: process.env.GROQ_API_KEY || null,
  allowedOrigins: splitOrigins(process.env.ALLOWED_ORIGIN || '')
};
