async function initialiserAdministrationSupabase() {
    try {
        const autorisation =
            await protegerPageAdministration();

        if (!autorisation) {
            return;
        }

        const [
            profils,
            comptes,
            transactions
        ] = await Promise.all([
            chargerProfilsAdministration(),
            chargerComptesAdministration(),
            chargerTransactionsAdministration()
        ]);

        afficherStatistiquesAdministration(
            profils,
            comptes,
            transactions
        );

        afficherComptesAdministration(
            profils,
            comptes
        );

        activerRechercheAdministration();
        activerAccessibiliteLignesAdministration();
    } catch (erreur) {
        console.error(
            "Chargement de l’administration impossible :",
            erreur
        );

        afficherErreurChargementAdministration();
    }
}

async function chargerProfilsAdministration() {
    const { data, error } = await supabaseClient
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
        .order("cree_le", {
            ascending: false
        });

    if (error) {
        throw error;
    }

    return Array.isArray(data)
        ? data
        : [];
}

async function chargerComptesAdministration() {
    const { data, error } = await supabaseClient
        .from("comptes")
        .select(`
            id,
            utilisateur_id,
            numero_compte,
            solde_centimes,
            statut,
            cree_le
        `)
        .order("cree_le", {
            ascending: false
        });

    if (error) {
        throw error;
    }

    return Array.isArray(data)
        ? data
        : [];
}

async function chargerTransactionsAdministration() {
    const debutJournee = new Date();

    debutJournee.setHours(0, 0, 0, 0);

    const { data, error } = await supabaseClient
        .from("transactions")
        .select(`
            id,
            cree_le
        `)
        .gte(
            "cree_le",
            debutJournee.toISOString()
        );

    if (error) {
        throw error;
    }

    return Array.isArray(data)
        ? data
        : [];
}

function afficherStatistiquesAdministration(
    profils,
    comptes,
    transactions
) {
    const comptesActifs = comptes.filter(
        function (compte) {
            return compte.statut === "actif";
        }
    ).length;

    const comptesSuspendus = comptes.filter(
        function (compte) {
            return compte.statut === "suspendu";
        }
    ).length;

    const soldeTotal = comptes.reduce(
        function (total, compte) {
            const solde = Number(
                compte.solde_centimes
            );

            return total + (
                Number.isFinite(solde)
                    ? solde
                    : 0
            );
        },
        0
    );

    definirTexteAdministration(
        "#stat-comptes-actifs",
        String(comptesActifs)
    );

    definirTexteAdministration(
        "#stat-solde-total",
        formaterEurosSupabase(soldeTotal)
    );

    definirTexteAdministration(
        "#stat-transactions-jour",
        String(transactions.length)
    );

    definirTexteAdministration(
        "#stat-comptes-suspendus",
        String(comptesSuspendus)
    );

    definirTexteAdministration(
        "#stat-utilisateurs-total",
        `${profils.length} utilisateur(s) RP`
    );
}

function afficherComptesAdministration(
    profils,
    comptes
) {
    const conteneur = document.querySelector(
        "#liste-comptes-admin"
    );

    if (!conteneur) {
        return;
    }

    const profilsParId = new Map(
        profils.map(function (profil) {
            return [
                profil.id,
                profil
            ];
        })
    );

    const lignes = comptes.map(function (compte) {
        const profil = profilsParId.get(
            compte.utilisateur_id
        );

        return {
            id: compte.id,

            utilisateurId:
                compte.utilisateur_id,

            nom:
                profil?.nom_affiche ||
                "Utilisateur inconnu",

            numero:
                compte.numero_compte ||
                "Non attribué",

            role: formaterRoleAdministration(
                profil?.role
            ),

            soldeCentimes: Number(
                compte.solde_centimes || 0
            ),

            statut:
                compte.statut ||
                "inconnu"
        };
    });

    if (lignes.length === 0) {
        conteneur.innerHTML = `
            <tr>
                <td colspan="5">
                    Aucun compte bancaire enregistré.
                </td>
            </tr>
        `;

        return;
    }

    conteneur.innerHTML = lignes
        .map(function (ligne) {
            const identifiantCompte =
                securiserTexteAdministration(
                    ligne.id
                );

            const nomSecurise =
                securiserTexteAdministration(
                    ligne.nom
                );

            const numeroSecurise =
                securiserTexteAdministration(
                    ligne.numero
                );

            const roleSecurise =
                securiserTexteAdministration(
                    ligne.role
                );

            const statutSecurise =
                securiserTexteAdministration(
                    ligne.statut
                );

            return `
                <tr
                    data-ligne-compte
                    data-compte-id="${identifiantCompte}"
                    class="ligne-compte-cliquable"
                    tabindex="0"
                    role="button"
                    aria-label="
                        Afficher la fiche bancaire de
                        ${nomSecurise}
                    "
                >
                    <td>
                        ${nomSecurise}
                    </td>

                    <td>
                        ${numeroSecurise}
                    </td>

                    <td>
                        ${roleSecurise}
                    </td>

                    <td>
                        ${formaterEurosSupabase(
                            ligne.soldeCentimes
                        )}
                    </td>

                    <td>
                        <span
                            class="
                                statut-tableau
                                ${statutSecurise}
                            "
                        >
                            ${formaterStatutAdministration(
                                ligne.statut
                            )}
                        </span>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function activerRechercheAdministration() {
    const recherche = document.querySelector(
        "#recherche-admin"
    );

    if (!recherche) {
        return;
    }

    recherche.addEventListener(
        "input",
        filtrerComptesAdministration
    );
}

function filtrerComptesAdministration() {
    const recherche = document.querySelector(
        "#recherche-admin"
    );

    if (!recherche) {
        return;
    }

    const valeur = normaliserTexteAdministration(
        recherche.value
    );

    document
        .querySelectorAll("[data-ligne-compte]")
        .forEach(function (ligne) {
            const contenu =
                normaliserTexteAdministration(
                    ligne.textContent
                );

            ligne.hidden =
                valeur.length > 0 &&
                !contenu.includes(valeur);
        });
}

function activerAccessibiliteLignesAdministration() {
    document
        .querySelectorAll("[data-ligne-compte]")
        .forEach(function (ligne) {
            ligne.addEventListener(
                "keydown",
                function (evenement) {
                    if (
                        evenement.key !== "Enter" &&
                        evenement.key !== " "
                    ) {
                        return;
                    }

                    evenement.preventDefault();

                    const compteId =
                        ligne.dataset.compteId;

                    if (
                        compteId &&
                        typeof ouvrirFicheMembreAdmin ===
                            "function"
                    ) {
                        ouvrirFicheMembreAdmin(
                            compteId
                        );
                    }
                }
            );
        });
}

function afficherErreurChargementAdministration() {
    const conteneur = document.querySelector(
        "#liste-comptes-admin"
    );

    if (conteneur) {
        conteneur.innerHTML = `
            <tr>
                <td colspan="5">
                    Impossible de charger les comptes bancaires.
                </td>
            </tr>
        `;
    }

    if (
        typeof afficherNotification ===
        "function"
    ) {
        afficherNotification(
            "Impossible de charger les données administratives.",
            "erreur",
            6000
        );
    }
}

function definirTexteAdministration(
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

function formaterRoleAdministration(role) {
    const roles = {
        eleve: "Élève",
        parent: "Parent",
        professeur: "Professeur",
        personnel: "Personnel",
        administrateur: "Administrateur"
    };

    return roles[role] || "Membre";
}

function formaterStatutAdministration(statut) {
    const statuts = {
        actif: "Actif",
        suspendu: "Suspendu",
        ferme: "Fermé"
    };

    return statuts[statut] || "Inconnu";
}

function normaliserTexteAdministration(texte) {
    return String(texte || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function securiserTexteAdministration(valeur) {
    const element = document.createElement("div");

    element.textContent =
        valeur === null ||
        valeur === undefined
            ? ""
            : String(valeur);

    return element.innerHTML;
}

initialiserAdministrationSupabase();
