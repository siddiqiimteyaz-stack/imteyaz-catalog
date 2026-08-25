// =========================================
// Supabase Connection — यहां अपने project की
// जानकारी डाली गई है
// =========================================
const SUPABASE_URL = "https://cupamjjjkctzezhleuhv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1cGFtampqa2N0emV6aGxldWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDc5NDgsImV4cCI6MjEwMzA4Mzk0OH0.hF2_w3-bVtHfm5-N0ugk69yvAUlIs7UY2d7CQXERCKQ";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
