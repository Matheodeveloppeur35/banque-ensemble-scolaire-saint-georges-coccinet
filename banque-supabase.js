async function obtenirUtilisateurSupabase() {
    verifierClientSupabase();

    const { data, error } =
        await supabaseClient.auth.getUser();

    if (error) {
        throw error;
    }

    return data.user || null;
}

async function obtenirProfilSupabase() {
    const utilisateur =
        await obtenirUtilisateurSupabase();

    if (!utilisateur) {
        return null;
    }

    const { data, error } = await supabaseClient
        .from("profils")
        .select(`
            id,
            nom_affiche,
            discord_id,
            avatar_url,
            role,
            statut,
            cree_le
        `)
        .eq("id", utilisateur.id)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function obtenirCompteSupabase() {
    const utilisateur =
        await obtenirUtilisateurSupabase();

    if (!utilisateur) {
        return null;
    }

    const { data, error } = await supabaseClient
        .from("comptes")
        .select(`
            id,
            utilisateur_id,
            numero_compte,
            solde_centimes,
            statut,
            cree_le
        `)
        .eq("utilisateur_id", utilisateur.id)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function obtenirTransactionsSupabase(
    limite = 100
) {
    const compte = await obtenirCompteSupabase();

    if (!compte) {
        return [];
    }

    const limiteValide = Number.isInteger(limite)
        ? Math.min(Math.max(limite, 1), 500)
        : 100;

    const { data, error } = await supabaseClient
        .from("transactions")
        .select(`
            id,
            compte_id,
            type,
            categorie,
            titre,
            description,
            montant_centimes,
            compte_destinataire_id,
            reference,
            cree_le
        `)
        .eq("compte_id", compte.id)
        .order("cree_le", {
            ascending: false
        })
        .limit(limiteValide);

    if (error) {
        throw error;
    }

    return Array.isArray(data) ? data : [];
}

async function obtenirDonneesBancairesSupabase() {
    const [
        utilisateur,
        profil,
        compte
    ] = await Promise.all([
        obtenirUtilisateurSupabase(),
        obtenirProfilSupabase(),
        obtenirCompteSupabase()
    ]);

    if (!utilisateur || !profil || !compte) {
        return null;
    }

    return {
        utilisateur: utilisateur,
        profil: profil,
        compte: compte
    };
}

function formaterEurosSupabase(
    montantCentimes
) {
    const montant = Number(montantCentimes);

    const montantValide = Number.isFinite(montant)
        ? montant
        : 0;

    return (
        (montantValide / 100).toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ) +
        " € RP"
    );
}

function formaterDateSupabase(dateTexte) {
    const date = new Date(dateTexte);

    if (Number.isNaN(date.getTime())) {
        return "Date inconnue";
    }

    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function verifierClientSupabase() {
    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {
        throw new Error(
            "Le client Supabase n’est pas disponible."
        );
    }
}
