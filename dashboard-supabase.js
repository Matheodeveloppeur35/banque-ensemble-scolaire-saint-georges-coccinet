async function initialiserDashboardSupabase() {
    const conteneurOperations = document.querySelector(
        "#operations-dashboard"
    );

    try {
        const session = await protegerPageSupabase();

        if (!session) {
            return;
        }

        const donnees =
            await obtenirDonneesBancairesSupabase();

        if (!donnees) {
            throw new Error(
                "Le profil ou le compte bancaire est introuvable."
            );
        }

        const transactions =
            await obtenirTransactionsSupabase(3);

        afficherCompteSupabase(donnees);
        afficherOperationsSupabase(transactions);
    } catch (erreur) {
        console.error(
            "Chargement du tableau de bord impossible :",
            erreur
        );

        if (conteneurOperations) {
            conteneurOperations.innerHTML = `
                <p class="aucune-operation">
                    Impossible de charger les opérations.
                </p>
            `;
        }

        if (
            typeof afficherNotification === "function"
        ) {
            afficherNotification(
                "Impossible de charger votre compte bancaire.",
                "erreur",
                6000
            );
        }
    }
}

function afficherCompteSupabase(donnees) {
    const profil = donnees.profil;
    const compte = donnees.compte;

    const nom = String(
        profil.nom_affiche || "Membre"
    );

    const role = formaterRoleSupabase(
        profil.role
    );

    const statut = formaterStatutSupabase(
        compte.statut
    );

    definirTexteDashboard(
        "#bienvenue-dashboard",
        `Bonjour, ${nom}`
    );

    definirTexteDashboard(
        "#solde-dashboard",
        formaterEurosSupabase(
            compte.solde_centimes
        )
    );

    definirTexteDashboard(
        "#numero-compte-dashboard",
        compte.numero_compte || "Non attribué"
    );

    definirTexteDashboard(
        "#titulaire-dashboard",
        nom
    );

    definirTexteDashboard(
        "#type-compte-dashboard",
        `Compte ${role.toLowerCase()} RP`
    );

    definirTexteDashboard(
        "#statut-dashboard",
        `Compte ${statut.toLowerCase()}`
    );

    definirTexteDashboard(
        "#statut-information-dashboard",
        statut
    );
}

function afficherOperationsSupabase(transactions) {
    const conteneur = document.querySelector(
        "#operations-dashboard"
    );

    if (!conteneur) {
        return;
    }

    if (
        !Array.isArray(transactions) ||
        transactions.length === 0
    ) {
        conteneur.innerHTML = `
            <p class="aucune-operation">
                Aucune opération enregistrée.
            </p>
        `;

        return;
    }

    conteneur.innerHTML = transactions
        .map(function (transaction) {
            const revenu =
                transaction.type === "revenu";

            const signe = revenu ? "+" : "−";
            const classeType =
                revenu ? "revenu" : "depense";

            const classeMontant =
                revenu ? "positif" : "negatif";

            return `
                <article class="ligne-operation">
                    <div
                        class="icone-operation ${classeType}"
                    >
                        ${signe}
                    </div>

                    <div class="description-operation">
                        <strong>
                            ${securiserTexteDashboard(
                                transaction.titre
                            )}
                        </strong>

                        <span>
                            ${securiserTexteDashboard(
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
                        class="montant ${classeMontant}"
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

function definirTexteDashboard(selecteur, texte) {
    const element = document.querySelector(
        selecteur
    );

    if (element) {
        element.textContent = texte;
    }
}

function formaterRoleSupabase(role) {
    const roles = {
        eleve: "Élève",
        professeur: "Professeur",
        personnel: "Personnel",
        administrateur: "Administrateur"
    };

    return roles[role] || "Membre";
}

function formaterStatutSupabase(statut) {
    const statuts = {
        actif: "Actif",
        suspendu: "Suspendu",
        ferme: "Fermé"
    };

    return statuts[statut] || "Inconnu";
}

function securiserTexteDashboard(valeur) {
    const element = document.createElement("div");

    element.textContent =
        valeur === null || valeur === undefined
            ? ""
            : String(valeur);

    return element.innerHTML;
}

initialiserDashboardSupabase();
