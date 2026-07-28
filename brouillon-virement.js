const cleBrouillonVirement =
    "saintGeorgesBrouillonVirement";

function initialiserBrouillonVirement() {
    const formulaire = document.querySelector(
        "#formulaire-virement"
    );

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

    if (
        !formulaire ||
        !destinataire ||
        !montant ||
        !motif ||
        !confirmation
    ) {
        return;
    }

    restaurerBrouillon();

    formulaire.addEventListener(
        "input",
        enregistrerBrouillon
    );

    formulaire.addEventListener(
        "change",
        enregistrerBrouillon
    );

    /*
     * Cette fonction pourra être utilisée par virement.js
     * et effacer-virement.js.
     */
    window.supprimerBrouillonVirement =
        supprimerBrouillon;

    function enregistrerBrouillon() {
        const donneesBrouillon = {
            destinataire: destinataire.value,
            montant: montant.value,
            motif: motif.value,
            confirmation: confirmation.checked,
            dateEnregistrement:
                new Date().toISOString()
        };

        localStorage.setItem(
            cleBrouillonVirement,
            JSON.stringify(donneesBrouillon)
        );
    }

    function restaurerBrouillon() {
        const contenu = localStorage.getItem(
            cleBrouillonVirement
        );

        if (!contenu) {
            return;
        }

        try {
            const brouillon = JSON.parse(contenu);

            destinataire.value = String(
                brouillon.destinataire || ""
            );

            montant.value = String(
                brouillon.montant || ""
            );

            motif.value = String(
                brouillon.motif || ""
            );

            confirmation.checked =
                brouillon.confirmation === true;

            montant.dispatchEvent(
                new Event("input", {
                    bubbles: true
                })
            );

            motif.dispatchEvent(
                new Event("input", {
                    bubbles: true
                })
            );

            if (
                typeof afficherNotification ===
                "function"
            ) {
                afficherNotification(
                    "Votre brouillon de virement " +
                    "a été restauré.",
                    "information",
                    4000
                );
            }
        } catch (erreur) {
            supprimerBrouillon();

            console.error(
                "Brouillon de virement invalide :",
                erreur
            );
        }
    }

    function supprimerBrouillon() {
        localStorage.removeItem(
            cleBrouillonVirement
        );
    }
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiserBrouillonVirement
    );
} else {
    initialiserBrouillonVirement();
}
