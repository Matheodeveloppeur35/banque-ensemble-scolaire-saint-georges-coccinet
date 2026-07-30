async function initialiserParametresSupabase() {
    try {
        const session = await protegerPageSupabase();

        if (!session) {
            return;
        }

        const donnees =
            await obtenirDonneesBancairesSupabase();

        afficherInformationsSessionParametres(
            session,
            donnees
        );

        activerDeconnexionParametresSupabase();
    } catch (erreur) {
        console.error(
            "Chargement des paramètres impossible :",
            erreur
        );

        if (
            typeof afficherNotification === "function"
        ) {
            afficherNotification(
                "Impossible de charger les paramètres.",
                "erreur",
                6000
            );
        }
    }
}

function afficherInformationsSessionParametres(
    session,
    donnees
) {
    const profil = donnees?.profil;
    const compte = donnees?.compte;
    const utilisateur = session?.user;

    definirTexteParametres(
        "#parametre-nom-discord",
        profil?.nom_affiche || "Non disponible"
    );

    definirTexteParametres(
        "#parametre-role",
        formaterRoleParametres(
            profil?.role
        )
    );

    definirTexteParametres(
        "#parametre-numero-compte",
        compte?.numero_compte || "Non attribué"
    );

    definirTexteParametres(
        "#parametre-email",
        utilisateur?.email || "Non communiqué"
    );

    definirTexteParametres(
        "#parametre-derniere-connexion",
        formaterDateConnexionParametres(
            utilisateur?.last_sign_in_at
        )
    );
}

function activerDeconnexionParametresSupabase() {
    const bouton = document.querySelector(
        "#bouton-deconnexion-parametres"
    );

    if (!bouton) {
        return;
    }

    bouton.addEventListener(
        "click",
        async function () {
            bouton.disabled = true;
            bouton.textContent = "Déconnexion…";

            try {
                await deconnexionSupabase();

                window.location.replace(
                    "./connexion.html"
                );
            } catch (erreur) {
                console.error(
                    "Déconnexion impossible :",
                    erreur
                );

                bouton.disabled = false;
                bouton.textContent =
                    "Se déconnecter";

                if (
                    typeof afficherNotification ===
                    "function"
                ) {
                    afficherNotification(
                        "La déconnexion a échoué.",
                        "erreur",
                        5000
                    );
                }
            }
        }
    );
}

function definirTexteParametres(
    selecteur,
    valeur
) {
    const element = document.querySelector(
        selecteur
    );

    if (element) {
        element.textContent = valeur;
    }
}

function formaterRoleParametres(role) {
    const roles = {
        eleve: "Élève",
        parent: "Parent",
        professeur: "Professeur",
        personnel: "Personnel",
        administrateur: "Administrateur"
    };

    return roles[role] || "Membre";
}

function formaterDateConnexionParametres(
    dateTexte
) {
    const date = new Date(dateTexte);

    if (Number.isNaN(date.getTime())) {
        return "Date inconnue";
    }

    return date.toLocaleString("fr-FR", {
        dateStyle: "long",
        timeStyle: "short"
    });
}

initialiserParametresSupabase();
