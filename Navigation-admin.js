async function initialiserNavigationAdministrateur() {
    const navigation = document.querySelector(
        "header nav"
    );

    if (
        !navigation ||
        typeof obtenirProfilSupabase !== "function"
    ) {
        return;
    }

    try {
        const profil = await obtenirProfilSupabase();

        const estAdministrateur =
            profil?.role === "administrateur" &&
            profil?.statut === "actif";

        if (!estAdministrateur) {
            return;
        }

        if (
            navigation.querySelector(
                'a[href="./admin.html"]'
            )
        ) {
            return;
        }

        const lienAdministration =
            document.createElement("a");

        lienAdministration.href = "./admin.html";
        lienAdministration.textContent =
            "Administration";

        const lienProfil = navigation.querySelector(
            'a[href="./profil.html"]'
        );

        if (lienProfil) {
            navigation.insertBefore(
                lienAdministration,
                lienProfil
            );
        } else {
            navigation.appendChild(
                lienAdministration
            );
        }

        activerLienAdministration(
            lienAdministration
        );
    } catch (erreur) {
        console.error(
            "Impossible de vérifier le rôle administrateur :",
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

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiserNavigationAdministrateur
    );
} else {
    initialiserNavigationAdministrateur();
}
