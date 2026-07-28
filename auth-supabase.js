const URL_RETOUR_DISCORD =
    "https://matheodeveloppeur35.github.io/" +
    "banque-ensemble-scolaire-saint-georges-coccinet/" +
    "dashboard.html";

async function connexionAvecDiscord() {
    if (typeof supabaseClient === "undefined") {
        throw new Error(
            "Le client Supabase n’est pas disponible."
        );
    }

    const { error } =
        await supabaseClient.auth.signInWithOAuth({
            provider: "discord",

            options: {
                redirectTo: URL_RETOUR_DISCORD,

                scopes: "identify"
            }
        });

    if (error) {
        throw error;
    }
}

async function obtenirSessionSupabase() {
    if (typeof supabaseClient === "undefined") {
        return null;
    }

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {
        console.error(
            "Erreur lors de la lecture de la session :",
            error
        );

        return null;
    }

    return data.session;
}

async function deconnexionSupabase() {
    if (typeof supabaseClient === "undefined") {
        return;
    }

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {
        throw error;
    }
}
