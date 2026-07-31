document.addEventListener(
    "DOMContentLoaded",
    function () {
        initialiserPagePersonnalisation();
    }
);

let preferencesAvantModification = null;
let personnalisationEnCoursEnregistrement = false;

async function initialiserPagePersonnalisation() {
    const formulaire = document.querySelector(
        "#formulaire-personnalisation"
    );

    if (!formulaire) {
        console.error(
            "Le formulaire de personnalisation est introuvable."
        );

        return;
    }

    desactiverFormulairePersonnalisation(true);

    try {
        const session = await protegerPageSupabase();

        if (!session) {
            return;
        }

        const preferences =
            await obtenirPreferencesSupabase();

        preferencesAvantModification = {
            ...preferences
        };

        remplirFormulairePersonnalisation(
            preferences
        );

        appliquerApercuPersonnalisation();

        activerEvenementsPersonnalisation();

        desactiverFormulairePersonnalisation(false);
    } catch (erreur) {
        console.error(
            "Initialisation de la personnalisation impossible :",
            erreur
        );

        afficherMessagePersonnalisation(
            "Impossible de charger vos préférences.",
            "erreur"
        );

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                "Impossible de charger vos préférences.",
                "erreur",
                6000
            );
        }
    }
}

function activerEvenementsPersonnalisation() {
    const formulaire = document.querySelector(
        "#formulaire-personnalisation"
    );

    const boutonReinitialisation =
        document.querySelector(
            "#reinitialiser-personnalisation"
        );

    if (!formulaire) {
        return;
    }

    formulaire.addEventListener(
        "submit",
        enregistrerFormulairePersonnalisation
    );

    formulaire.addEventListener(
        "input",
        appliquerApercuPersonnalisation
    );

    formulaire.addEventListener(
        "change",
        appliquerApercuPersonnalisation
    );

    boutonReinitialisation?.addEventListener(
        "click",
        demanderReinitialisationPersonnalisation
    );
}

function remplirFormulairePersonnalisation(
    preferences
) {
    const valeurs =
        normaliserPreferencesSupabase(
            preferences
        );

    definirValeurChampPersonnalisation(
        "theme",
        valeurs.theme
    );

    definirValeurChampPersonnalisation(
        "taille_texte",
        valeurs.taille_texte
    );

    definirValeurChampPersonnalisation(
        "densite_affichage",
        valeurs.densite_affichage
    );

    definirBoutonRadioPersonnalisation(
        "couleur_principale",
        valeurs.couleur_principale
    );

    definirCasePersonnalisation(
        "masquer_solde",
        valeurs.masquer_solde
    );

    definirCasePersonnalisation(
        "masquer_numero_compte",
        valeurs.masquer_numero_compte
    );

    definirCasePersonnalisation(
        "afficher_operations_recentes",
        valeurs.afficher_operations_recentes
    );

    definirCasePersonnalisation(
        "contraste_renforce",
        valeurs.contraste_renforce
    );

    definirCasePersonnalisation(
        "reduire_animations",
        valeurs.reduire_animations
    );

    definirCasePersonnalisation(
        "souligner_liens",
        valeurs.souligner_liens
    );

    definirCasePersonnalisation(
        "confirmation_renforcee",
        valeurs.confirmation_renforcee
    );
}

function lireFormulairePersonnalisation() {
    const formulaire = document.querySelector(
        "#formulaire-personnalisation"
    );

    if (!formulaire) {
        return {
            ...preferencesParDefaut
        };
    }

    const donneesFormulaire = new FormData(
        formulaire
    );

    return normaliserPreferencesSupabase({
        theme:
            donneesFormulaire.get("theme"),

        couleur_principale:
            donneesFormulaire.get(
                "couleur_principale"
            ),

        taille_texte:
            donneesFormulaire.get(
                "taille_texte"
            ),

        densite_affichage:
            donneesFormulaire.get(
                "densite_affichage"
            ),

        masquer_solde:
            donneesFormulaire.has(
                "masquer_solde"
            ),

        masquer_numero_compte:
            donneesFormulaire.has(
                "masquer_numero_compte"
            ),

        afficher_operations_recentes:
            donneesFormulaire.has(
                "afficher_operations_recentes"
            ),

        contraste_renforce:
            donneesFormulaire.has(
                "contraste_renforce"
            ),

        reduire_animations:
            donneesFormulaire.has(
                "reduire_animations"
            ),

        souligner_liens:
            donneesFormulaire.has(
                "souligner_liens"
            ),

        confirmation_renforcee:
            donneesFormulaire.has(
                "confirmation_renforcee"
            )
    });
}

function appliquerApercuPersonnalisation() {
    const preferences =
        lireFormulairePersonnalisation();

    appliquerPreferencesUtilisateur(
        preferences
    );

    actualiserChoixCouleursPersonnalisation();

    afficherMessagePersonnalisation(
        "Aperçu appliqué. Enregistrez pour conserver vos choix.",
        "information"
    );
}

async function enregistrerFormulairePersonnalisation(
    evenement
) {
    evenement.preventDefault();

    if (personnalisationEnCoursEnregistrement) {
        return;
    }

    const formulaire = evenement.currentTarget;

    if (!formulaire.checkValidity()) {
        formulaire.reportValidity();

        return;
    }

    personnalisationEnCoursEnregistrement = true;

    const boutonEnregistrement =
        document.querySelector(
            "#enregistrer-personnalisation"
        );

    if (boutonEnregistrement) {
        boutonEnregistrement.disabled = true;

        boutonEnregistrement.textContent =
            "Enregistrement…";
    }

    afficherMessagePersonnalisation(
        "Enregistrement de vos préférences…",
        "information"
    );

    try {
        const preferences =
            lireFormulairePersonnalisation();

        const preferencesEnregistrees =
            await enregistrerPreferencesSupabase(
                preferences
            );

        preferencesAvantModification = {
            ...preferencesEnregistrees
        };

        remplirFormulairePersonnalisation(
            preferencesEnregistrees
        );

        appliquerPreferencesUtilisateur(
            preferencesEnregistrees
        );

        afficherMessagePersonnalisation(
            "Vos préférences ont été enregistrées.",
            "succes"
        );

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                "Vos préférences ont été enregistrées.",
                "succes",
                5000
            );
        }
    } catch (erreur) {
        console.error(
            "Enregistrement des préférences impossible :",
            erreur
        );

        afficherMessagePersonnalisation(
            obtenirMessageErreurPersonnalisation(
                erreur
            ),
            "erreur"
        );

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                obtenirMessageErreurPersonnalisation(
                    erreur
                ),
                "erreur",
                6000
            );
        }
    } finally {
        personnalisationEnCoursEnregistrement = false;

        if (boutonEnregistrement) {
            boutonEnregistrement.disabled = false;

            boutonEnregistrement.textContent =
                "Enregistrer les préférences";
        }
    }
}

async function demanderReinitialisationPersonnalisation() {
    if (personnalisationEnCoursEnregistrement) {
        return;
    }

    const confirmation = window.confirm(
        "Voulez-vous réinitialiser toutes vos préférences ?\n\n" +
        "Le thème, la couleur et les options d’affichage " +
        "retrouveront leurs valeurs par défaut."
    );

    if (!confirmation) {
        return;
    }

    await executerReinitialisationPersonnalisation();
}

async function executerReinitialisationPersonnalisation() {
    const bouton = document.querySelector(
        "#reinitialiser-personnalisation"
    );

    personnalisationEnCoursEnregistrement = true;

    if (bouton) {
        bouton.disabled = true;

        bouton.textContent =
            "Réinitialisation…";
    }

    afficherMessagePersonnalisation(
        "Réinitialisation de vos préférences…",
        "information"
    );

    try {
        const preferences =
            await reinitialiserPreferencesSupabase();

        preferencesAvantModification = {
            ...preferences
        };

        remplirFormulairePersonnalisation(
            preferences
        );

        appliquerPreferencesUtilisateur(
            preferences
        );

        actualiserChoixCouleursPersonnalisation();

        afficherMessagePersonnalisation(
            "Les préférences par défaut ont été restaurées.",
            "succes"
        );

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                "Les préférences ont été réinitialisées.",
                "succes",
                5000
            );
        }
    } catch (erreur) {
        console.error(
            "Réinitialisation des préférences impossible :",
            erreur
        );

        afficherMessagePersonnalisation(
            obtenirMessageErreurPersonnalisation(
                erreur
            ),
            "erreur"
        );
    } finally {
        personnalisationEnCoursEnregistrement = false;

        if (bouton) {
            bouton.disabled = false;

            bouton.textContent =
                "Réinitialiser les préférences";
        }
    }
}

function actualiserChoixCouleursPersonnalisation() {
    const boutonsCouleurs =
        document.querySelectorAll(
            'input[name="couleur_principale"]'
        );

    boutonsCouleurs.forEach(function (champ) {
        const etiquette = champ.closest(
            "label"
        );

        etiquette?.classList.toggle(
            "actif",
            champ.checked
        );
    });
}

function definirValeurChampPersonnalisation(
    nom,
    valeur
) {
    const champ = document.querySelector(
        `[name="${nom}"]`
    );

    if (champ) {
        champ.value = valeur;
    }
}

function definirBoutonRadioPersonnalisation(
    nom,
    valeur
) {
    const champ = document.querySelector(
        `input[name="${nom}"][value="${valeur}"]`
    );

    if (champ) {
        champ.checked = true;
    }
}

function definirCasePersonnalisation(
    nom,
    valeur
) {
    const champ = document.querySelector(
        `input[name="${nom}"]`
    );

    if (champ) {
        champ.checked = Boolean(valeur);
    }
}

function desactiverFormulairePersonnalisation(
    desactiver
) {
    const formulaire = document.querySelector(
        "#formulaire-personnalisation"
    );

    if (!formulaire) {
        return;
    }

    formulaire
        .querySelectorAll(
            "input, select, textarea, button"
        )
        .forEach(function (element) {
            element.disabled = desactiver;
        });
}

function afficherMessagePersonnalisation(
    message,
    type
) {
    const conteneur = document.querySelector(
        "#message-personnalisation"
    );

    if (!conteneur) {
        return;
    }

    conteneur.hidden = false;

    conteneur.className =
        `message-action-admin ${type}`;

    conteneur.textContent = message;
}

function obtenirMessageErreurPersonnalisation(
    erreur
) {
    const message = String(
        erreur?.message || ""
    );

    const messageNormalise =
        message.toLowerCase();

    if (
        messageNormalise.includes(
            "row-level security"
        ) ||
        messageNormalise.includes(
            "permission denied"
        )
    ) {
        return (
            "Vous n’êtes pas autorisé à modifier ces préférences."
        );
    }

    if (
        messageNormalise.includes(
            "vous devez être connecté"
        ) ||
        messageNormalise.includes(
            "jwt"
        )
    ) {
        return (
            "Votre session a expiré. Reconnectez-vous."
        );
    }

    if (
        messageNormalise.includes(
            "check constraint"
        )
    ) {
        return (
            "Une préférence sélectionnée n’est pas autorisée."
        );
    }

    return (
        message ||
        "L’enregistrement des préférences a échoué."
    );
}

/*
 * Si l’utilisateur quitte la page sans enregistrer,
 * on restaure temporairement les préférences précédentes.
 *
 * Les valeurs Supabase ne sont jamais modifiées tant que le bouton
 * d’enregistrement n’a pas été utilisé.
 */
window.addEventListener(
    "pagehide",
    function () {
        if (
            preferencesAvantModification &&
            !personnalisationEnCoursEnregistrement
        ) {
            appliquerPreferencesUtilisateur(
                preferencesAvantModification
            );
        }
    }
);
