const URL_SUPABASE =
    "https://nwtvvfnsabphiwsrwenl.supabase.co";

const CLE_PUBLIQUE_SUPABASE =
    "sb_publishable_DoqzQ8PZ1OP0tg3DDerIug_Ry4yiQDM";

const supabaseClient = window.supabase.createClient(
    URL_SUPABASE,
    CLE_PUBLIQUE_SUPABASE,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);
