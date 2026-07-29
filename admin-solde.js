let comptesAdministrationDisponibles = [];

function initialiserModificationSolde() {
    const boutonModifierSolde = document.querySelector(
        '[data-action="modifier-solde"]'
    );

    if (!boutonModifierSolde) {
        return;
    }

    boutonModifierSolde.addEventListener(
        "click",
        ouvrirFenetreModificationSolde
    );
}

async function ouvrirFenetreModificationSolde() {
    fermerFenetreModificationSolde();

    try {
        comptesAdministrationDisponibles =
            await chargerComptesPourModification();

        if (
            comptesAdministrationDisponibles.length === 0
        ) {
            afficherErreurModificationSolde(
                "Aucun compte bancaire n’est disponible."
            );

            return;
        }

        creerFenetreModificationSolde(
            comptesAdministrationDisponibles
        );
    } catch (erreur) {
        console.error(
            "Chargement des comptes impossible :",
            erreur
        );

        afficherErreurModificationSolde(
            "Impossible de charger les comptes bancaires."
        );
    }
}

async function chargerComptesPourModification() {
    const { data: comptes, error: erreurComptes } =
        await supabaseClient
            .from("comptes")
            .select(`
                id,
                utilisateur_id,
                numero_compte,
                solde_centimes,
                statut
            `)
            .order("numero_compte", {
                ascending: true
            });

    if (erreurComptes) {
        throw erreurComptes;
    }

    const { data: profils, error: erreurProfils } =
        await supabaseClient
            .from("profils")
            .select(`
                id,
                nom_affiche
            `);

    if (erreurProfils) {
        throw erreurProfils;
    }

    const profilsParId = new Map(
        (profils || []).map(function (profil) {
            return [profil.id, profil];
        })
    );

    return (comptes || []).map(function (compte) {
        const profil = profilsParId.get(
            compte.utilisateur_id
        );

        return {
            ...compte,
            nom_affiche:
                profil?.nom_affiche ||
                "Utilisateur inconnu"
        };
    });
}

function creerFenetreModificationSolde(comptes) {
    const arrierePlan = document.createElement("div");

    arrierePlan.className = "arriere-plan-modal";
    arrierePlan.id = "modal-modification-solde";

    const optionsComptes = comptes
        .map(function (compte) {
            const texteOption =
                `${compte.nom_affiche} — ` +
                `${compte.numero_compte} — ` +
                `${formaterEurosSupabase(
                    compte.solde_centimes
                )}`;

            return `
                <option value="${securiserValeurAdminSolde(
                    compte.id
                )}">
                    ${securiserValeurAdminSolde(
                        texteOption
                    )}
                </option>
            `;
        })
        .join("");

    arrierePlan.innerHTML = `
        <section
            class="modal-transaction modal-admin-solde"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-modification-solde"
        >
            <button
                class="fermer-modal"
                id="fermer-modification-solde"
                type="button"
                aria-label="Fermer"
            >
                ×
            </button>

            <p class="petit-titre">
                Action administrateur
            </p>

            <h2 id="titre-modification-solde">
                Modifier un solde
            </h2>

            <p>
                Toute modification sera enregistrée dans
                l’historique du compte concerné.
            </p>

            <form id="formulaire-modification-solde">
                <div class="champ">
                    <label for="compte-modification-solde">
                        Compte bancaire
                    </label>

                    <select
                        id="compte-modification-solde"
                        name="compte"
                        required
                    >
                        <option value="">
                            Sélectionnez un compte
                        </option>

                        ${optionsComptes}
                    </select>
                </div>

                <div class="champ">
                    <label for="type-modification-solde">
                        Type d’opération
                    </label>

                    <select
                        id="type-modification-solde"
                        name="type"
                        required
                    >
                        <option value="credit">
                            Créditer le compte
                        </option>

                        <option value="debit">
                            Débiter le compte
                        </option>
                    </select>
                </div>

                <div class="champ">
                    <label for="montant-modification-solde">
                        Montant
                    </label>

                    <div class="champ-montant">
                        <input
                            id="montant-modification-solde"
                            name="montant"
                            type="number"
                            min="0.01"
                            max="1000000"
                            step="0.01"
                            placeholder="0,00"
                            required
                        >

                        <span>€ RP</span>
                    </div>
                </div>

                <div class="champ">
                    <label for="motif-modification-solde">
                        Motif administratif
                    </label>

                    <textarea
                        id="motif-modification-solde"
                        name="motif"
                        minlength="3"
                        maxlength="300"
                        rows="4"
                        placeholder="Indiquez la raison de la modification"
                        required
                    ></textarea>
                </div>

                <div
                    class="message-action-admin"
                    id="message-modification-solde"
                    aria-live="polite"
                    hidden
                ></div>

                <div class="actions-modal-admin">
                    <button
                        class="bouton-clair"
                        id="annuler-modification-solde"
                        type="button"
                    >
                        Annuler
                    </button>

                    <button
                        class="bouton"
                        id="confirmer-modification-solde"
                        type="submit"
                    >
                        Confirmer la modification
                    </button>
                </div>
            </form>
        </section>
    `;

    document.body.appendChild(arrierePlan);
    document.body.classList.add("modal-ouverte");

    activerEvenementsModificationSolde(
        arrierePlan
    );

    document
        .querySelector("#compte-modification-solde")
        ?.focus();
}

function activerEvenementsModificationSolde(
    arrierePlan
) {
    const formulaire = document.querySelector(
        "#formulaire-modification-solde"
    );

    document
        .querySelector("#fermer-modification-solde")
        ?.addEventListener(
            "click",
            fermerFenetreModificationSolde
        );

    document
        .querySelector("#annuler-modification-solde")
        ?.addEventListener(
            "click",
            fermerFenetreModificationSolde
        );

    arrierePlan.addEventListener(
        "click",
        function (evenement) {
            if (evenement.target === arrierePlan) {
                fermerFenetreModificationSolde();
            }
        }
    );

    formulaire?.addEventListener(
        "submit",
        enregistrerModificationSolde
    );
}

async function enregistrerModificationSolde(
    evenement
) {
    evenement.preventDefault();

    const compteId = document.querySelector(
        "#compte-modification-solde"
    )?.value;

    const typeOperation = document.querySelector(
        "#type-modification-solde"
    )?.value;

    const montantEuros = Number(
        document.querySelector(
            "#montant-modification-solde"
        )?.value
    );

    const motif = String(
        document.querySelector(
            "#motif-modification-solde"
        )?.value || ""
    ).trim();

    const montantCentimes = Math.round(
        montantEuros * 100
    );

    const erreur = verifierModificationSolde(
        compteId,
        typeOperation,
        montantCentimes,
        motif
    );

    if (erreur) {
        afficherMessageModificationSolde(
            erreur,
            "erreur"
        );

        return;
    }

    const bouton = document.querySelector(
        "#confirmer-modification-solde"
    );

    if (bouton) {
        bouton.disabled = true;
        bouton.textContent = "Enregistrement…";
    }

    try {
        const { data, error } =
            await supabaseClient.rpc(
                "admin_modifier_solde",
                {
                    p_compte_id: compteId,
                    p_type_operation: typeOperation,
                    p_montant_centimes:
                        montantCentimes,
                    p_motif: motif
                }
            );

        if (error) {
            throw error;
        }

        if (!data?.succes) {
            throw new Error(
                "La modification n’a pas été confirmée."
            );
        }

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                "Le solde a été modifié. " +
                "Nouveau solde : " +
                formaterEurosSupabase(
                    data.nouveau_solde_centimes
                ),
                "succes",
                6000
            );
        }

        fermerFenetreModificationSolde();

        window.setTimeout(function () {
            window.location.reload();
        }, 500);
    } catch (erreurRpc) {
        console.error(
            "Modification du solde impossible :",
            erreurRpc
        );

        afficherMessageModificationSolde(
            obtenirMessageErreurSolde(
                erreurRpc
            ),
            "erreur"
        );

        if (bouton) {
            bouton.disabled = false;
            bouton.textContent =
                "Confirmer la modification";
        }
    }
}

function verifierModificationSolde(
    compteId,
    typeOperation,
    montantCentimes,
    motif
) {
    if (!compteId) {
        return "Veuillez sélectionner un compte.";
    }

    if (
        typeOperation !== "credit" &&
        typeOperation !== "debit"
    ) {
        return "Le type d’opération est invalide.";
    }

    if (
        !Number.isInteger(montantCentimes) ||
        montantCentimes <= 0
    ) {
        return "Le montant est invalide.";
    }

    if (motif.length < 3) {
        return "Le motif administratif est trop court.";
    }

    if (motif.length > 300) {
        return "Le motif administratif est trop long.";
    }

    return null;
}

function afficherMessageModificationSolde(
    message,
    type
) {
    const conteneur = document.querySelector(
        "#message-modification-solde"
    );

    if (!conteneur) {
        return;
    }

    conteneur.hidden = false;
    conteneur.className =
        `message-action-admin ${type}`;

    conteneur.textContent = message;
}

function afficherErreurModificationSolde(message) {
    if (
        typeof afficherNotification === "function"
    ) {
        afficherNotification(
            message,
            "erreur",
            6000
        );
    } else {
        window.alert(message);
    }
}

function obtenirMessageErreurSolde(erreur) {
    const message = String(
        erreur?.message ||
        "La modification du solde a échoué."
    );

    const messagesConnus = [
        "Accès administrateur refusé.",
        "Compte bancaire introuvable.",
        "Le compte bancaire est fermé.",
        "Solde insuffisant pour ce débit.",
        "Le montant doit être supérieur à zéro.",
        "Le montant dépasse la limite autorisée.",
        "Le motif est trop court.",
        "Le motif est trop long."
    ];

    const messageConnu = messagesConnus.find(
        function (texte) {
            return message.includes(texte);
        }
    );

    return (
        messageConnu ||
        "La modification du solde a échoué."
    );
}

function fermerFenetreModificationSolde() {
    const fenetre = document.querySelector(
        "#modal-modification-solde"
    );

    if (fenetre) {
        fenetre.remove();
    }

    document.body.classList.remove(
        "modal-ouverte"
    );
}

function securiserValeurAdminSolde(valeur) {
    const element = document.createElement("div");

    element.textContent =
        valeur === null || valeur === undefined
            ? ""
            : String(valeur);

    return element.innerHTML;
}

document.addEventListener(
    "keydown",
    function (evenement) {
        if (evenement.key === "Escape") {
            fermerFenetreModificationSolde();
        }
    }
);

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiserModificationSolde
    );
} else {
    initialiserModificationSolde();
}
