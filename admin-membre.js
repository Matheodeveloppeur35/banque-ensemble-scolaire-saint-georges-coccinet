function initialiserRechercheMembreAdmin() {
    const boutonRecherche = document.querySelector(
        '[data-action="rechercher"]'
    );

    const champRecherche = document.querySelector(
        "#recherche-admin"
    );

    if (boutonRecherche && champRecherche) {
        boutonRecherche.addEventListener(
            "click",
            function () {
                champRecherche.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                champRecherche.focus();
            }
        );
    }

    document.addEventListener(
        "click",
        function (evenement) {
            const ligne = evenement.target.closest(
                "[data-ligne-compte]"
            );

            if (!ligne) {
                return;
            }

            const compteId =
                ligne.dataset.compteId;

            if (compteId) {
                ouvrirFicheMembreAdmin(compteId);
            }
        }
    );
}

async function ouvrirFicheMembreAdmin(compteId) {
    fermerFicheMembreAdmin();

    try {
        const donnees =
            await chargerFicheMembreAdmin(compteId);

        creerFicheMembreAdmin(donnees);
    } catch (erreur) {
        console.error(
            "Chargement du membre impossible :",
            erreur
        );

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                "Impossible de charger la fiche du membre.",
                "erreur",
                6000
            );
        }
    }
}

async function chargerFicheMembreAdmin(compteId) {
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
            .eq("id", compteId)
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
            .eq("id", compte.utilisateur_id)
            .single();

    if (erreurProfil) {
        throw erreurProfil;
    }

    const { data: transactions, error: erreurTransactions } =
        await supabaseClient
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
            .eq("compte_id", compte.id)
            .order("cree_le", {
                ascending: false
            })
            .limit(5);

    if (erreurTransactions) {
        throw erreurTransactions;
    }

    return {
        compte: compte,
        profil: profil,
        transactions: transactions || []
    };
}

function creerFicheMembreAdmin(donnees) {
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
            <div class="avatar-fiche-admin avatar-texte-admin">
                ${creerInitialesFicheAdmin(
                    profil.nom_affiche
                )}
            </div>
        `;

    arrierePlan.innerHTML = `
        <section
            class="modal-transaction modal-fiche-admin"
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
                            profil.nom_affiche
                        )}
                    </h2>

                    <span>
                        ${formaterRoleAdministration(
                            profil.role
                        )}
                    </span>
                </div>
            </div>

            <div class="details-transaction">
                <div>
                    <span>Compte RP</span>

                    <strong>
                        ${securiserValeurFicheAdmin(
                            compte.numero_compte
                        )}
                    </strong>
                </div>

                <div>
                    <span>Solde</span>

                    <strong>
                        ${formaterEurosSupabase(
                            compte.solde_centimes
                        )}
                    </strong>
                </div>

                <div>
                    <span>Statut</span>

                    <strong>
                        ${formaterStatutAdministration(
                            compte.statut
                        )}
                    </strong>
                </div>

                <div>
                    <span>Identifiant Discord</span>

                    <strong>
                        ${securiserValeurFicheAdmin(
                            profil.discord_id || "Non disponible"
                        )}
                    </strong>
                </div>

                <div>
                    <span>Date de création</span>

                    <strong>
                        ${formaterDateSupabase(
                            compte.cree_le
                        )}
                    </strong>
                </div>
            </div>

            <div class="historique-fiche-admin">
                <h3>Dernières transactions</h3>

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

    document.body.appendChild(arrierePlan);
    document.body.classList.add("modal-ouverte");

    document
        .querySelector("#fermer-fiche-membre-admin")
        ?.addEventListener(
            "click",
            fermerFicheMembreAdmin
        );

    document
        .querySelector("#terminer-fiche-membre-admin")
        ?.addEventListener(
            "click",
            fermerFicheMembreAdmin
        );

    arrierePlan.addEventListener(
        "click",
        function (evenement) {
            if (evenement.target === arrierePlan) {
                fermerFicheMembreAdmin();
            }
        }
    );
}

function creerTransactionsFicheAdmin(transactions) {
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

    return transactions.map(function (transaction) {
        const revenu =
            transaction.type === "revenu";

        const signe = revenu ? "+" : "−";

        return `
            <article class="operation-fiche-admin">
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
                        transaction.montant_centimes
                    )}
                </strong>
            </article>
        `;
    }).join("");
}

function fermerFicheMembreAdmin() {
    document
        .querySelector("#modal-fiche-membre-admin")
        ?.remove();

    document.body.classList.remove(
        "modal-ouverte"
    );
}

function creerInitialesFicheAdmin(nom) {
    return String(nom || "SG")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(function (partie) {
            return partie.charAt(0).toUpperCase();
        })
        .join("") || "SG";
}

function securiserValeurFicheAdmin(valeur) {
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
            fermerFicheMembreAdmin();
        }
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
