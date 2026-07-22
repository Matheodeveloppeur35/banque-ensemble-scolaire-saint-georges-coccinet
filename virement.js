const formulaire = document.querySelector("#formulaire-virement");

formulaire.addEventListener("submit", function (evenement) {
    evenement.preventDefault();

    const destinataire = document
        .querySelector("#destinataire")
        .value
        .trim();

    const montant = Number(
        document.querySelector("#montant").value
    );

    const motif = document
        .querySelector("#motif")
        .value
        .trim();

    const confirmation = document
        .querySelector("#confirmation")
        .checked;

    if (destinataire.length < 2) {
        afficherMessage(
            "Veuillez indiquer un destinataire valide.",
            "erreur"
        );

        return;
    }

    if (!Number.isFinite(montant) || montant <= 0) {
        afficherMessage(
            "Le montant doit être supérieur à 0 € RP.",
            "erreur"
        );

        return;
    }

    if (montant > 1000) {
        afficherMessage(
            "Le plafond est limité à 1 000,00 € RP par virement.",
            "erreur"
        );

        return;
    }

    if (montant > 1245.50) {
        afficherMessage(
            "Votre solde est insuffisant pour ce virement.",
            "erreur"
        );

        return;
    }

    if (motif.length < 3) {
        afficherMessage(
            "Veuillez fournir un motif RP suffisamment précis.",
            "erreur"
        );

        return;
    }

    if (!confirmation) {
        afficherMessage(
            "Vous devez confirmer le respect du règlement.",
            "erreur"
        );

        return;
    }

    const montantFormate = montant.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const texte = `
        <strong>Virement vérifié</strong>

        <span>
            Destinataire :
            <b>${securiserTexte(destinataire)}</b>
        </span>

        <span>
            Montant :
            <b>${montantFormate} € RP</b>
        </span>

        <span>
            Motif :
            <b>${securiserTexte(motif)}</b>
        </span>

            <em>
            Vérifiez les informations avant de confirmer.
        </em>

        <button
            id="confirmer-virement"
            class="bouton confirmer-virement"
            type="button"
        >
            Confirmer le virement
        </button>

    `;

    afficherMessage(texte, "succes");
});
    const boutonConfirmation = document.querySelector(
        "#confirmer-virement"
    );

    boutonConfirmation.addEventListener("click", function () {
        simulerVirement(destinataire, montant, motif);
    });


function afficherMessage(contenu, type) {
    let message = document.querySelector("#message-virement");

    if (!message) {
        message = document.createElement("div");
        message.id = "message-virement";
        formulaire.appendChild(message);
    }

    message.className = `message-virement ${type}`;
    message.innerHTML = contenu;
    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function securiserTexte(texte) {
    const element = document.createElement("div");
    element.textContent = texte;
    return element.innerHTML;
}
function simulerVirement(destinataire, montant, motif) {
    const bouton = document.querySelector("#confirmer-virement");

    bouton.disabled = true;
    bouton.textContent = "Traitement en cours…";

    window.setTimeout(function () {
        const identifiant = creerIdentifiantTransaction();

        const date = new Date().toLocaleString("fr-FR", {
            dateStyle: "long",
            timeStyle: "short"
        });

        const montantFormate = montant.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const recu = `
            <strong>Virement RP simulé avec succès</strong>

            <span>
                Référence :
                <b>${identifiant}</b>
            </span>

            <span>
                Destinataire :
                <b>${securiserTexte(destinataire)}</b>
            </span>

            <span>
                Montant :
                <b>${montantFormate} € RP</b>
            </span>

            <span>
                Motif :
                <b>${securiserTexte(motif)}</b>
            </span>

            <span>
                Date :
                <b>${date}</b>
            </span>

            <em>
                Démonstration uniquement : aucun solde n’a été modifié.
            </em>
        `;

        afficherMessage(recu, "succes-final");

        formulaire.reset();
    }, 800);
}

function creerIdentifiantTransaction() {
    const nombre = Math.floor(100000 + Math.random() * 900000);

    return `SGC-DEMO-${nombre}`;
}
