document.addEventListener(
    "DOMContentLoaded",
    function () {
        initialiserAdministrationSalaire();
    }
);

function initialiserAdministrationSalaire() {
    const boutonSalaire = document.querySelector(
        '[data-action="verser-salaire"]'
    );

    if (!boutonSalaire) {
        console.warn(
            "Le bouton de versement des salaires est introuvable."
        );

        return;
    }

    boutonSalaire.addEventListener(
        "click",
        ouvrirFenetreSalaire
    );

    document.addEventListener(
        "keydown",
        function (evenement) {
            if (
                evenement.key === "Escape" &&
                document.querySelector(
                    "#modal-salaire-admin"
                )
            ) {
                fermerFenetreSalaire();
            }
        }
    );
}

async function ouvrirFenetreSalaire() {
    fermerFenetreSalaire();

    const arrierePlan = document.createElement(
        "div"
    );

    arrierePlan.className =
        "arriere-plan-modal";

    arrierePlan.id =
        "modal-salaire-admin";

    arrierePlan.innerHTML = `
        <section
            class="modal-transaction modal-salaire-admin"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-modal-salaire"
        >
            <button
                class="fermer-modal"
                type="button"
                data-fermer-salaire
                aria-label="Fermer la fenêtre"
            >
                ×
            </button>

            <div
                class="icone-detail-transaction revenu"
                aria-hidden="true"
            >
                +
            </div>

            <p class="petit-titre">
                Administration bancaire
            </p>

            <h2 id="titre-modal-salaire">
                Verser un salaire RP
            </h2>

            <p>
                Le montant sera ajouté au compte sélectionné.
                Aucun autre compte ne sera débité.
            </p>

            <form id="formulaire-salaire-admin">
                <div class="champ">
                    <label for="destinataire-salaire-admin">
                        Compte bénéficiaire
                    </label>

                    <select
                        id="destinataire-salaire-admin"
                        name="utilisateurId"
                        required
                        disabled
                    >
                        <option value="">
                            Chargement des comptes…
                        </option>
                    </select>
                </div>

                <div class="champ">
                    <label for="montant-salaire-admin">
                        Montant du salaire
                    </label>

                    <div class="champ-montant">
                        <input
                            id="montant-salaire-admin"
                            name="montant"
                            type="number"
                            min="0.01"
                            max="100000"
                            step="0.01"
                            inputmode="decimal"
                            placeholder="0,00"
                            required
                        >

                        <span>
                            € RP
                        </span>
                    </div>

                    <small>
                        Montant maximal :
                        100 000,00 € RP
                    </small>
                </div>

                <div
                    class="montants-rapides"
                    aria-label="Montants rapides"
                >
                    <button
                        type="button"
                        data-salaire-rapide="50"
                    >
                        50 €
                    </button>

                    <button
                        type="button"
                        data-salaire-rapide="100"
                    >
                        100 €
                    </button>

                    <button
                        type="button"
                        data-salaire-rapide="250"
                    >
                        250 €
                    </button>

                    <button
                        type="button"
                        data-salaire-rapide="500"
                    >
                        500 €
                    </button>

                    <button
                        type="button"
                        data-salaire-rapide="1000"
                    >
                        1 000 €
                    </button>
                </div>

                <div class="champ">
                    <label for="motif-salaire-admin">
                        Motif du versement
                    </label>

                    <textarea
                        id="motif-salaire-admin"
                        name="motif"
                        rows="4"
                        minlength="3"
                        maxlength="150"
                        placeholder="Exemple : salaire RP du mois de juillet"
                        required
                    ></textarea>

                    <small>
                        Entre 3 et 150 caractères.
                    </small>
                </div>

                <label class="confirmation-reglement">
                    <input
                        id="confirmation-salaire-admin"
                        type="checkbox"
                        required
                    >

                    <span>
                        Je confirme le versement de ce salaire RP
                        sans débit d’un autre compte.
                    </span>
                </label>

                <p
                    class="message-action-admin"
                    id="message-salaire-admin"
                    aria-live="polite"
                    hidden
                ></p>

                <div class="actions-modal-admin">
                    <button
                        class="bouton-clair"
                        type="button"
                        data-fermer-salaire
                    >
                        Annuler
                    </button>

                    <button
                        class="bouton"
                        id="confirmer-salaire-admin"
                        type="submit"
                    >
                        Verser le salaire
                    </button>
                </div>
            </form>
        </section>
    `;

    document.body.appendChild(
        arrierePlan
    );

    document.body.classList.add(
        "modal-ouverte"
    );

    activerFermetureFenetreSalaire(
        arrierePlan
    );

    activerMontantsRapidesSalaire(
        arrierePlan
    );

    const formulaire = arrierePlan.querySelector(
        "#formulaire-salaire-admin"
    );

    formulaire?.addEventListener(
        "submit",
        traiterVersementSalaire
    );

    try {
        await chargerComptesPourSalaire();
    } catch (erreur) {
        console.error(
            "Chargement des comptes impossible :",
            erreur
        );

        afficherMessageSalaire(
            "Impossible de charger les comptes bancaires.",
            "erreur"
        );
    }
}

async function chargerComptesPourSalaire() {
    const selecteur = document.querySelector(
        "#destinataire-salaire-admin"
    );

    if (!selecteur) {
        return;
    }

    const [profils, comptes] =
        await Promise.all([
            chargerProfilsSalaire(),
            chargerComptesSalaire()
        ]);

    const profilsParId = new Map(
        profils.map(function (profil) {
            return [
                profil.id,
                profil
            ];
        })
    );

    const comptesActifs = comptes
        .filter(function (compte) {
            return (
                String(compte.statut).toLowerCase() ===
                "actif"
            );
        })
        .map(function (compte) {
            const profil = profilsParId.get(
                compte.utilisateur_id
            );

            return {
                utilisateurId:
                    compte.utilisateur_id,

                numeroCompte:
                    compte.numero_compte ||
                    "Compte sans numéro",

                nom:
                    profil?.nom_affiche ||
                    "Utilisateur inconnu",

                role: formaterRoleSalaire(
                    profil?.role
                )
            };
        })
        .sort(function (compteA, compteB) {
            return compteA.nom.localeCompare(
                compteB.nom,
                "fr",
                {
                    sensitivity: "base"
                }
            );
        });

    if (comptesActifs.length === 0) {
        selecteur.innerHTML = `
            <option value="">
                Aucun compte actif disponible
            </option>
        `;

        selecteur.disabled = true;

        return;
    }

    selecteur.innerHTML = `
        <option value="">
            Sélectionnez un bénéficiaire
        </option>

        ${comptesActifs
            .map(function (compte) {
                return `
                    <option
                        value="${securiserTexteSalaire(
                            compte.utilisateurId
                        )}"
                    >
                        ${securiserTexteSalaire(
                            compte.nom
                        )}
                        —
                        ${securiserTexteSalaire(
                            compte.numeroCompte
                        )}
                        (${securiserTexteSalaire(
                            compte.role
                        )})
                    </option>
                `;
            })
            .join("")}
    `;

    selecteur.disabled = false;
    selecteur.focus();
}

async function chargerProfilsSalaire() {
    const { data, error } = await supabaseClient
        .from("profils")
        .select(`
            id,
            nom_affiche,
            role
        `);

    if (error) {
        throw error;
    }

    return Array.isArray(data)
        ? data
        : [];
}

async function chargerComptesSalaire() {
    const { data, error } = await supabaseClient
        .from("comptes")
        .select(`
            utilisateur_id,
            numero_compte,
            statut
        `);

    if (error) {
        throw error;
    }

    return Array.isArray(data)
        ? data
        : [];
}

async function traiterVersementSalaire(
    evenement
) {
    evenement.preventDefault();

    const formulaire =
        evenement.currentTarget;

    if (!formulaire.checkValidity()) {
        formulaire.reportValidity();

        return;
    }

    const selecteur = formulaire.querySelector(
        "#destinataire-salaire-admin"
    );

    const champMontant = formulaire.querySelector(
        "#montant-salaire-admin"
    );

    const champMotif = formulaire.querySelector(
        "#motif-salaire-admin"
    );

    const confirmation = formulaire.querySelector(
        "#confirmation-salaire-admin"
    );

    const boutonConfirmation =
        formulaire.querySelector(
            "#confirmer-salaire-admin"
        );

    const utilisateurId = String(
        selecteur?.value || ""
    ).trim();

    const montantTexte = String(
        champMontant?.value || ""
    )
        .trim()
        .replace(",", ".");

    const montantEuros = Number(
        montantTexte
    );

    const montantCentimes = Math.round(
        montantEuros * 100
    );

    const motif = String(
        champMotif?.value || ""
    ).trim();

    const erreur = verifierInformationsSalaire({
        utilisateurId: utilisateurId,
        montantEuros: montantEuros,
        montantCentimes: montantCentimes,
        motif: motif,
        confirmation:
            Boolean(confirmation?.checked)
    });

    if (erreur) {
        afficherMessageSalaire(
            erreur,
            "erreur"
        );

        return;
    }

    const optionSelectionnee =
        selecteur.options[
            selecteur.selectedIndex
        ];

    const beneficiaire = String(
        optionSelectionnee?.textContent ||
        "le compte sélectionné"
    )
        .replace(/\s+/g, " ")
        .trim();

    const confirmationFinale =
        window.confirm(
            "Confirmer le versement de " +
            formaterMontantSalaire(
                montantCentimes
            ) +
            " à " +
            beneficiaire +
            " ?\n\n" +
            "Aucun autre compte ne sera débité."
        );

    if (!confirmationFinale) {
        return;
    }

    if (boutonConfirmation) {
        boutonConfirmation.disabled = true;

        boutonConfirmation.textContent =
            "Versement en cours…";
    }

    afficherMessageSalaire(
        "Enregistrement du salaire en cours…",
        "information"
    );

    try {
        const resultat =
            await verserSalaireSupabase({
                utilisateurId: utilisateurId,
                montantCentimes:
                    montantCentimes,
                motif: motif
            });

        afficherMessageSalaire(
            "Le salaire a été versé avec succès.",
            "succes"
        );

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                "Salaire de " +
                formaterMontantSalaire(
                    montantCentimes
                ) +
                " versé avec succès.",
                "succes",
                6000
            );
        }

        formulaire.reset();

        window.setTimeout(
            async function () {
                fermerFenetreSalaire();

                await actualiserAdministrationApresSalaire();
            },
            900
        );

        return resultat;
    } catch (erreurVersement) {
        console.error(
            "Versement du salaire impossible :",
            erreurVersement
        );

        const message =
            obtenirMessageErreurSalaire(
                erreurVersement
            );

        afficherMessageSalaire(
            message,
            "erreur"
        );

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                message,
                "erreur",
                6000
            );
        }

        if (boutonConfirmation) {
            boutonConfirmation.disabled = false;

            boutonConfirmation.textContent =
                "Verser le salaire";
        }
    }
}

function verifierInformationsSalaire(
    options
) {
    if (!options.utilisateurId) {
        return (
            "Sélectionnez un compte bénéficiaire."
        );
    }

    if (
        !Number.isFinite(
            options.montantEuros
        ) ||
        !Number.isInteger(
            options.montantCentimes
        ) ||
        options.montantCentimes <= 0
    ) {
        return (
            "Le montant du salaire est invalide."
        );
    }

    if (
        options.montantCentimes >
        10000000
    ) {
        return (
            "Le salaire ne peut pas dépasser " +
            "100 000,00 € RP."
        );
    }

    if (options.motif.length < 3) {
        return (
            "Le motif du salaire est trop court."
        );
    }

    if (options.motif.length > 150) {
        return (
            "Le motif du salaire ne peut pas " +
            "dépasser 150 caractères."
        );
    }

    if (!options.confirmation) {
        return (
            "Vous devez confirmer le versement."
        );
    }

    return null;
}

async function verserSalaireSupabase(
    options
) {
    const { data, error } =
        await supabaseClient.rpc(
            "admin_verser_salaire",
            {
                p_utilisateur_id:
                    options.utilisateurId,

                p_montant_centimes:
                    options.montantCentimes,

                p_motif:
                    options.motif
            }
        );

    if (error) {
        throw error;
    }

    if (
        !data ||
        data.succes !== true
    ) {
        throw new Error(
            "Le versement n’a pas été confirmé."
        );
    }

    return data;
}

async function actualiserAdministrationApresSalaire() {
    if (
        typeof initialiserAdministrationSupabase !==
        "function"
    ) {
        window.location.reload();

        return;
    }

    try {
        await initialiserAdministrationSupabase();
    } catch (erreur) {
        console.error(
            "Actualisation de l’administration impossible :",
            erreur
        );

        window.location.reload();
    }
}

function activerMontantsRapidesSalaire(
    conteneur
) {
    const champMontant = conteneur.querySelector(
        "#montant-salaire-admin"
    );

    const boutons = conteneur.querySelectorAll(
        "[data-salaire-rapide]"
    );

    if (!champMontant) {
        return;
    }

    boutons.forEach(function (bouton) {
        bouton.addEventListener(
            "click",
            function () {
                const montant = Number(
                    bouton.dataset.salaireRapide
                );

                if (
                    !Number.isFinite(montant) ||
                    montant <= 0
                ) {
                    return;
                }

                champMontant.value =
                    montant.toFixed(2);

                boutons.forEach(
                    function (autreBouton) {
                        autreBouton.classList.remove(
                            "actif"
                        );
                    }
                );

                bouton.classList.add(
                    "actif"
                );

                champMontant.focus();
            }
        );
    });

    champMontant.addEventListener(
        "input",
        function () {
            const montantActuel = Number(
                champMontant.value
            );

            boutons.forEach(function (bouton) {
                bouton.classList.toggle(
                    "actif",
                    montantActuel === Number(
                        bouton.dataset.salaireRapide
                    )
                );
            });
        }
    );
}

function activerFermetureFenetreSalaire(
    arrierePlan
) {
    arrierePlan
        .querySelectorAll(
            "[data-fermer-salaire]"
        )
        .forEach(function (bouton) {
            bouton.addEventListener(
                "click",
                fermerFenetreSalaire
            );
        });

    arrierePlan.addEventListener(
        "click",
        function (evenement) {
            if (
                evenement.target ===
                arrierePlan
            ) {
                fermerFenetreSalaire();
            }
        }
    );
}

function fermerFenetreSalaire() {
    const fenetre = document.querySelector(
        "#modal-salaire-admin"
    );

    if (fenetre) {
        fenetre.remove();
    }

    document.body.classList.remove(
        "modal-ouverte"
    );
}

function afficherMessageSalaire(
    message,
    type
) {
    const conteneur = document.querySelector(
        "#message-salaire-admin"
    );

    if (!conteneur) {
        return;
    }

    conteneur.hidden = false;

    conteneur.className =
        `message-action-admin ${type}`;

    conteneur.textContent = message;
}

function formaterRoleSalaire(role) {
    const roles = {
        eleve: "Élève",
        parent: "Parent",
        professeur: "Professeur",
        personnel: "Personnel",
        administrateur: "Administrateur"
    };

    return roles[role] || "Membre";
}

function formaterMontantSalaire(
    montantCentimes
) {
    const montant = Number(
        montantCentimes || 0
    ) / 100;

    return montant.toLocaleString(
        "fr-FR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + " € RP";
}

function obtenirMessageErreurSalaire(
    erreur
) {
    const message = String(
        erreur?.message || ""
    );

    const messageNormalise =
        message.toLowerCase();

    if (
        messageNormalise.includes(
            "réservée aux administrateurs"
        )
    ) {
        return (
            "Cette action est réservée aux administrateurs."
        );
    }

    if (
        messageNormalise.includes(
            "destinataire est introuvable"
        )
    ) {
        return (
            "Le compte sélectionné est introuvable."
        );
    }

    if (
        messageNormalise.includes(
            "pas actif"
        )
    ) {
        return (
            "Le compte sélectionné n’est pas actif."
        );
    }

    if (
        messageNormalise.includes(
            "100 000"
        )
    ) {
        return (
            "Le salaire dépasse le montant maximal autorisé."
        );
    }

    if (
        messageNormalise.includes(
            "vous devez être connecté"
        )
    ) {
        return (
            "Votre session a expiré. Reconnectez-vous."
        );
    }

    return (
        message ||
        "Le versement du salaire a échoué."
    );
}

function securiserTexteSalaire(valeur) {
    const element = document.createElement(
        "div"
    );

    element.textContent =
        valeur === null ||
        valeur === undefined
            ? ""
            : String(valeur);

    return element.innerHTML;
}
