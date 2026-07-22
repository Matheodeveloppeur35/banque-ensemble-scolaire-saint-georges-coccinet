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
            Aucune transaction n’a encore été enregistrée.
        </em>
    `;

    afficherMessage(texte, "succes");
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
