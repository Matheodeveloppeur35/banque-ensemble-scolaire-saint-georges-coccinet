function initialiserGestionRoles() {
    const conteneurActions = document.querySelector(
        ".grille-actions-admin"
    );

    if (!conteneurActions) {
        return;
    }

    if (
        document.querySelector(
            '[data-action="modifier-role"]'
        )
    ) {
        return;
    }

    const boutonRole = document.createElement(
        "button"
    );

    boutonRole.className = "action-admin";
    boutonRole.type = "button";
    boutonRole.dataset.action = "modifier-role";

    boutonRole.innerHTML = `
        <span aria-hidden="true">
            🎓
        </span>

        <div>
            <strong>
                Modifier un rôle
            </strong>

            <small>
                Attribuer un rôle à un membre
            </small>
        </div>
    `;

    conteneurActions.appendChild(boutonRole);

    boutonRole.addEventListener(
        "click",
        ouvrirFenetreModificationRole
    );
}

async function ouvrirFenetreModificationRole() {
    fermerFenetreModificationRole();

    try {
        const profils =
            await chargerProfilsPourRole();

        if (profils.length === 0) {
            afficherErreurRole(
                "Aucun membre n’est disponible."
            );

            return;
        }

        creerFenetreModificationRole(profils);
    } catch (erreur) {
        console.error(
            "Chargement des profils impossible :",
            erreur
        );

        afficherErreurRole(
            "Impossible de charger les membres."
        );
    }
}

async function chargerProfilsPourRole() {
    const { data, error } = await supabaseClient
        .from("profils")
        .select(`
            id,
            nom_affiche,
            role,
            statut
        `)
        .order("nom_affiche", {
            ascending: true
        });

    if (error) {
        throw error;
    }

    return Array.isArray(data)
        ? data
        : [];
}

function creerFenetreModificationRole(profils) {
    const arrierePlan =
        document.createElement("div");

    arrierePlan.className =
        "arriere-plan-modal";

    arrierePlan.id =
        "modal-modification-role";

    const optionsProfils = profils
        .map(function (profil) {
            const roleLisible =
                formaterRoleAdmin(
                    profil.role
                );

            const texte =
                `${profil.nom_affiche} — ` +
                `${roleLisible}`;

            return `
                <option
                    value="${securiserValeurAdminRole(
                        profil.id
                    )}"
                    data-role="${securiserValeurAdminRole(
                        profil.role
                    )}"
                >
                    ${securiserValeurAdminRole(
                        texte
                    )}
                </option>
            `;
        })
        .join("");

    arrierePlan.innerHTML = `
        <section
            class="modal-transaction modal-admin-role"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-modification-role"
        >
            <button
                class="fermer-modal"
                id="fermer-modification-role"
                type="button"
                aria-label="Fermer"
            >
                ×
            </button>

            <p class="petit-titre">
                Gestion des permissions
            </p>

            <h2 id="titre-modification-role">
                Modifier le rôle d’un membre
            </h2>

            <p>
                Le rôle détermine la fonction RP du membre.
                Seuls les administrateurs peuvent effectuer
                cette modification.
            </p>

            <form id="formulaire-modification-role">
                <div class="champ">
                    <label for="utilisateur-role-admin">
                        Membre
                    </label>

                    <select
                        id="utilisateur-role-admin"
                        required
                    >
                        <option value="">
                            Sélectionnez un membre
                        </option>

                        ${optionsProfils}
                    </select>
                </div>

                <div class="champ">
                    <label for="nouveau-role-admin">
                        Nouveau rôle
                    </label>

                    <select
                        id="nouveau-role-admin"
                        required
                    >
                        <option value="eleve">
                            Élève
                        </option>

                        <option value="parent">
                            Parent
                        </option>

                        <option value="professeur">
                            Professeur
                        </option>

                        <option value="personnel">
                            Personnel
                        </option>

                        <option value="administrateur">
                            Administrateur
                        </option>
                    </select>
                </div>

                <div class="champ">
                    <label for="motif-role-admin">
                        Motif administratif
                    </label>

                    <textarea
                        id="motif-role-admin"
                        minlength="3"
                        maxlength="300"
                        rows="4"
                        placeholder="Indiquez la raison du changement"
                        required
                    ></textarea>

                    <small>
                        Entre 3 et 300 caractères.
                    </small>
                </div>

                <div
                    class="message-action-admin"
                    id="message-role-admin"
                    aria-live="polite"
                    hidden
                ></div>

                <div class="actions-modal-admin">
                    <button
                        class="bouton-clair"
                        id="annuler-modification-role"
                        type="button"
                    >
                        Annuler
                    </button>

                    <button
                        class="bouton"
                        id="confirmer-modification-role"
                        type="submit"
                    >
                        Confirmer le rôle
                    </button>
                </div>
            </form>
        </section>
    `;

    document.body.appendChild(arrierePlan);
    document.body.classList.add(
        "modal-ouverte"
    );

    activerEvenementsRole(arrierePlan);

    document
        .querySelector("#utilisateur-role-admin")
        ?.focus();
}

function activerEvenementsRole(arrierePlan) {
    const formulaire = document.querySelector(
        "#formulaire-modification-role"
    );

    const selectionUtilisateur =
        document.querySelector(
            "#utilisateur-role-admin"
        );

    const selectionRole =
        document.querySelector(
            "#nouveau-role-admin"
        );

    document
        .querySelector("#fermer-modification-role")
        ?.addEventListener(
            "click",
            fermerFenetreModificationRole
        );

    document
        .querySelector("#annuler-modification-role")
        ?.addEventListener(
            "click",
            fermerFenetreModificationRole
        );

    arrierePlan.addEventListener(
        "click",
        function (evenement) {
            if (evenement.target === arrierePlan) {
                fermerFenetreModificationRole();
            }
        }
    );

    selectionUtilisateur?.addEventListener(
        "change",
        function () {
            const option =
                selectionUtilisateur
                    .selectedOptions[0];

            const roleActuel =
                option?.dataset.role;

            if (roleActuel) {
                selectionRole.value = roleActuel;
            }
        }
    );

    formulaire?.addEventListener(
        "submit",
        enregistrerModificationRole
    );
}

async function enregistrerModificationRole(
    evenement
) {
    evenement.preventDefault();

    const utilisateurId =
        document.querySelector(
            "#utilisateur-role-admin"
        )?.value;

    const nouveauRole =
        document.querySelector(
            "#nouveau-role-admin"
        )?.value;

    const motif = String(
        document.querySelector(
            "#motif-role-admin"
        )?.value || ""
    ).trim();

    const erreur = verifierModificationRole(
        utilisateurId,
        nouveauRole,
        motif
    );

    if (erreur) {
        afficherMessageRole(erreur, "erreur");
        return;
    }

    const confirmation = window.confirm(
        "Confirmer l’attribution du rôle " +
        `"${formaterRoleAdmin(nouveauRole)}" ?`
    );

    if (!confirmation) {
        return;
    }

    const bouton = document.querySelector(
        "#confirmer-modification-role"
    );

    if (bouton) {
        bouton.disabled = true;
        bouton.textContent =
            "Enregistrement…";
    }

    try {
        const { data, error } =
            await supabaseClient.rpc(
                "admin_modifier_role",
                {
                    p_utilisateur_id:
                        utilisateurId,

                    p_nouveau_role:
                        nouveauRole,

                    p_motif:
                        motif
                }
            );

        if (error) {
            throw error;
        }

        if (!data || data.succes !== true) {
            throw new Error(
                "Le changement de rôle n’a pas été confirmé."
            );
        }

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                "Le rôle a été modifié : " +
                formaterRoleAdmin(
                    data.nouveau_role
                ) +
                ".",
                "succes",
                6000
            );
        }

        fermerFenetreModificationRole();

        window.setTimeout(
            function () {
                window.location.reload();
            },
            500
        );
    } catch (erreurRpc) {
        console.error(
            "Modification du rôle impossible :",
            erreurRpc
        );

        afficherMessageRole(
            obtenirMessageErreurRole(
                erreurRpc
            ),
            "erreur"
        );

        if (bouton) {
            bouton.disabled = false;
            bouton.textContent =
                "Confirmer le rôle";
        }
    }
}

function verifierModificationRole(
    utilisateurId,
    nouveauRole,
    motif
) {
    const rolesAutorises = [
        "eleve",
        "parent",
        "professeur",
        "personnel",
        "administrateur"
    ];

    if (!utilisateurId) {
        return "Veuillez sélectionner un membre.";
    }

    if (!rolesAutorises.includes(nouveauRole)) {
        return "Le rôle sélectionné est invalide.";
    }

    if (motif.length < 3) {
        return (
            "Le motif administratif est trop court."
        );
    }

    if (motif.length > 300) {
        return (
            "Le motif administratif est trop long."
        );
    }

    return null;
}

function afficherMessageRole(message, type) {
    const conteneur = document.querySelector(
        "#message-role-admin"
    );

    if (!conteneur) {
        return;
    }

    conteneur.hidden = false;
    conteneur.className =
        `message-action-admin ${type}`;

    conteneur.textContent = message;
}

function afficherErreurRole(message) {
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

function obtenirMessageErreurRole(erreur) {
    const message = String(
        erreur?.message ||
        "La modification du rôle a échoué."
    );

    const messagesConnus = [
        "Accès administrateur refusé.",
        "Profil utilisateur introuvable.",
        "Rôle demandé invalide.",
        "Ce membre possède déjà ce rôle.",
        "Vous ne pouvez pas retirer votre propre rôle administrateur.",
        "Le motif est trop court.",
        "Le motif est trop long."
    ];

    return (
        messagesConnus.find(function (texte) {
            return message.includes(texte);
        }) ||
        "La modification du rôle a échoué."
    );
}

function formaterRoleAdmin(role) {
    const roles = {
        eleve: "Élève",
        parent: "Parent",
        professeur: "Professeur",
        personnel: "Personnel",
        administrateur: "Administrateur"
    };

    return roles[role] || "Membre";
}

function fermerFenetreModificationRole() {
    document
        .querySelector(
            "#modal-modification-role"
        )
        ?.remove();

    document.body.classList.remove(
        "modal-ouverte"
    );
}

function securiserValeurAdminRole(valeur) {
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

document.addEventListener(
    "keydown",
    function (evenement) {
        if (evenement.key === "Escape") {
            fermerFenetreModificationRole();
        }
    }
);

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiserGestionRoles
    );
} else {
    initialiserGestionRoles();
}
