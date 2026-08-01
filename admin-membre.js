function initialiserRechercheMembreAdmin() {
    const boutonRecherche = document.querySelector(
        '[data-action="rechercher"]'
    );

    const boutonVoirMembre = document.querySelector(
        '[data-action="voir-membre"]'
    );

    const champRecherche = document.querySelector(
        "#recherche-admin"
    );

    /*
     * Bouton de recherche.
     */
    if (
        boutonRecherche &&
        champRecherche &&
        boutonRecherche.dataset.rechercheInitialisee !==
            "true"
    ) {
        boutonRecherche.dataset.rechercheInitialisee =
            "true";

        boutonRecherche.addEventListener(
            "click",
            function () {
                champRecherche.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                champRecherche.focus();
                champRecherche.select();
            }
        );
    }

    /*
     * Bouton « Consulter un membre ».
     */
    if (
        boutonVoirMembre &&
        boutonVoirMembre.dataset.membreInitialise !==
            "true"
    ) {
        boutonVoirMembre.dataset.membreInitialise =
            "true";

        boutonVoirMembre.addEventListener(
            "click",
            ouvrirSelectionMembreAdmin
        );
    }

    /*
     * Un clic sur une ligne du tableau ouvre directement
     * la fiche bancaire correspondante.
     */
    if (
        document.body.dataset
            .lignesMembresInitialisees !== "true"
    ) {
        document.body.dataset
            .lignesMembresInitialisees = "true";

        document.addEventListener(
            "click",
            function (evenement) {
                /*
                 * Ne pas ouvrir la fiche si le clic provient
                 * d’un bouton, d’un lien ou d’un champ.
                 */
                if (
                    evenement.target.closest(
                        "button, a, input, select, textarea"
                    )
                ) {
                    return;
                }

                const ligne = evenement.target.closest(
                    "[data-ligne-compte]"
                );

                if (!ligne) {
                    return;
                }

                const compteId =
                    ligne.dataset.compteId;

                if (compteId) {
                    ouvrirFicheMembreAdmin(
                        compteId
                    );
                }
            }
        );
    }
}

async function ouvrirSelectionMembreAdmin() {
    fermerSelectionMembreAdmin();

    try {
        const comptes =
            await chargerMembresPourSelectionAdmin();

        if (comptes.length === 0) {
            afficherErreurMembreAdmin(
                "Aucun membre n’est disponible."
            );

            return;
        }

        creerSelectionMembreAdmin(
            comptes
        );
    } catch (erreur) {
        console.error(
            "Chargement des membres impossible :",
            erreur
        );

        afficherErreurMembreAdmin(
            "Impossible de charger la liste des membres."
        );
    }
}

async function chargerMembresPourSelectionAdmin() {
    if (
        typeof supabaseClient ===
        "undefined"
    ) {
        throw new Error(
            "Le service Supabase est indisponible."
        );
    }

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
            .order(
                "numero_compte",
                {
                    ascending: true
                }
            );

    if (erreurComptes) {
        throw erreurComptes;
    }

    const { data: profils, error: erreurProfils } =
        await supabaseClient
            .from("profils")
            .select(`
                id,
                nom_affiche,
                role
            `)
            .order(
                "nom_affiche",
                {
                    ascending: true
                }
            );

    if (erreurProfils) {
        throw erreurProfils;
    }

    const profilsParId = new Map(
        (profils || []).map(
            function (profil) {
                return [
                    profil.id,
                    profil
                ];
            }
        )
    );

    return (comptes || [])
        .map(function (compte) {
            const profil =
                profilsParId.get(
                    compte.utilisateur_id
                );

            return {
                id: compte.id,

                numeroCompte:
                    compte.numero_compte ||
                    "Compte sans numéro",

                nom:
                    profil?.nom_affiche ||
                    "Utilisateur inconnu",

                role:
                    profil?.role ||
                    "eleve",

                statut:
                    compte.statut ||
                    "inconnu",

                soldeCentimes:
                    Number(
                        compte.solde_centimes ||
                        0
                    )
            };
        })
        .sort(function (membreA, membreB) {
            return membreA.nom.localeCompare(
                membreB.nom,
                "fr",
                {
                    sensitivity: "base"
                }
            );
        });
}

function creerSelectionMembreAdmin(
    comptes
) {
    const arrierePlan =
        document.createElement("div");

    arrierePlan.className =
        "arriere-plan-modal";

    arrierePlan.id =
        "modal-selection-membre-admin";

    const options = comptes
        .map(function (compte) {
            const texte = [
                compte.nom,
                compte.numeroCompte,
                formaterRoleFicheAdmin(
                    compte.role
                ),
                formaterStatutFicheAdmin(
                    compte.statut
                )
            ].join(" — ");

            return `
                <option
                    value="${securiserValeurFicheAdmin(
                        compte.id
                    )}"
                >
                    ${securiserValeurFicheAdmin(
                        texte
                    )}
                </option>
            `;
        })
        .join("");

    arrierePlan.innerHTML = `
        <section
            class="
                modal-transaction
                modal-selection-membre-admin
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-selection-membre-admin"
        >
            <button
                class="fermer-modal"
                id="fermer-selection-membre-admin"
                type="button"
                aria-label="Fermer"
            >
                ×
            </button>

            <p class="petit-titre">
                Consultation administrative
            </p>

            <h2 id="titre-selection-membre-admin">
                Consulter un membre
            </h2>

            <p>
                Sélectionnez un membre pour afficher
                son profil, son compte et ses dernières
                transactions.
            </p>

            <form id="formulaire-selection-membre-admin">
                <div class="champ">
                    <label for="compte-selection-membre-admin">
                        Membre
                    </label>

                    <select
                        id="compte-selection-membre-admin"
                        required
                    >
                        <option value="">
                            Sélectionnez un membre
                        </option>

                        ${options}
                    </select>
                </div>

                <div class="actions-modal-admin">
                    <button
                        class="bouton-clair"
                        id="annuler-selection-membre-admin"
                        type="button"
                    >
                        Annuler
                    </button>

                    <button
                        class="bouton"
                        type="submit"
                    >
                        Ouvrir la fiche
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

    arrierePlan
        .querySelector(
            "#fermer-selection-membre-admin"
        )
        ?.addEventListener(
            "click",
            fermerSelectionMembreAdmin
        );

    arrierePlan
        .querySelector(
            "#annuler-selection-membre-admin"
        )
        ?.addEventListener(
            "click",
            fermerSelectionMembreAdmin
        );

    arrierePlan
        .querySelector(
            "#formulaire-selection-membre-admin"
        )
        ?.addEventListener(
            "submit",
            function (evenement) {
                evenement.preventDefault();

                const compteId =
                    arrierePlan.querySelector(
                        "#compte-selection-membre-admin"
                    )?.value;

                if (!compteId) {
                    return;
                }

                fermerSelectionMembreAdmin();

                ouvrirFicheMembreAdmin(
                    compteId
                );
            }
        );

    arrierePlan.addEventListener(
        "click",
        function (evenement) {
            if (
                evenement.target ===
                arrierePlan
            ) {
                fermerSelectionMembreAdmin();
            }
        }
    );

    arrierePlan
        .querySelector(
            "#compte-selection-membre-admin"
        )
        ?.focus();
}

async function ouvrirFicheMembreAdmin(
    compteId
) {
    fermerFicheMembreAdmin();

    try {
        const donnees =
            await chargerFicheMembreAdmin(
                compteId
            );

        creerFicheMembreAdmin(
            donnees
        );
    } catch (erreur) {
        console.error(
            "Chargement du membre impossible :",
            erreur
        );

        afficherErreurMembreAdmin(
            "Impossible de charger la fiche du membre."
        );
    }
}

async function chargerFicheMembreAdmin(
    compteId
) {
    const { data: compte, error: erreurCompte } =
        await supabaseClient
            .from("comptes")
            .select(`
                id,
                utilisateur_id,
                numero_compte,
                solde_centimes,
                statut,
                cree_le
            `)
            .eq(
                "id",
                compteId
            )
            .single();

    if (erreurCompte) {
        throw erreurCompte;
    }

    const { data: profil, error: erreurProfil } =
        await supabaseClient
            .from("profils")
            .select(`
                id,
                nom_affiche,
                discord_id,
                avatar_url,
                role,
                statut,
                cree_le
            `)
            .eq(
                "id",
                compte.utilisateur_id
            )
            .single();

    if (erreurProfil) {
        throw erreurProfil;
    }

    const {
        data: transactions,
        error: erreurTransactions
    } = await supabaseClient
        .from("transactions")
        .select(`
            id,
            type,
            categorie,
            titre,
            description,
            montant_centimes,
            reference,
            cree_le
        `)
        .eq(
            "compte_id",
            compte.id
        )
        .order(
            "cree_le",
            {
                ascending: false
            }
        )
        .limit(5);

    if (erreurTransactions) {
        throw erreurTransactions;
    }

    return {
        compte: compte,
        profil: profil,
        transactions:
            Array.isArray(transactions)
                ? transactions
                : []
    };
}

function creerFicheMembreAdmin(
    donnees
) {
    const profil = donnees.profil;
    const compte = donnees.compte;

    const arrierePlan =
        document.createElement("div");

    arrierePlan.className =
        "arriere-plan-modal";

    arrierePlan.id =
        "modal-fiche-membre-admin";

    const avatar = profil.avatar_url
        ? `
            <img
                class="avatar-fiche-admin"
                src="${securiserValeurFicheAdmin(
                    profil.avatar_url
                )}"
                alt=""
                referrerpolicy="no-referrer"
            >
        `
        : `
            <div
                class="
                    avatar-fiche-admin
                    avatar-texte-admin
                "
            >
                ${securiserValeurFicheAdmin(
                    creerInitialesFicheAdmin(
                        profil.nom_affiche
                    )
                )}
            </div>
        `;

    arrierePlan.innerHTML = `
        <section
            class="
                modal-transaction
                modal-fiche-admin
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-fiche-membre-admin"
        >
            <button
                class="fermer-modal"
                id="fermer-fiche-membre-admin"
                type="button"
                aria-label="Fermer"
            >
                ×
            </button>

            <div class="entete-fiche-admin">
                ${avatar}

                <div>
                    <p class="petit-titre">
                        Fiche bancaire du membre
                    </p>

                    <h2 id="titre-fiche-membre-admin">
                        ${securiserValeurFicheAdmin(
                            profil.nom_affiche ||
                            "Membre"
                        )}
                    </h2>

                    <span>
                        ${securiserValeurFicheAdmin(
                            formaterRoleFicheAdmin(
                                profil.role
                            )
                        )}
                    </span>
                </div>
            </div>

            <div class="details-transaction">
                <div>
                    <span>
                        Compte RP
                    </span>

                    <strong>
                        ${securiserValeurFicheAdmin(
                            compte.numero_compte
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        Solde
                    </span>

                    <strong>
                        ${formaterEurosSupabase(
                            compte.solde_centimes
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        Statut
                    </span>

                    <strong>
                        ${securiserValeurFicheAdmin(
                            formaterStatutFicheAdmin(
                                compte.statut
                            )
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        Identifiant Discord
                    </span>

                    <strong>
                        ${securiserValeurFicheAdmin(
                            profil.discord_id ||
                            "Non disponible"
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        Date de création
                    </span>

                    <strong>
                        ${formaterDateSupabase(
                            compte.cree_le
                        )}
                    </strong>
                </div>
            </div>

            <div class="historique-fiche-admin">
                <h3>
                    Dernières transactions
                </h3>

                <div>
                    ${creerTransactionsFicheAdmin(
                        donnees.transactions
                    )}
                </div>
            </div>

            <button
                class="bouton-fermer-details"
                id="terminer-fiche-membre-admin"
                type="button"
            >
                Fermer
            </button>
        </section>
    `;

    document.body.appendChild(
        arrierePlan
    );

    document.body.classList.add(
        "modal-ouverte"
    );

    arrierePlan
        .querySelector(
            "#fermer-fiche-membre-admin"
        )
        ?.addEventListener(
            "click",
            fermerFicheMembreAdmin
        );

    arrierePlan
        .querySelector(
            "#terminer-fiche-membre-admin"
        )
        ?.addEventListener(
            "click",
            fermerFicheMembreAdmin
        );

    arrierePlan.addEventListener(
        "click",
        function (evenement) {
            if (
                evenement.target ===
                arrierePlan
            ) {
                fermerFicheMembreAdmin();
            }
        }
    );
}

function creerTransactionsFicheAdmin(
    transactions
) {
    if (
        !Array.isArray(transactions) ||
        transactions.length === 0
    ) {
        return `
            <p class="aucune-operation">
                Aucune transaction enregistrée.
            </p>
        `;
    }

    return transactions
        .map(function (transaction) {
            const revenu =
                transaction.type ===
                "revenu";

            const signe =
                revenu ? "+" : "−";

            return `
                <article
                    class="operation-fiche-admin"
                >
                    <div>
                        <strong>
                            ${securiserValeurFicheAdmin(
                                transaction.titre
                            )}
                        </strong>

                        <span>
                            ${formaterDateSupabase(
                                transaction.cree_le
                            )}
                        </span>
                    </div>

                    <strong
                        class="${
                            revenu
                                ? "texte-vert"
                                : "texte-rouge"
                        }"
                    >
                        ${signe}${formaterEurosSupabase(
                            transaction
                                .montant_centimes
                        )}
                    </strong>
                </article>
            `;
        })
        .join("");
}

function fermerSelectionMembreAdmin() {
    document
        .querySelector(
            "#modal-selection-membre-admin"
        )
        ?.remove();

    if (
        !document.querySelector(
            "#modal-fiche-membre-admin"
        )
    ) {
        document.body.classList.remove(
            "modal-ouverte"
        );
    }
}

function fermerFicheMembreAdmin() {
    document
        .querySelector(
            "#modal-fiche-membre-admin"
        )
        ?.remove();

    document.body.classList.remove(
        "modal-ouverte"
    );
}

function afficherErreurMembreAdmin(
    message
) {
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

function formaterRoleFicheAdmin(role) {
    const roles = {
        eleve: "Élève",
        parent: "Parent",
        professeur: "Professeur",
        personnel: "Personnel",
        administrateur:
            "Administrateur"
    };

    return roles[role] || "Membre";
}

function formaterStatutFicheAdmin(
    statut
) {
    const statuts = {
        actif: "Actif",
        suspendu: "Suspendu",
        ferme: "Fermé"
    };

    return statuts[statut] || "Inconnu";
}

function creerInitialesFicheAdmin(nom) {
    return String(nom || "SG")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(function (partie) {
            return partie
                .charAt(0)
                .toUpperCase();
        })
        .join("") || "SG";
}

function securiserValeurFicheAdmin(
    valeur
) {
    const element =
        document.createElement("div");

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
        if (evenement.key !== "Escape") {
            return;
        }

        if (
            document.querySelector(
                "#modal-fiche-membre-admin"
            )
        ) {
            fermerFicheMembreAdmin();

            return;
        }

        fermerSelectionMembreAdmin();
    }
);

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiserRechercheMembreAdmin
    );
} else {
    initialiserRechercheMembreAdmin();
}
