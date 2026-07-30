async function initialiserNavigationAdministrateur() {
    const navigation = document.querySelector(
        "header nav"
    );

    if (!navigation) {
        console.error(
            "Navigation principale introuvable."
        );

        return;
    }

    try {
        if (
            typeof obtenirProfilSupabase !==
            "function"
        ) {
            throw new Error(
                "obtenirProfilSupabase() est indisponible."
            );
        }

        const profil =
            await obtenirProfilSupabase();

        console.log(
            "Profil utilisé par la navigation :",
            profil
        );

        const administrateur =
            profil?.role === "administrateur" &&
            profil?.statut === "actif";

        const ancienLien =
            navigation.querySelector(
                'a[href="./admin.html"]'
            );

        if (!administrateur) {
            if (ancienLien) {
                ancienLien.remove();
            }

            return;
        }

        if (ancienLien) {
            activerLienAdministration(
                ancienLien
            );

            return;
        }

        const lienAdministration =
            document.createElement("a");

        lienAdministration.href =
            "./admin.html";

        lienAdministration.textContent =
            "Administration";

        lienAdministration.className =
            "lien-administration";

        const lienProfil =
            navigation.querySelector(
                'a[href="./profil.html"]'
            );

        if (lienProfil) {
            navigation.insertBefore(
                lienAdministration,
                lienProfil
            );
        } else {
            const boutonTheme =
                navigation.querySelector(
                    "[data-changer-theme]"
                );

            if (boutonTheme) {
                navigation.insertBefore(
                    lienAdministration,
                    boutonTheme
                );
            } else {
                navigation.appendChild(
                    lienAdministration
                );
            }
        }

        activerLienAdministration(
            lienAdministration
        );
    } catch (erreur) {
        console.error(
            "Ajout du lien Administration impossible :",
            erreur
        );
    }
}

function activerLienAdministration(lien) {
    const pageActuelle =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    if (pageActuelle === "admin.html") {
        lien.classList.add("actif");

        lien.setAttribute(
            "aria-current",
            "page"
        );
    }
}

function demarrerNavigationAdministrateur() {
    initialiserNavigationAdministrateur();

    /*
     * Une seconde vérification permet de gérer le retour
     * de la connexion OAuth Discord.
     */
    window.setTimeout(
        initialiserNavigationAdministrateur,
        1000
    );
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        demarrerNavigationAdministrateur
    );
} else {
    demarrerNavigationAdministrateur();
}
