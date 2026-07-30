let transactionsHistoriqueSupabase = [];
let filtreHistoriqueActif = "tous";

async function initialiserHistoriqueSupabase() {
    try {
        const session = await protegerPageSupabase();

        if (!session) {
            return;
        }

        const donnees =
            await obtenirDonneesBancairesSupabase();

        if (!donnees) {
            throw new Error(
                "Le compte bancaire est introuvable."
            );
        }

        transactionsHistoriqueSupabase =
            await obtenirTransactionsSupabase(500);

        afficherResumeHistoriqueSupabase(
            donnees.compte,
            transactionsHistoriqueSupabase
        );

        activerOutilsHistoriqueSupabase();
        actualiserHistoriqueSupabase();
    } catch (erreur) {
        console.error(
            "Chargement de l’historique impossible :",
            erreur
        );

        afficherErreurHistoriqueSupabase();
    }
}

function afficherResumeHistoriqueSupabase(
    compte,
    transactions
) {
    const revenus = transactions
        .filter(function (transaction) {
            return transaction.type === "revenu";
        })
        .reduce(function (total, transaction) {
            return (
                total +
                Number(transaction.montant_centimes || 0)
            );
        }, 0);

    const depenses = transactions
        .filter(function (transaction) {
            return transaction.type === "depense";
        })
        .reduce(function (total, transaction) {
            return (
                total +
                Number(transaction.montant_centimes || 0)
            );
        }, 0);

    definirTexteHistoriqueSupabase(
        "#compte-historique",
        `Compte ${compte.numero_compte}`
    );

    definirTexteHistoriqueSupabase(
        "#solde-historique",
        formaterEurosSupabase(
            compte.solde_centimes
        )
    );

    definirTexteHistoriqueSupabase(
        "#revenus-historique",
        `+${formaterEurosSupabase(revenus)}`
    );

    definirTexteHistoriqueSupabase(
        "#depenses-historique",
        `−${formaterEurosSupabase(depenses)}`
    );
}

function activerOutilsHistoriqueSupabase() {
    document
        .querySelector("#recherche-historique")
        ?.addEventListener(
            "input",
            actualiserHistoriqueSupabase
        );

    document
        .querySelector("#tri-historique")
        ?.addEventListener(
            "change",
            actualiserHistoriqueSupabase
        );

    document
        .querySelectorAll(
            "[data-filtre-historique]"
        )
        .forEach(function (bouton) {
            bouton.addEventListener(
                "click",
                function () {
                    filtreHistoriqueActif =
                        bouton.dataset
                            .filtreHistorique;

                    document
                        .querySelectorAll(
                            "[data-filtre-historique]"
                        )
                        .forEach(function (
                            autreBouton
                        ) {
                            autreBouton.classList.remove(
                                "actif"
                            );
                        });

                    bouton.classList.add("actif");
                    actualiserHistoriqueSupabase();
                }
            );
        });
}

function actualiserHistoriqueSupabase() {
    const recherche = normaliserHistoriqueSupabase(
        document.querySelector(
            "#recherche-historique"
        )?.value
    );

    const tri = document.querySelector(
        "#tri-historique"
    )?.value || "recentes";

    const transactions = transactionsHistoriqueSupabase
        .filter(function (transaction) {
            return transactionCorrespondAuFiltreSupabase(
                transaction
            );
        })
        .filter(function (transaction) {
            if (!recherche) {
                return true;
            }

            const contenu = [
                transaction.titre,
                transaction.description,
                transaction.reference,
                transaction.type,
                transaction.categorie,
                formaterEurosSupabase(
                    transaction.montant_centimes
                )
            ]
                .filter(Boolean)
                .join(" ");

            return normaliserHistoriqueSupabase(
                contenu
            ).includes(recherche);
        });

    afficherTransactionsHistoriqueSupabase(
        trierHistoriqueSupabase(
            transactions,
            tri
        )
    );
}

function transactionCorrespondAuFiltreSupabase(
    transaction
) {
    if (filtreHistoriqueActif === "tous") {
        return true;
    }

    if (
        filtreHistoriqueActif === "revenu" ||
        filtreHistoriqueActif === "depense"
    ) {
        return (
            transaction.type ===
            filtreHistoriqueActif
        );
    }

    return (
        transaction.categorie ===
        filtreHistoriqueActif
    );
}

function trierHistoriqueSupabase(
    transactions,
    tri
) {
    return transactions
        .slice()
        .sort(function (
            transactionA,
            transactionB
        ) {
            if (tri === "anciennes") {
                return (
                    obtenirTempsHistoriqueSupabase(
                        transactionA
                    ) -
                    obtenirTempsHistoriqueSupabase(
                        transactionB
                    )
                );
            }

            if (tri === "montant-croissant") {
                return (
                    Number(
                        transactionA.montant_centimes
                    ) -
                    Number(
                        transactionB.montant_centimes
                    )
                );
            }

            if (tri === "montant-decroissant") {
                return (
                    Number(
                        transactionB.montant_centimes
                    ) -
                    Number(
                        transactionA.montant_centimes
                    )
                );
            }

            return (
                obtenirTempsHistoriqueSupabase(
                    transactionB
                ) -
                obtenirTempsHistoriqueSupabase(
                    transactionA
                )
            );
        });
}

function afficherTransactionsHistoriqueSupabase(
    transactions
) {
    const conteneur = document.querySelector(
        "#liste-historique"
    );

    if (!conteneur) {
        return;
    }

    definirTexteHistoriqueSupabase(
        "#periode-historique",
        `${transactions.length} opération(s)`
    );

    if (transactions.length === 0) {
        conteneur.innerHTML = `
            <p class="aucune-operation">
                Aucune opération ne correspond aux critères.
            </p>
        `;

        return;
    }

    conteneur.innerHTML = transactions
        .map(function (transaction) {
            const revenu =
                transaction.type === "revenu";

            const signe = revenu ? "+" : "−";

            return `
                <article
                    class="
                        ligne-operation
                        transaction-cliquable
                    "
                    tabindex="0"
                >
                    <div
                        class="
                            icone-operation
                            ${revenu
                                ? "revenu"
                                : "depense"}
                        "
                    >
                        ${signe}
                    </div>

                    <div class="description-operation">
                        <strong>
                            ${securiserHistoriqueSupabase(
                                transaction.titre
                            )}
                        </strong>

                        <span>
                            ${securiserHistoriqueSupabase(
                                transaction.description
                            )}
                        </span>
                    </div>

                    <div class="date-operation">
                        ${formaterDateSupabase(
                            transaction.cree_le
                        )}
                    </div>

                    <strong
                        class="
                            montant
                            ${revenu
                                ? "positif"
                                : "negatif"}
                        "
                    >
                        ${signe}${formaterEurosSupabase(
                            transaction.montant_centimes
                        )}
                    </strong>
                </article>
            `;
        })
        .join("");
}

function obtenirTempsHistoriqueSupabase(
    transaction
) {
    const temps = new Date(
        transaction.cree_le
    ).getTime();

    return Number.isNaN(temps)
        ? 0
        : temps;
}

function definirTexteHistoriqueSupabase(
    selecteur,
    valeur
) {
    const element = document.querySelector(
        selecteur
    );

    if (element) {
        element.textContent = valeur;
    }
}

function normaliserHistoriqueSupabase(texte) {
    return String(texte || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function securiserHistoriqueSupabase(valeur) {
    const element = document.createElement("div");

    element.textContent =
        valeur === null ||
        valeur === undefined
            ? ""
            : String(valeur);

    return element.innerHTML;
}

function afficherErreurHistoriqueSupabase() {
    const conteneur = document.querySelector(
        "#liste-historique"
    );

    if (conteneur) {
        conteneur.innerHTML = `
            <p class="aucune-operation">
                Impossible de charger l’historique.
            </p>
        `;
    }

    if (
        typeof afficherNotification ===
        "function"
    ) {
        afficherNotification(
            "Impossible de charger votre historique.",
            "erreur",
            6000
        );
    }
}

initialiserHistoriqueSupabase();
