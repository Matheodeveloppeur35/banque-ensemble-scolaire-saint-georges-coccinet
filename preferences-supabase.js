const preferencesParDefaut = {
    theme: "systeme",
    couleur_principale: "bleu",
    taille_texte: "normale",
    densite_affichage: "confortable",
    masquer_solde: false,
    masquer_numero_compte: false,
    afficher_operations_recentes: true,
    contraste_renforce: false,
    reduire_animations: false,
    souligner_liens: false,
    confirmation_renforcee: true
};

async function obtenirUtilisateurPreferences() {
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

async function obtenirPreferencesSupabase() {
    const utilisateur =
        await obtenirUtilisateurPreferences();

    if (!utilisateur) {
        return {
            ...preferencesParDefaut
        };
    }

    const { data, error } = await supabaseClient
        .from("preferences_utilisateurs")
        .select(`
            theme,
            couleur_principale,
            taille_texte,
            densite_affichage,
            masquer_solde,
            masquer_numero_compte,
            afficher_operations_recentes,
            contraste_renforce,
            reduire_animations,
            souligner_liens,
            confirmation_renforcee
        `)
        .eq("utilisateur_id", utilisateur.id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        return creerPreferencesSupabase(
            utilisateur.id
        );
    }

    return normaliserPreferencesSupabase(
        data
    );
}

async function creerPreferencesSupabase(
    utilisateurId
) {
    const preferences = {
        utilisateur_id: utilisateurId,
        ...preferencesParDefaut
    };

    const { data, error } = await supabaseClient
        .from("preferences_utilisateurs")
        .upsert(
            preferences,
            {
                onConflict: "utilisateur_id"
            }
        )
        .select(`
            theme,
            couleur_principale,
            taille_texte,
            densite_affichage,
            masquer_solde,
            masquer_numero_compte,
            afficher_operations_recentes,
            contraste_renforce,
            reduire_animations,
            souligner_liens,
            confirmation_renforcee
        `)
        .single();

    if (error) {
        throw error;
    }

    return normaliserPreferencesSupabase(
        data
    );
}

async function enregistrerPreferencesSupabase(
    nouvellesPreferences
) {
    const utilisateur =
        await obtenirUtilisateurPreferences();

    if (!utilisateur) {
        throw new Error(
            "Vous devez être connecté pour enregistrer vos préférences."
        );
    }

    const preferences = normaliserPreferencesSupabase(
        {
            ...preferencesParDefaut,
            ...nouvellesPreferences
        }
    );

    const { data, error } = await supabaseClient
        .from("preferences_utilisateurs")
        .upsert(
            {
                utilisateur_id: utilisateur.id,
                ...preferences
            },
            {
                onConflict: "utilisateur_id"
            }
        )
        .select(`
            theme,
            couleur_principale,
            taille_texte,
            densite_affichage,
            masquer_solde,
            masquer_numero_compte,
            afficher_operations_recentes,
            contraste_renforce,
            reduire_animations,
            souligner_liens,
            confirmation_renforcee
        `)
        .single();

    if (error) {
        throw error;
    }

    const preferencesEnregistrees =
        normaliserPreferencesSupabase(data);

    appliquerPreferencesUtilisateur(
        preferencesEnregistrees
    );

    return preferencesEnregistrees;
}

async function reinitialiserPreferencesSupabase() {
    return enregistrerPreferencesSupabase({
        ...preferencesParDefaut
    });
}

function normaliserPreferencesSupabase(
    preferences
) {
    const themesAutorises = [
        "clair",
        "sombre",
        "systeme"
    ];

    const couleursAutorisees = [
        "bleu",
        "dore",
        "vert",
        "violet",
        "rouge"
    ];

    const taillesAutorisees = [
        "normale",
        "grande"
    ];

    const densitesAutorisees = [
        "confortable",
        "compacte"
    ];

    return {
        theme: themesAutorises.includes(
            preferences?.theme
        )
            ? preferences.theme
            : preferencesParDefaut.theme,

        couleur_principale:
            couleursAutorisees.includes(
                preferences?.couleur_principale
            )
                ? preferences.couleur_principale
                : preferencesParDefaut
                    .couleur_principale,

        taille_texte:
            taillesAutorisees.includes(
                preferences?.taille_texte
            )
                ? preferences.taille_texte
                : preferencesParDefaut
                    .taille_texte,

        densite_affichage:
            densitesAutorisees.includes(
                preferences?.densite_affichage
            )
                ? preferences.densite_affichage
                : preferencesParDefaut
                    .densite_affichage,

        masquer_solde: Boolean(
            preferences?.masquer_solde
        ),

        masquer_numero_compte: Boolean(
            preferences?.masquer_numero_compte
        ),

        afficher_operations_recentes:
            preferences
                ?.afficher_operations_recentes !== false,

        contraste_renforce: Boolean(
            preferences?.contraste_renforce
        ),

        reduire_animations: Boolean(
            preferences?.reduire_animations
        ),

        souligner_liens: Boolean(
            preferences?.souligner_liens
        ),

        confirmation_renforcee:
            preferences
                ?.confirmation_renforcee !== false
    };
}

function appliquerPreferencesUtilisateur(
    preferences
) {
    const valeurs =
        normaliserPreferencesSupabase(
            preferences
        );

    const racine = document.documentElement;
    const corps = document.body;

    racine.dataset.themePreference =
        valeurs.theme;

    racine.dataset.couleurPrincipale =
        valeurs.couleur_principale;

    racine.dataset.tailleTexte =
        valeurs.taille_texte;

    racine.dataset.densiteAffichage =
        valeurs.densite_affichage;

    corps?.classList.toggle(
        "contraste-renforce",
        valeurs.contraste_renforce
    );

    corps?.classList.toggle(
        "reduire-animations",
        valeurs.reduire_animations
    );

    corps?.classList.toggle(
        "souligner-liens",
        valeurs.souligner_liens
    );

    appliquerThemePreference(
        valeurs.theme
    );

    appliquerVisibiliteDonnees(
        valeurs
    );

    appliquerVisibiliteOperations(
        valeurs.afficher_operations_recentes
    );

    window.preferencesUtilisateur =
        valeurs;

    document.dispatchEvent(
        new CustomEvent(
            "preferencesUtilisateurAppliquees",
            {
                detail: valeurs
            }
        )
    );
}

function appliquerThemePreference(theme) {
    let themeFinal = theme;

    if (theme === "systeme") {
        const prefereSombre =
            window.matchMedia &&
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

        themeFinal = prefereSombre
            ? "sombre"
            : "clair";
    }

    document.documentElement.dataset.theme =
        themeFinal;

    document.body?.classList.toggle(
        "theme-sombre",
        themeFinal === "sombre"
    );

    document.body?.classList.toggle(
        "theme-clair",
        themeFinal === "clair"
    );
}

function appliquerVisibiliteDonnees(
    preferences
) {
    document
        .querySelectorAll(
            "[data-valeur-solde]"
        )
        .forEach(function (element) {
            masquerOuAfficherElement(
                element,
                preferences.masquer_solde,
                "•••••• € RP"
            );
        });

    document
        .querySelectorAll(
            "[data-numero-compte]"
        )
        .forEach(function (element) {
            masquerOuAfficherElement(
                element,
                preferences.masquer_numero_compte,
                "SGC-••••••"
            );
        });
}

function masquerOuAfficherElement(
    element,
    masquer,
    remplacement
) {
    if (
        !element.dataset.valeurOriginale
    ) {
        element.dataset.valeurOriginale =
            element.textContent;
    }

    if (masquer) {
        element.textContent = remplacement;
        element.dataset.valeurMasquee =
            "true";

        return;
    }

    if (
        element.dataset.valeurOriginale
    ) {
        element.textContent =
            element.dataset.valeurOriginale;
    }

    element.dataset.valeurMasquee =
        "false";
}

function appliquerVisibiliteOperations(
    afficher
) {
    document
        .querySelectorAll(
            "[data-section-operations-recentes]"
        )
        .forEach(function (section) {
            section.hidden = !afficher;
        });
}

async function chargerEtAppliquerPreferencesSupabase() {
    try {
        const preferences =
            await obtenirPreferencesSupabase();

        appliquerPreferencesUtilisateur(
            preferences
        );

        return preferences;
    } catch (erreur) {
        console.error(
            "Chargement des préférences impossible :",
            erreur
        );

        appliquerPreferencesUtilisateur(
            preferencesParDefaut
        );

        return {
            ...preferencesParDefaut
        };
    }
}

if (
    window.matchMedia
) {
    const mediaThemeSysteme =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

    mediaThemeSysteme.addEventListener?.(
        "change",
        function () {
            if (
                window.preferencesUtilisateur
                    ?.theme === "systeme"
            ) {
                appliquerThemePreference(
                    "systeme"
                );
            }
        }
    );
}
