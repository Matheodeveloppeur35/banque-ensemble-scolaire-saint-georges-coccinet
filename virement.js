const formulaire = document.querySelector(
    "#formulaire-virement"
);

const affichageSoldeVirement = document.querySelector(
    "#solde-virement"
);

let virementEnPreparation = null;

actualiserSoldeVirement();

formulaire.addEventListener("submit", function (evenement) {
    evenement.preventDefault();

    const destinataire = document
        .querySelector("#destinataire")
        .value
        .trim();

    const montantEuros = Number(
        document.querySelector("#montant").value
    );

    const motif = document
        .querySelector("#motif")
        .value
        .trim();

    const reglementAccepte = document
        .querySelector("#confirmation")
        .checked;

    const montantCentimes = convertirEurosEnCentimes(
        montantEuros
    );

    const erreur = verifierVirement(
        destinataire,
        montantCentimes,
        motif,
        reglementAccepte
    );

    if (erreur) {
        afficherMessage(erreur, "erreur");
        virementEnPreparation = null;
        return;
    }

    virementEnPreparation = {
        destinataire: destinataire,
        montantCentimes: montantCentimes,
        motif: motif
    };

    afficherRecapitulatif(virementEnPreparation);
});

function actualiserSoldeVirement() {
    const donnees = initialiserBanqueDemo();

    if (!affichageSoldeVirement) {
        return;
    }

    affichageSoldeVirement.textContent = formaterEuros(
        donnees.soldeCentimes
    );
}

function verifierVirement(
    destinataire,
    montantCentimes,
    motif,
    reglementAccepte
) {
    const donnees = initialiserBanqueDemo();

    if (destinataire.length < 2) {
        return "Veuillez indiquer un destinataire valide.";
    }

    if (
        !Number.isInteger(montantCentimes) ||
        montantCentimes <= 0
    ) {
        return "Le montant doit être supérieur à 0 € RP.";
    }

    if (montantCentimes > 100000) {
        return (
            "Le plafond est limité à 1 000,00 € RP " +
            "par virement."
        );
    }

    if (montantCentimes > donnees.soldeCentimes) {
        return "Votre solde est insuffisant pour ce virement.";
    }

    if (motif.length < 3) {
        return "Veuillez fournir un motif RP suffisamment précis.";
    }

    if (!reglementAccepte) {
        return "Vous devez confirmer le respect du règlement.";
    }

    const destinataireNormalise = destinataire.toLowerCase();

    if (
        destinataireNormalise ===
            donnees.titulaire.toLowerCase() ||
        destinataireNormalise ===
            donnees.numeroCompte.toLowerCase()
    ) {
        return (
            "Vous ne pouvez pas effectuer un virement " +
            "vers votre propre compte."
        );
    }

    return null;
}

function afficherRecapitulatif(virement) {
    const texte = `
        <strong>Virement vérifié</strong>

        <span>
            Destinataire :
            <b>${securiserTexte(virement.destinataire)}</b>
        </span>

        <span>
            Montant :
            <b>${formaterEuros(virement.montantCentimes)}</b>
        </span>

        <span>
            Motif :
            <b>${securiserTexte(virement.motif)}</b>
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

    const boutonConfirmation = document.querySelector(
        "#confirmer-virement"
    );

    boutonConfirmation.addEventListener("click", function () {
        confirmerVirement();
    });
}

function confirmerVirement() {
    if (!virementEnPreparation) {
        afficherMessage(
            "Aucun virement n’est en attente de confirmation.",
            "erreur"
        );

        return;
    }

    const bouton = document.querySelector(
        "#confirmer-virement"
    );

    if (!bouton || bouton.disabled) {
        return;
    }

    bouton.disabled = true;
    bouton.textContent = "Traitement en cours…";

    window.setTimeout(function () {
        const resultat = enregistrerVirement({
            destinataire:
                virementEnPreparation.destinataire,

            montantCentimes:
                virementEnPreparation.montantCentimes,

            motif:
                virementEnPreparation.motif
        });

        if (!resultat.succes) {
            afficherMessage(
                resultat.message,
                "erreur"
            );

            virementEnPreparation = null;
            return;
        }

        afficherRecuVirement(resultat);
        actualiserSoldeVirement();

        formulaire.reset();
        virementEnPreparation = null;
    }, 700);
}

function afficherRecuVirement(resultat) {
    const transaction = resultat.transaction;

    const date = new Date(
        transaction.date
    ).toLocaleString("fr-FR", {
        dateStyle: "long",
        timeStyle: "short"
    });

    const recu = `
        <strong>Virement RP enregistré avec succès</strong>

        <span>
            Référence :
            <b>${securiserTexte(transaction.id)}</b>
        </span>

        <span>
            Destinataire :
            <b>
                ${securiserTexte(transaction.destinataire)}
            </b>
        </span>

        <span>
            Montant débité :
            <b>
                ${formaterEuros(transaction.montantCentimes)}
            </b>
        </span>

        <span>
            Nouveau solde :
            <b>
                ${formaterEuros(
                    resultat.nouveauSoldeCentimes
                )}
            </b>
        </span>

        <span>
            Motif :
            <b>${securiserTexte(transaction.description)}</b>
        </span>

        <span>
            Date :
            <b>${date}</b>
        </span>

        <em>
            Le virement est enregistré localement.
            Le destinataire n’est pas réellement crédité.
        </em>
    `;

    afficherMessage(recu, "succes-final");
}

function afficherMessage(contenu, type) {
    let message = document.querySelector(
        "#message-virement"
    );

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

    element.textContent =
        texte === null || texte === undefined
            ? ""
            : String(texte);

    return element.innerHTML;
}
