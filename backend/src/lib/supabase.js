const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
}

// Client for general use (respects RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for bypass RLS if needed (requires service role key)
const supabaseAdmin = supabaseServiceRoleKey 
    ? createClient(supabaseUrl, supabaseServiceRoleKey) 
    : null;

module.exports = { supabase, supabaseAdmin };
