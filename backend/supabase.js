const { createClient } = require("@supabase/supabase-js");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("Supabase credentials are missing. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env.");
}
const supabase = createClient(
  process.env.SUPABASE_URL || "https://example.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "development-placeholder-key",
  { auth: { persistSession: false, autoRefreshToken: false } }
);
module.exports = supabase;
