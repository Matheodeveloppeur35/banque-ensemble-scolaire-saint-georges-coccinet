function initialiserEffacementVirement() {
    const formulaire = document.querySelector(
        "#formulaire-virement"
    );

    const boutonEffacer = document.querySelector(
        "#effacer-virement"
    );

    if (!formulaire || !boutonEffacer) {
        return;
    }

    boutonEffacer.addEventListener(
        "click",
        function () {
            const formulaireRempli =
                formulaireContientDesInformations();

            if (formulaireRempli) {
                const confirmation = window.confirm(
                    "Voulez-vous vraiment effacer toutes " +
                    "les informations du virement ?"
                );

                if (!confirmation) {
                    return;
                }
            }
if (
    typeof window.supprimerBrouillonVirement ===
    "function"
) {
    window.supprimerBrouillonVirement();
}

            formulaire.reset();

            const messageVirement = document.querySelector(
                "#message-virement"
            );

            if (messageVirement) {
                messageVirement.remove();
            }

            document
                .querySelectorAll(
                    "[data-montant-rapide]"
                )
                .forEach(function (bouton) {
                    bouton.classList.remove("actif");
                });

            const compteurMotif = document.querySelector(
                "#compteur-motif"
            );

            if (compteurMotif) {
                compteurMotif.textContent =
                    "0 / 150 caractères";

                compteurMotif.classList.remove(
                    "proche-limite",
                    "limite-atteinte"
                );
            }

            if (
                typeof window.autoriserSortieVirement ===
                "function"
            ) {
                window.autoriserSortieVirement();
            }

            const destinataire = document.querySelector(
                "#destinataire"
            );

            if (destinataire) {
                destinataire.focus();
            }

            if (
                typeof afficherNotification ===
                "function"
            ) {
                afficherNotification(
                    "Le formulaire de virement a été effacé.",
                    "information",
                    4000
                );
            }
        }
    );

    function formulaireContientDesInformations() {
        const destinataire = document.querySelector(
            "#destinataire"
        );

        const montant = document.querySelector(
            "#montant"
        );

        const motif = document.querySelector(
            "#motif"
        );

        const confirmation = document.querySelector(
            "#confirmation"
        );

        return Boolean(
            destinataire?.value.trim() ||
            montant?.value.trim() ||
            motif?.value.trim() ||
            confirmation?.checked
        );
    }
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiserEffacementVirement
    );
} else {
    initialiserEffacementVirement();
}
