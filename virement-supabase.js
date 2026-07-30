let virementSupabaseEnPreparation = null;

function initialiserVirementSupabase() {
    const formulaire = document.querySelector(
        "#formulaire-virement"
    );

    if (!formulaire) {
        return;
    }

    actualiserSoldeVirementSupabase();

    formulaire.addEventListener(
        "submit",
        verifierFormulaireVirementSupabase
    );
}

async function actualiserSoldeVirementSupabase() {
    const affichage = document.querySelector(
        "#solde-virement"
    );

    if (!affichage) {
        return;
    }

    try {
        const compte =
            await obtenirCompteSupabase();

        if (!compte) {
            throw new Error(
                "Compte bancaire introuvable."
            );
        }

        affichage.textContent =
            formaterEurosSupabase(
                compte.solde_centimes
            );
    } catch (erreur) {
        console.error(
            "Chargement du solde impossible :",
            erreur
        );

        affichage.textContent =
            "Solde indisponible";
    }
}

function verifierFormulaireVirementSupabase(
    evenement
) {
    evenement.preventDefault();

    const destinataire = String(
        document.querySelector(
            "#destinataire"
        )?.value || ""
    ).trim();

    const montantEuros = Number(
        document.querySelector(
            "#montant"
        )?.value
    );

    const motif = String(
        document.querySelector(
            "#motif"
        )?.value || ""
    ).trim();

    const confirmation = Boolean(
        document.querySelector(
            "#confirmation"
        )?.checked
    );

    const montantCentimes = Math.round(
        montantEuros * 100
    );

    const erreur = verifierDonneesVirementSupabase(
        destinataire,
        montantCentimes,
        motif,
        confirmation
    );

    if (erreur) {
        afficherErreurVirementSupabase(erreur);
        return;
    }

    virementSupabaseEnPreparation = {
        destinataire: destinataire,
        montantCentimes: montantCentimes,
        motif: motif
    };

    afficherRecapitulatifVirementSupabase(
        virementSupabaseEnPreparation
    );
}

function verifierDonneesVirementSupabase(
    destinataire,
    montantCentimes,
    motif,
    confirmation
) {
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
            "Le plafond est limité à 1 000,00 € RP."
        );
    }

    if (motif.length < 3) {
        return (
            "Le motif doit contenir au moins 3 caractères."
        );
    }

    if (motif.length > 150) {
        return (
            "Le motif ne peut pas dépasser 150 caractères."
        );
    }

    if (!confirmation) {
        return (
            "Vous devez confirmer le respect du règlement."
        );
    }

    return null;
}

function afficherRecapitulatifVirementSupabase(
    virement
) {
    const contenu = `
        <strong>
            Vérifiez votre virement
        </strong>

        <span>
            Destinataire :
            <b>
                ${securiserTexteVirementSupabase(
                    virement.destinataire
                )}
            </b>
        </span>

        <span>
            Montant :
            <b>
                ${formaterEurosSupabase(
                    virement.montantCentimes
                )}
            </b>
        </span>

        <span>
            Motif :
            <b>
                ${securiserTexteVirementSupabase(
                    virement.motif
                )}
            </b>
        </span>

        <em>
            Le compte destinataire sera réellement crédité
            dans la banque RP.
        </em>

        <button
            id="confirmer-virement-supabase"
            class="bouton confirmer-virement"
            type="button"
        >
            Confirmer le virement
        </button>
    `;

    afficherMessageVirementSupabase(
        contenu,
        "succes"
    );

    document
        .querySelector(
            "#confirmer-virement-supabase"
        )
        ?.addEventListener(
            "click",
            confirmerVirementSupabase
        );
}

async function confirmerVirementSupabase() {
    if (!virementSupabaseEnPreparation) {
        afficherErreurVirementSupabase(
            "Aucun virement n’est en attente."
        );

        return;
    }

    const bouton = document.querySelector(
        "#confirmer-virement-supabase"
    );

    if (!bouton || bouton.disabled) {
        return;
    }

    bouton.disabled = true;
    bouton.textContent = "Traitement sécurisé…";

    try {
        const { data, error } =
            await supabaseClient.rpc(
                "effectuer_virement",
                {
                    p_destinataire:
                        virementSupabaseEnPreparation
                            .destinataire,

                    p_montant_centimes:
                        virementSupabaseEnPreparation
                            .montantCentimes,

                    p_motif:
                        virementSupabaseEnPreparation
                            .motif
                }
            );

        if (error) {
            throw error;
        }

        if (!data || data.succes !== true) {
            throw new Error(
                "Le virement n’a pas été confirmé."
            );
        }

        afficherRecuVirementSupabase(data);
        await actualiserSoldeVirementSupabase();

        nettoyerFormulaireVirementSupabase();

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                "Le virement a été effectué avec succès.",
                "succes",
                6000
            );
        }
    } catch (erreur) {
        console.error(
            "Virement Supabase impossible :",
            erreur
        );

        afficherErreurVirementSupabase(
            obtenirMessageErreurVirementSupabase(
                erreur
            )
        );

        bouton.disabled = false;
        bouton.textContent =
            "Confirmer le virement";
    }
}

function afficherRecuVirementSupabase(data) {
    const contenu = `
        <strong>
            Virement RP effectué avec succès
        </strong>

        <span>
            Référence :
            <b>
                ${securiserTexteVirementSupabase(
                    data.reference
                )}
            </b>
        </span>

        <span>
            Destinataire :
            <b>
                ${securiserTexteVirementSupabase(
                    data.destinataire
                )}
            </b>
        </span>

        <span>
            Compte destinataire :
            <b>
                ${securiserTexteVirementSupabase(
                    data.numero_destinataire
                )}
            </b>
        </span>

        <span>
            Montant :
            <b>
                ${formaterEurosSupabase(
                    data.montant_centimes
                )}
            </b>
        </span>

        <span>
            Nouveau solde :
            <b>
                ${formaterEurosSupabase(
                    data.nouveau_solde_centimes
                )}
            </b>
        </span>

        <em>
            Le débit, le crédit et les deux historiques
            ont été enregistrés dans Supabase.
        </em>
    `;

    afficherMessageVirementSupabase(
        contenu,
        "succes-final"
    );
}

function nettoyerFormulaireVirementSupabase() {
    document
        .querySelector("#formulaire-virement")
        ?.reset();

    document
        .querySelectorAll(
            "[data-montant-rapide]"
        )
        .forEach(function (bouton) {
            bouton.classList.remove("actif");
        });

    if (
        typeof window.supprimerBrouillonVirement ===
        "function"
    ) {
        window.supprimerBrouillonVirement();
    }

    if (
        typeof window.autoriserSortieVirement ===
        "function"
    ) {
        window.autoriserSortieVirement();
    }

    virementSupabaseEnPreparation = null;
}

function afficherErreurVirementSupabase(message) {
    afficherMessageVirementSupabase(
        securiserTexteVirementSupabase(message),
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

function afficherMessageVirementSupabase(
    contenu,
    type
) {
    const formulaire = document.querySelector(
        "#formulaire-virement"
    );

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

function obtenirMessageErreurVirementSupabase(
    erreur
) {
    const message = String(
        erreur?.message ||
        "Le virement a échoué."
    );

    const messagesConnus = [
        "Utilisateur non connecté.",
        "Le montant doit être supérieur à zéro.",
        "Le plafond est limité à 1 000,00 € RP.",
        "Le motif est trop court.",
        "Le motif est trop long.",
        "Le destinataire est invalide.",
        "Compte expéditeur introuvable.",
        "Votre compte bancaire n’est pas actif.",
        "Destinataire introuvable.",
        "Vous ne pouvez pas effectuer un virement vers votre propre compte.",
        "Le compte destinataire n’est pas actif.",
        "Votre solde est insuffisant."
    ];

    return (
        messagesConnus.find(function (texte) {
            return message.includes(texte);
        }) ||
        "Le virement n’a pas pu être effectué."
    );
}

function securiserTexteVirementSupabase(valeur) {
    const element = document.createElement("div");

    element.textContent =
        valeur === null ||
        valeur === undefined
            ? ""
            : String(valeur);

    return element.innerHTML;
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiserVirementSupabase
    );
} else {
    initialiserVirementSupabase();
}
