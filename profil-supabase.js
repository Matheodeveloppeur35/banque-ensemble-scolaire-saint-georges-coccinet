async function initialiserProfilSupabase() {
    try {
        const session = await protegerPageSupabase();

        if (!session) {
            return;
        }

        const donnees =
            await obtenirDonneesBancairesSupabase();

        if (!donnees) {
            throw new Error(
                "Le profil bancaire est introuvable."
            );
        }

        afficherProfilSupabase(donnees);
    } catch (erreur) {
        console.error(
            "Chargement du profil impossible :",
            erreur
        );

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                "Impossible de charger votre profil.",
                "erreur",
                6000
            );
        }
    }
}

function afficherProfilSupabase(donnees) {
    const profil = donnees.profil;
    const compte = donnees.compte;

    const nom = String(
        profil.nom_affiche || "Membre"
    );

    const role = formaterRoleProfilSupabase(
        profil.role
    );

    const statut = formaterStatutProfilSupabase(
        compte.statut
    );

    afficherAvatarProfilSupabase(
        profil.avatar_url,
        nom
    );

    definirTexteProfilSupabase(
        "#nom-profil",
        nom
    );

    definirTexteProfilSupabase(
        "#role-profil",
        role
    );

    definirTexteProfilSupabase(
        "#statut-badge-profil",
        `Compte ${statut.toLowerCase()}`
    );

    definirTexteProfilSupabase(
        "#titulaire-detail-profil",
        nom
    );

    definirTexteProfilSupabase(
        "#numero-detail-profil",
        compte.numero_compte || "Non attribué"
    );

    definirTexteProfilSupabase(
        "#role-detail-profil",
        role
    );

    definirTexteProfilSupabase(
        "#type-detail-profil",
        `Compte ${role.toLowerCase()} RP`
    );

    definirTexteProfilSupabase(
        "#statut-detail-profil",
        statut
    );

    definirTexteProfilSupabase(
        "#date-ouverture-profil",
        formaterDateSupabase(
            compte.cree_le
        )
    );

    adapterStatutProfilSupabase(
        compte.statut
    );
}

function afficherAvatarProfilSupabase(
    avatarUrl,
    nom
) {
    const conteneur = document.querySelector(
        "#avatar-profil"
    );

    if (!conteneur) {
        return;
    }

    conteneur.textContent = "";

    if (avatarUrl) {
        const image = document.createElement("img");

        image.src = avatarUrl;
        image.alt = `Avatar de ${nom}`;
        image.referrerPolicy = "no-referrer";

        image.style.width = "100%";
        image.style.height = "100%";
        image.style.objectFit = "cover";
        image.style.borderRadius = "inherit";

        conteneur.appendChild(image);

        return;
    }

    conteneur.textContent =
        creerInitialesProfilSupabase(nom);
}

function adapterStatutProfilSupabase(statut) {
    const badge = document.querySelector(
        "#badge-statut-profil"
    );

    const detail = document.querySelector(
        "#statut-detail-profil"
    );

    const actif = statut === "actif";

    badge?.classList.toggle(
        "badge-compte-inactif",
        !actif
    );

    detail?.classList.toggle(
        "texte-vert",
        actif
    );

    detail?.classList.toggle(
        "texte-rouge",
        !actif
    );
}

function definirTexteProfilSupabase(
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

function formaterRoleProfilSupabase(role) {
    const roles = {
        eleve: "Élève",
        parent: "Parent",
        professeur: "Professeur",
        personnel: "Personnel",
        administrateur: "Administrateur"
    };

    return roles[role] || "Membre";
}

function formaterStatutProfilSupabase(statut) {
    const statuts = {
        actif: "Actif",
        suspendu: "Suspendu",
        ferme: "Fermé"
    };

    return statuts[statut] || "Inconnu";
}

function creerInitialesProfilSupabase(nom) {
    return String(nom || "SG")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(function (partie) {
            return partie
                .charAt(0)
                .toUpperCase();
        })
        .join("") || "SG";
}

initialiserProfilSupabase();
