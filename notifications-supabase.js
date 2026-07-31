const configurationNotificationsSupabase = {
    limiteParDefaut: 50,
    intervalleActualisation: 60000
};

let intervalleNotificationsSupabase = null;

/*
 * Récupère l’utilisateur actuellement connecté.
 */
async function obtenirUtilisateurNotificationsSupabase() {
    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {
        throw new Error(
            "Le client Supabase est indisponible."
        );
    }

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();

    if (error) {
        throw error;
    }

    return session?.user || null;
}

/*
 * Charge les notifications de l’utilisateur.
 */
async function obtenirNotificationsSupabase(
    options = {}
) {
    const utilisateur =
        await obtenirUtilisateurNotificationsSupabase();

    if (!utilisateur) {
        return [];
    }

    const limiteDemandee = Number(
        options.limite ??
        configurationNotificationsSupabase
            .limiteParDefaut
    );

    const limite = Number.isInteger(
        limiteDemandee
    )
        ? Math.min(
            Math.max(limiteDemandee, 1),
            100
        )
        : configurationNotificationsSupabase
            .limiteParDefaut;

    let requete = supabaseClient
        .from("notifications_utilisateurs")
        .select(`
            id,
            utilisateur_id,
            type,
            titre,
            message,
            lien,
            reference_transaction,
            lue,
            cree_le,
            lue_le
        `)
        .eq(
            "utilisateur_id",
            utilisateur.id
        )
        .order(
            "cree_le",
            {
                ascending: false
            }
        )
        .limit(limite);

    if (options.nonLuesSeulement === true) {
        requete = requete.eq(
            "lue",
            false
        );
    }

    const { data, error } = await requete;

    if (error) {
        throw error;
    }

    return Array.isArray(data)
        ? data
        : [];
}

/*
 * Compte les notifications non lues.
 */
async function compterNotificationsNonLuesSupabase() {
    const utilisateur =
        await obtenirUtilisateurNotificationsSupabase();

    if (!utilisateur) {
        return 0;
    }

    const {
        count,
        error
    } = await supabaseClient
        .from("notifications_utilisateurs")
        .select(
            "id",
            {
                count: "exact",
                head: true
            }
        )
        .eq(
            "utilisateur_id",
            utilisateur.id
        )
        .eq(
            "lue",
            false
        );

    if (error) {
        throw error;
    }

    return Number(count || 0);
}

/*
 * Marque une notification comme lue.
 */
async function marquerNotificationLueSupabase(
    notificationId
) {
    const utilisateur =
        await obtenirUtilisateurNotificationsSupabase();

    if (!utilisateur) {
        throw new Error(
            "Vous devez être connecté."
        );
    }

    const identifiant = String(
        notificationId || ""
    ).trim();

    if (!identifiant) {
        throw new Error(
            "La notification est invalide."
        );
    }

    const { data, error } = await supabaseClient
        .from("notifications_utilisateurs")
        .update({
            lue: true,
            lue_le: new Date().toISOString()
        })
        .eq(
            "id",
            identifiant
        )
        .eq(
            "utilisateur_id",
            utilisateur.id
        )
        .select(`
            id,
            type,
            titre,
            message,
            lien,
            reference_transaction,
            lue,
            cree_le,
            lue_le
        `)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new Error(
            "La notification est introuvable."
        );
    }

    declencherActualisationNotificationsSupabase();

    return data;
}

/*
 * Marque toutes les notifications comme lues.
 */
async function marquerToutesNotificationsLuesSupabase() {
    const utilisateur =
        await obtenirUtilisateurNotificationsSupabase();

    if (!utilisateur) {
        throw new Error(
            "Vous devez être connecté."
        );
    }

    const dateLecture =
        new Date().toISOString();

    const { data, error } = await supabaseClient
        .from("notifications_utilisateurs")
        .update({
            lue: true,
            lue_le: dateLecture
        })
        .eq(
            "utilisateur_id",
            utilisateur.id
        )
        .eq(
            "lue",
            false
        )
        .select("id");

    if (error) {
        throw error;
    }

    declencherActualisationNotificationsSupabase();

    return Array.isArray(data)
        ? data.length
        : 0;
}

/*
 * Replace une notification dans l’état non lu.
 */
async function marquerNotificationNonLueSupabase(
    notificationId
) {
    const utilisateur =
        await obtenirUtilisateurNotificationsSupabase();

    if (!utilisateur) {
        throw new Error(
            "Vous devez être connecté."
        );
    }

    const identifiant = String(
        notificationId || ""
    ).trim();

    if (!identifiant) {
        throw new Error(
            "La notification est invalide."
        );
    }

    const { data, error } = await supabaseClient
        .from("notifications_utilisateurs")
        .update({
            lue: false,
            lue_le: null
        })
        .eq(
            "id",
            identifiant
        )
        .eq(
            "utilisateur_id",
            utilisateur.id
        )
        .select(`
            id,
            type,
            titre,
            message,
            lien,
            reference_transaction,
            lue,
            cree_le,
            lue_le
        `)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new Error(
            "La notification est introuvable."
        );
    }

    declencherActualisationNotificationsSupabase();

    return data;
}

/*
 * Supprime une notification.
 */
async function supprimerNotificationSupabase(
    notificationId
) {
    const utilisateur =
        await obtenirUtilisateurNotificationsSupabase();

    if (!utilisateur) {
        throw new Error(
            "Vous devez être connecté."
        );
    }

    const identifiant = String(
        notificationId || ""
    ).trim();

    if (!identifiant) {
        throw new Error(
            "La notification est invalide."
        );
    }

    const { data, error } = await supabaseClient
        .from("notifications_utilisateurs")
        .delete()
        .eq(
            "id",
            identifiant
        )
        .eq(
            "utilisateur_id",
            utilisateur.id
        )
        .select("id")
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new Error(
            "La notification est introuvable."
        );
    }

    declencherActualisationNotificationsSupabase();

    return true;
}

/*
 * Supprime toutes les notifications déjà lues.
 */
async function supprimerNotificationsLuesSupabase() {
    const utilisateur =
        await obtenirUtilisateurNotificationsSupabase();

    if (!utilisateur) {
        throw new Error(
            "Vous devez être connecté."
        );
    }

    const { data, error } = await supabaseClient
        .from("notifications_utilisateurs")
        .delete()
        .eq(
            "utilisateur_id",
            utilisateur.id
        )
        .eq(
            "lue",
            true
        )
        .select("id");

    if (error) {
        throw error;
    }

    declencherActualisationNotificationsSupabase();

    return Array.isArray(data)
        ? data.length
        : 0;
}

/*
 * Récupère une notification précise.
 */
async function obtenirNotificationSupabase(
    notificationId
) {
    const utilisateur =
        await obtenirUtilisateurNotificationsSupabase();

    if (!utilisateur) {
        return null;
    }

    const identifiant = String(
        notificationId || ""
    ).trim();

    if (!identifiant) {
        return null;
    }

    const { data, error } = await supabaseClient
        .from("notifications_utilisateurs")
        .select(`
            id,
            utilisateur_id,
            type,
            titre,
            message,
            lien,
            reference_transaction,
            lue,
            cree_le,
            lue_le
        `)
        .eq(
            "id",
            identifiant
        )
        .eq(
            "utilisateur_id",
            utilisateur.id
        )
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data || null;
}

/*
 * Déclenche un événement commun après une modification.
 */
function declencherActualisationNotificationsSupabase() {
    document.dispatchEvent(
        new CustomEvent(
            "notificationsSupabaseActualisees"
        )
    );
}

/*
 * Démarre l’actualisation périodique du compteur.
 */
function demarrerActualisationNotificationsSupabase(
    callback,
    intervalle =
        configurationNotificationsSupabase
            .intervalleActualisation
) {
    arreterActualisationNotificationsSupabase();

    const delai = Math.max(
        Number(intervalle) || 60000,
        15000
    );

    const actualiser = async function () {
        try {
            const nombre =
                await compterNotificationsNonLuesSupabase();

            if (
                typeof callback ===
                "function"
            ) {
                callback(nombre);
            }

            document.dispatchEvent(
                new CustomEvent(
                    "compteurNotificationsSupabaseActualise",
                    {
                        detail: {
                            nombre: nombre
                        }
                    }
                )
            );
        } catch (erreur) {
            console.error(
                "Actualisation du compteur des notifications impossible :",
                erreur
            );
        }
    };

    actualiser();

    intervalleNotificationsSupabase =
        window.setInterval(
            actualiser,
            delai
        );

    return actualiser;
}

/*
 * Arrête l’actualisation périodique.
 */
function arreterActualisationNotificationsSupabase() {
    if (
        intervalleNotificationsSupabase !==
        null
    ) {
        window.clearInterval(
            intervalleNotificationsSupabase
        );

        intervalleNotificationsSupabase =
            null;
    }
}

/*
 * Actualise immédiatement le compteur lorsqu’une
 * notification est modifiée.
 */
document.addEventListener(
    "notificationsSupabaseActualisees",
    async function () {
        try {
            const nombre =
                await compterNotificationsNonLuesSupabase();

            document.dispatchEvent(
                new CustomEvent(
                    "compteurNotificationsSupabaseActualise",
                    {
                        detail: {
                            nombre: nombre
                        }
                    }
                )
            );
        } catch (erreur) {
            console.error(
                "Actualisation immédiate des notifications impossible :",
                erreur
            );
        }
    }
);

/*
 * Arrêt du minuteur lorsque la page est quittée.
 */
window.addEventListener(
    "pagehide",
    arreterActualisationNotificationsSupabase
);
