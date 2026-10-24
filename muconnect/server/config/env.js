import 'dotenv/config';

const required = [
'SUPABASE_URL',
'SUPABASE_ANON_KEY',
'SUPABASE_SERVICE_ROLE_KEY'
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
console.error("Missing environment variables: ${missing.join(', ')}");
process.exit(1);
}

export const env = {
nodeEnv: process.env.NODE_ENV || 'development',
port: Number(process.env.PORT) || 3000,
supabaseUrl: process.env.SUPABASE_URL,
supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
groqApiKey: process.env.GROQ_API_KEY || null,
allowedOrigins: process.env.ALLOWED_ORIGIN?.split(',').map(
(origin) => origin.trim()
) || []
};
