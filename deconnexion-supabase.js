function initialiserDeconnexionSupabase() {
    const boutonsDeconnexion =
        document.querySelectorAll(
            "[data-deconnexion-supabase]"
        );

    if (boutonsDeconnexion.length === 0) {
        return;
    }

    boutonsDeconnexion.forEach(function (bouton) {
        bouton.addEventListener(
            "click",
            async function () {
                if (bouton.disabled) {
                    return;
                }

                const texteInitial =
                    bouton.textContent.trim();

                bouton.disabled = true;
                bouton.textContent =
                    "Déconnexion…";

                try {
                    if (
                        typeof deconnexionSupabase !==
                        "function"
                    ) {
                        throw new Error(
                            "Le service de déconnexion " +
                            "est indisponible."
                        );
                    }

                    await deconnexionSupabase();

                    /*
                     * Nettoyage des anciennes sessions locales
                     * de démonstration.
                     */
                    localStorage.removeItem(
                        "saintGeorgesSessionDemo"
                    );

                    localStorage.removeItem(
                        "saintGeorgesUtilisateurConnecte"
                    );

                    localStorage.removeItem(
                        "saintGeorgesAdministrateur"
                    );

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
                        texteInitial || "Déconnexion";

                    if (
                        typeof afficherNotification ===
                        "function"
                    ) {
                        afficherNotification(
                            "La déconnexion a échoué. " +
                            "Veuillez réessayer.",
                            "erreur",
                            6000
                        );
                    } else {
                        window.alert(
                            "La déconnexion a échoué."
                        );
                    }
                }
            }
        );
    });
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiserDeconnexionSupabase
    );
} else {
    initialiserDeconnexionSupabase();
}
