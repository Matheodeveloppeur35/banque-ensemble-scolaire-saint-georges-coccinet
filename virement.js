const formulaire = document.querySelector(
    "#formulaire-virement"
);

const affichageSoldeVirement = document.querySelector(
    "#solde-virement"
);

let virementEnPreparation = null;

if (formulaire && affichageSoldeVirement) {
    actualiserSoldeVirement();

    formulaire.addEventListener(
        "submit",
        function (evenement) {
            evenement.preventDefault();

            const champDestinataire = document.querySelector(
                "#destinataire"
            );

            const champMontant = document.querySelector(
                "#montant"
            );

            const champMotif = document.querySelector(
                "#motif"
            );

            const champConfirmation = document.querySelector(
                "#confirmation"
            );

            if (
                !champDestinataire ||
                !champMontant ||
                !champMotif ||
                !champConfirmation
            ) {
                afficherErreurVirement(
                    "Le formulaire de virement est incomplet."
                );

                return;
            }

            const destinataire =
                champDestinataire.value.trim();

            const montantEuros = Number(
                champMontant.value
            );

            const motif =
                champMotif.value.trim();

            const reglementAccepte =
                champConfirmation.checked;

            const montantCentimes =
                convertirEurosEnCentimes(
                    montantEuros
                );

            const erreur = verifierVirement(
                destinataire,
                montantCentimes,
                motif,
                reglementAccepte
            );

            if (erreur) {
                afficherErreurVirement(erreur);
                virementEnPreparation = null;
                return;
            }

            virementEnPreparation = {
                destinataire: destinataire,
                montantCentimes: montantCentimes,
                motif: motif
            };

            afficherRecapitulatif(
                virementEnPreparation
            );
        }
    );
}

function actualiserSoldeVirement() {
    if (!affichageSoldeVirement) {
        return;
    }

    if (
        typeof initialiserBanqueDemo !== "function" ||
        typeof formaterEuros !== "function"
    ) {
        affichageSoldeVirement.textContent =
            "Solde indisponible";

        console.error(
            "Les fonctions de banque.js sont indisponibles."
        );

        return;
    }

    const donnees = initialiserBanqueDemo();

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

    if (donnees.statut !== "Actif") {
        return (
            "Votre compte bancaire RP n’est pas actif."
        );
    }

    if (destinataire.length < 2) {
        return (
            "Veuillez indiquer un destinataire valide."
        );
    }

    if (
        !Number.isInteger(montantCentimes) ||
        montantCentimes <= 0
    ) {
        return (
            "Le montant doit être supérieur à 0 € RP."
        );
    }

    if (montantCentimes > 100000) {
        return (
            "Le plafond est limité à 1 000,00 € RP " +
            "par virement."
        );
    }

    if (montantCentimes > donnees.soldeCentimes) {
        return (
            "Votre solde est insuffisant pour ce virement."
        );
    }

    if (motif.length < 3) {
        return (
            "Veuillez fournir un motif RP suffisamment précis."
        );
    }

    if (motif.length > 150) {
        return (
            "Le motif ne peut pas dépasser 150 caractères."
        );
    }

    if (!reglementAccepte) {
        return (
            "Vous devez confirmer le respect du règlement."
        );
    }

    const destinataireNormalise =
        normaliserTexteVirement(destinataire);

    const titulaireNormalise =
        normaliserTexteVirement(
            donnees.titulaire
        );

    const numeroCompteNormalise =
        normaliserTexteVirement(
            donnees.numeroCompte
        );

    if (
        destinataireNormalise === titulaireNormalise ||
        destinataireNormalise === numeroCompteNormalise
    ) {
        return (
            "Vous ne pouvez pas effectuer un virement " +
            "vers votre propre compte."
        );
    }

    return null;
}

function afficherRecapitulatif(virement) {
    const contenu = `
        <strong>Virement vérifié</strong>

        <span>
            Destinataire :
            <b>
                ${securiserTexteVirement(
                    virement.destinataire
                )}
            </b>
        </span>

        <span>
            Montant :
            <b>
                ${formaterEuros(
                    virement.montantCentimes
                )}
            </b>
        </span>

        <span>
            Motif :
            <b>
                ${securiserTexteVirement(
                    virement.motif
                )}
            </b>
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

    afficherMessageVirement(
        contenu,
        "succes"
    );

    const boutonConfirmation = document.querySelector(
        "#confirmer-virement"
    );

    if (boutonConfirmation) {
        boutonConfirmation.addEventListener(
            "click",
            confirmerVirement
        );
    }
}

function confirmerVirement() {
    if (!virementEnPreparation) {
        afficherErreurVirement(
            "Aucun virement n’est en attente de confirmation."
        );

        return;
    }

    const boutonConfirmation = document.querySelector(
        "#confirmer-virement"
    );

    if (
        !boutonConfirmation ||
        boutonConfirmation.disabled
    ) {
        return;
    }

    boutonConfirmation.disabled = true;
    boutonConfirmation.textContent =
        "Traitement en cours…";

    window.setTimeout(
        function () {
            if (
                typeof enregistrerVirement !==
                "function"
            ) {
                afficherErreurVirement(
                    "Le service de virement est indisponible."
                );

                boutonConfirmation.disabled = false;
                boutonConfirmation.textContent =
                    "Confirmer le virement";

                return;
            }

            const resultat = enregistrerVirement({
                destinataire:
                    virementEnPreparation.destinataire,

                montantCentimes:
                    virementEnPreparation.montantCentimes,

                motif:
                    virementEnPreparation.motif
            });

            if (!resultat.succes) {
                afficherErreurVirement(
                    resultat.message ||
                    "Le virement n’a pas pu être enregistré."
                );

                virementEnPreparation = null;
                return;
            }

            afficherRecuVirement(resultat);
            actualiserSoldeVirement();

            /*
             * Le virement est terminé. La protection contre la
             * fermeture d’un formulaire commencé peut être retirée.
             */
            if (
                typeof window.autoriserSortieVirement ===
                "function"
            ) {
                window.autoriserSortieVirement();
            }

            formulaire.reset();
            virementEnPreparation = null;
        },
        700
    );
}

function afficherRecuVirement(resultat) {
    const transaction = resultat.transaction;

    if (
        typeof afficherNotification === "function"
    ) {
        afficherNotification(
            "Virement de " +
            formaterEuros(
                transaction.montantCentimes
            ) +
            " envoyé à " +
            transaction.destinataire +
            ". Nouveau solde : " +
            formaterEuros(
                resultat.nouveauSoldeCentimes
            ) +
            ".",
            "succes",
            6000
        );
    }

    const dateTransaction = new Date(
        transaction.date
    );

    const dateFormatee = Number.isNaN(
        dateTransaction.getTime()
    )
        ? "Date inconnue"
        : dateTransaction.toLocaleString(
            "fr-FR",
            {
                dateStyle: "long",
                timeStyle: "short"
            }
        );

    const contenu = `
        <strong>
            Virement RP enregistré avec succès
        </strong>

        <span>
            Référence :
            <b>
                ${securiserTexteVirement(
                    transaction.id
                )}
            </b>
        </span>

        <span>
            Destinataire :
            <b>
                ${securiserTexteVirement(
                    transaction.destinataire
                )}
            </b>
        </span>

        <span>
            Montant débité :
            <b>
                ${formaterEuros(
                    transaction.montantCentimes
                )}
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
            <b>
                ${securiserTexteVirement(
                    transaction.description
                )}
            </b>
        </span>

        <span>
            Date :
            <b>${dateFormatee}</b>
        </span>

        <em>
            Le virement est enregistré localement.
            Le destinataire n’est pas réellement crédité.
        </em>
    `;

    afficherMessageVirement(
        contenu,
        "succes-final"
    );
}

function afficherErreurVirement(message) {
    afficherMessageVirement(
        securiserTexteVirement(message),
        "erreur"
    );

    if (
        typeof afficherNotification === "function"
    ) {
        afficherNotification(
            message,
            "erreur",
            6000
        );
    }
}

function afficherMessageVirement(contenu, type) {
    if (!formulaire) {
        return;
    }

    let message = document.querySelector(
        "#message-virement"
    );

    if (!message) {
        message = document.createElement("div");
        message.id = "message-virement";
        formulaire.appendChild(message);
    }

    message.className =
        `message-virement ${type}`;

    message.innerHTML = contenu;

    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function normaliserTexteVirement(texte) {
    return String(texte || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function securiserTexteVirement(texte) {
    const element = document.createElement("div");

    element.textContent =
        texte === null || texte === undefined
            ? ""
            : String(texte);

    return element.innerHTML;
}
