function initialiserGestionStatutCompte() {
    const boutonStatut = document.querySelector(
        '[data-action="suspendre-compte"]'
    );

    if (!boutonStatut) {
        return;
    }

    boutonStatut.addEventListener(
        "click",
        ouvrirFenetreStatutCompte
    );
}

async function ouvrirFenetreStatutCompte() {
    fermerFenetreStatutCompte();

    try {
        const comptes =
            await chargerComptesPourStatut();

        if (comptes.length === 0) {
            afficherErreurStatutCompte(
                "Aucun compte bancaire modifiable."
            );

            return;
        }

        creerFenetreStatutCompte(comptes);
    } catch (erreur) {
        console.error(
            "Chargement des comptes impossible :",
            erreur
        );

        afficherErreurStatutCompte(
            "Impossible de charger les comptes."
        );
    }
}

async function chargerComptesPourStatut() {
    const { data: comptes, error: erreurComptes } =
        await supabaseClient
            .from("comptes")
            .select(`
                id,
                utilisateur_id,
                numero_compte,
                statut
            `)
            .neq("statut", "ferme")
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
        return {
            ...compte,

            nom_affiche:
                profilsParId.get(
                    compte.utilisateur_id
                )?.nom_affiche ||
                "Utilisateur inconnu"
        };
    });
}

function creerFenetreStatutCompte(comptes) {
    const arrierePlan =
        document.createElement("div");

    arrierePlan.className =
        "arriere-plan-modal";

    arrierePlan.id =
        "modal-statut-compte";

    const optionsComptes = comptes
        .map(function (compte) {
            const statutLisible =
                formaterStatutAdminCompte(
                    compte.statut
                );

            const texte =
                `${compte.nom_affiche} — ` +
                `${compte.numero_compte} — ` +
                `${statutLisible}`;

            return `
                <option
                    value="${securiserValeurAdminStatut(
                        compte.id
                    )}"
                    data-statut="${securiserValeurAdminStatut(
                        compte.statut
                    )}"
                >
                    ${securiserValeurAdminStatut(
                        texte
                    )}
                </option>
            `;
        })
        .join("");

    arrierePlan.innerHTML = `
        <section
            class="modal-transaction modal-admin-statut"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-statut-compte"
        >
            <button
                class="fermer-modal"
                id="fermer-statut-compte"
                type="button"
                aria-label="Fermer"
            >
                ×
            </button>

            <p class="petit-titre">
                Action administrateur
            </p>

            <h2 id="titre-statut-compte">
                Suspendre ou réactiver un compte
            </h2>

            <p>
                Le statut du profil et du compte bancaire
                sera modifié simultanément.
            </p>

            <form id="formulaire-statut-compte">
                <div class="champ">
                    <label for="compte-statut-admin">
                        Compte bancaire
                    </label>

                    <select
                        id="compte-statut-admin"
                        required
                    >
                        <option value="">
                            Sélectionnez un compte
                        </option>

                        ${optionsComptes}
                    </select>
                </div>

                <div class="champ">
                    <label for="nouveau-statut-admin">
                        Nouveau statut
                    </label>

                    <select
                        id="nouveau-statut-admin"
                        required
                    >
                        <option value="suspendu">
                            Suspendre le compte
                        </option>

                        <option value="actif">
                            Réactiver le compte
                        </option>
                    </select>
                </div>

                <div class="champ">
                    <label for="motif-statut-admin">
                        Motif administratif
                    </label>

                    <textarea
                        id="motif-statut-admin"
                        minlength="3"
                        maxlength="300"
                        rows="4"
                        placeholder="Indiquez la raison de cette décision"
                        required
                    ></textarea>

                    <small>
                        Entre 3 et 300 caractères.
                    </small>
                </div>

                <div
                    class="message-action-admin"
                    id="message-statut-admin"
                    aria-live="polite"
                    hidden
                ></div>

                <div class="actions-modal-admin">
                    <button
                        class="bouton-clair"
                        id="annuler-statut-admin"
                        type="button"
                    >
                        Annuler
                    </button>

                    <button
                        class="bouton"
                        id="confirmer-statut-admin"
                        type="submit"
                    >
                        Confirmer le changement
                    </button>
                </div>
            </form>
        </section>
    `;

    document.body.appendChild(arrierePlan);
    document.body.classList.add("modal-ouverte");

    activerEvenementsStatutCompte(
        arrierePlan
    );

    document
        .querySelector("#compte-statut-admin")
        ?.focus();
}

function activerEvenementsStatutCompte(
    arrierePlan
) {
    const formulaire = document.querySelector(
        "#formulaire-statut-compte"
    );

    const selectionCompte =
        document.querySelector(
            "#compte-statut-admin"
        );

    const selectionStatut =
        document.querySelector(
            "#nouveau-statut-admin"
        );

    document
        .querySelector("#fermer-statut-compte")
        ?.addEventListener(
            "click",
            fermerFenetreStatutCompte
        );

    document
        .querySelector("#annuler-statut-admin")
        ?.addEventListener(
            "click",
            fermerFenetreStatutCompte
        );

    arrierePlan.addEventListener(
        "click",
        function (evenement) {
            if (evenement.target === arrierePlan) {
                fermerFenetreStatutCompte();
            }
        }
    );

    selectionCompte?.addEventListener(
        "change",
        function () {
            const option =
                selectionCompte.selectedOptions[0];

            const statutActuel =
                option?.dataset.statut;

            /*
             * Proposer automatiquement l’action inverse.
             */
            selectionStatut.value =
                statutActuel === "suspendu"
                    ? "actif"
                    : "suspendu";
        }
    );

    formulaire?.addEventListener(
        "submit",
        enregistrerStatutCompte
    );
}

async function enregistrerStatutCompte(
    evenement
) {
    evenement.preventDefault();

    const compteId = document.querySelector(
        "#compte-statut-admin"
    )?.value;

    const nouveauStatut = document.querySelector(
        "#nouveau-statut-admin"
    )?.value;

    const motif = String(
        document.querySelector(
            "#motif-statut-admin"
        )?.value || ""
    ).trim();

    const erreur = verifierStatutCompte(
        compteId,
        nouveauStatut,
        motif
    );

    if (erreur) {
        afficherMessageStatutCompte(
            erreur,
            "erreur"
        );

        return;
    }

    const confirmation = window.confirm(
        nouveauStatut === "suspendu"
            ? "Confirmer la suspension de ce compte ?"
            : "Confirmer la réactivation de ce compte ?"
    );

    if (!confirmation) {
        return;
    }

    const bouton = document.querySelector(
        "#confirmer-statut-admin"
    );

    if (bouton) {
        bouton.disabled = true;
        bouton.textContent =
            "Enregistrement…";
    }

    try {
        const { data, error } =
            await supabaseClient.rpc(
                "admin_modifier_statut_compte",
                {
                    p_compte_id: compteId,
                    p_nouveau_statut:
                        nouveauStatut,
                    p_motif: motif
                }
            );

        if (error) {
            throw error;
        }

        if (!data || data.succes !== true) {
            throw new Error(
                "Le changement de statut n’a pas été confirmé."
            );
        }

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                nouveauStatut === "suspendu"
                    ? "Le compte a été suspendu."
                    : "Le compte a été réactivé.",
                "succes",
                6000
            );
        }

        fermerFenetreStatutCompte();

        window.setTimeout(function () {
            window.location.reload();
        }, 500);
    } catch (erreurRpc) {
        console.error(
            "Modification du statut impossible :",
            erreurRpc
        );

        afficherMessageStatutCompte(
            obtenirMessageErreurStatut(
                erreurRpc
            ),
            "erreur"
        );

        if (bouton) {
            bouton.disabled = false;
            bouton.textContent =
                "Confirmer le changement";
        }
    }
}

function verifierStatutCompte(
    compteId,
    nouveauStatut,
    motif
) {
    if (!compteId) {
        return "Veuillez sélectionner un compte.";
    }

    if (
        nouveauStatut !== "actif" &&
        nouveauStatut !== "suspendu"
    ) {
        return "Le nouveau statut est invalide.";
    }

    if (motif.length < 3) {
        return "Le motif administratif est trop court.";
    }

    if (motif.length > 300) {
        return "Le motif administratif est trop long.";
    }

    return null;
}

function afficherMessageStatutCompte(
    message,
    type
) {
    const conteneur = document.querySelector(
        "#message-statut-admin"
    );

    if (!conteneur) {
        return;
    }

    conteneur.hidden = false;

    conteneur.className =
        `message-action-admin ${type}`;

    conteneur.textContent = message;
}

function afficherErreurStatutCompte(message) {
    if (
        typeof afficherNotification ===
        "function"
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

function obtenirMessageErreurStatut(erreur) {
    const message = String(
        erreur?.message ||
        "La modification du statut a échoué."
    );

    const messagesConnus = [
        "Accès administrateur refusé.",
        "Compte bancaire introuvable.",
        "Profil utilisateur introuvable.",
        "Vous ne pouvez pas suspendre votre propre compte.",
        "Un compte fermé ne peut pas être modifié.",
        "Le compte possède déjà ce statut.",
        "Statut demandé invalide.",
        "Le motif est trop court.",
        "Le motif est trop long."
    ];

    return (
        messagesConnus.find(function (texte) {
            return message.includes(texte);
        }) ||
        "La modification du statut a échoué."
    );
}

function formaterStatutAdminCompte(statut) {
    const statuts = {
        actif: "Actif",
        suspendu: "Suspendu",
        ferme: "Fermé"
    };

    return statuts[statut] || "Inconnu";
}

function fermerFenetreStatutCompte() {
    document
        .querySelector("#modal-statut-compte")
        ?.remove();

    document.body.classList.remove(
        "modal-ouverte"
    );
}

function securiserValeurAdminStatut(valeur) {
    const element = document.createElement("div");

    element.textContent =
        valeur === null ||
        valeur === undefined
            ? ""
            : String(valeur);

    return element.innerHTML;
}

document.addEventListener(
    "keydown",
    function (evenement) {
        if (evenement.key === "Escape") {
            fermerFenetreStatutCompte();
        }
    }
);

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiserGestionStatutCompte
    );
} else {
    initialiserGestionStatutCompte();
}
