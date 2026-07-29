async function protegerPageAdministration() {
    try {
        if (
            typeof protegerPageSupabase !== "function" ||
            typeof obtenirProfilSupabase !== "function"
        ) {
            throw new Error(
                "Les services Supabase sont indisponibles."
            );
        }

        const session = await protegerPageSupabase();

        if (!session) {
            return null;
        }

        const profil = await obtenirProfilSupabase();

        const administrateurAutorise =
            profil &&
            profil.role === "administrateur" &&
            profil.statut === "actif";

        if (!administrateurAutorise) {
            if (
                typeof afficherNotification === "function"
            ) {
                afficherNotification(
                    "Cette page est réservée aux administrateurs.",
                    "erreur",
                    5000
                );
            }

            window.setTimeout(function () {
                window.location.replace(
                    "./dashboard.html"
                );
            }, 500);

            return null;
        }

        document.documentElement.classList.add(
            "administration-autorisee"
        );

        return {
            session: session,
            profil: profil
        };
    } catch (erreur) {
        console.error(
            "Protection de l’administration impossible :",
            erreur
        );

        window.location.replace(
            "./connexion.html"
        );

        return null;
    }
}
