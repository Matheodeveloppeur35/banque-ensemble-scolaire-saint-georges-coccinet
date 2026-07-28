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

    const etatBrouillon = document.querySelector(
        "#etat-brouillon-virement"
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

    let minuterieSauvegarde = null;

    restaurerBrouillon();

    formulaire.addEventListener(
        "input",
        programmerSauvegarde
    );

    formulaire.addEventListener(
        "change",
        programmerSauvegarde
    );

    window.supprimerBrouillonVirement =
        supprimerBrouillon;

    function programmerSauvegarde() {
        window.clearTimeout(minuterieSauvegarde);

        afficherEtat(
            "Enregistrement du brouillon…",
            "enregistrement"
        );

        minuterieSauvegarde = window.setTimeout(
            enregistrerBrouillon,
            400
        );
    }

    function enregistrerBrouillon() {
        if (!formulaireContientDesDonnees()) {
            supprimerBrouillon();
            return;
        }

        const dateEnregistrement =
            new Date().toISOString();

        const donneesBrouillon = {
            destinataire: destinataire.value,
            montant: montant.value,
            motif: motif.value,
            confirmation: confirmation.checked,
            dateEnregistrement: dateEnregistrement
        };

        localStorage.setItem(
            cleBrouillonVirement,
            JSON.stringify(donneesBrouillon)
        );

        afficherBrouillonEnregistre(
            dateEnregistrement
        );
    }

    function restaurerBrouillon() {
        const contenu = localStorage.getItem(
            cleBrouillonVirement
        );

        if (!contenu) {
            afficherEtat(
                "Aucun brouillon enregistré",
                "vide"
            );

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

            afficherBrouillonEnregistre(
                brouillon.dateEnregistrement
            );

            if (
                typeof afficherNotification ===
                "function"
            ) {
                afficherNotification(
                    "Votre brouillon de virement a été restauré.",
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
        window.clearTimeout(minuterieSauvegarde);

        localStorage.removeItem(
            cleBrouillonVirement
        );

        afficherEtat(
            "Aucun brouillon enregistré",
            "vide"
        );
    }

    function formulaireContientDesDonnees() {
        return Boolean(
            destinataire.value.trim() ||
            montant.value.trim() ||
            motif.value.trim() ||
            confirmation.checked
        );
    }

    function afficherBrouillonEnregistre(dateTexte) {
        const date = new Date(dateTexte);

        if (Number.isNaN(date.getTime())) {
            afficherEtat(
                "Brouillon enregistré",
                "enregistre"
            );

            return;
        }

        const heure = date.toLocaleTimeString(
            "fr-FR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

        afficherEtat(
            `Brouillon enregistré à ${heure}`,
            "enregistre"
        );
    }

    function afficherEtat(texte, type) {
        if (!etatBrouillon) {
            return;
        }

        etatBrouillon.textContent = texte;
        etatBrouillon.dataset.etat = type;
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
