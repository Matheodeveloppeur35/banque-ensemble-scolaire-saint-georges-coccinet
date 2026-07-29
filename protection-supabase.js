async function protegerPageSupabase() {
    const pageConnexion = "./connexion.html";

    try {
        if (
            typeof obtenirSessionSupabase !==
            "function"
        ) {
            throw new Error(
                "Le service d’authentification est indisponible."
            );
        }

        const session =
            await obtenirSessionSupabase();

        if (!session || !session.user) {
            window.location.replace(
                pageConnexion
            );

            return null;
        }

        return session;
    } catch (erreur) {
        console.error(
            "Vérification de la session impossible :",
            erreur
        );

        window.location.replace(
            pageConnexion
        );

        return null;
    }
}
