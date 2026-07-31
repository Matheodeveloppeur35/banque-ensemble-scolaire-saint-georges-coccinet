document.addEventListener(
    "DOMContentLoaded",
    function () {
        initialiserMenuUtilisateur();
    }
);

async function initialiserMenuUtilisateur() {
    const navigation = document.querySelector(
        "header nav"
    );

    if (
        !navigation ||
        typeof supabaseClient === "undefined"
    ) {
        return;
    }

    try {
        const {
            data: { session },
            error: erreurSession
        } = await supabaseClient.auth.getSession();

        if (erreurSession) {
            throw erreurSession;
        }

        if (!session?.user) {
            return;
        }

        const profil = await chargerProfilMenuUtilisateur(
            session.user
        );

        creerMenuUtilisateur(
            navigation,
            session.user,
            profil
        );

        activerMenuUtilisateur();
    } catch (erreur) {
        console.error(
            "Chargement du menu utilisateur impossible :",
            erreur
        );
    }
}

async function chargerProfilMenuUtilisateur(
    utilisateur
) {
    const { data, error } = await supabaseClient
        .from("profils")
        .select(`
            nom_affiche,
            avatar_url,
            role
        `)
        .eq("id", utilisateur.id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return {
        nom_affiche:
            data?.nom_affiche ||
            obtenirNomDiscordUtilisateur(
                utilisateur
            ),

        avatar_url:
            data?.avatar_url ||
            obtenirAvatarDiscordUtilisateur(
                utilisateur
            ),

        role:
            data?.role ||
            "eleve"
    };
}

function creerMenuUtilisateur(
    navigation,
    utilisateur,
    profil
) {
    supprimerAncienMenuUtilisateur();

    /*
     * Le bouton de déconnexion classique est retiré,
     * car il sera désormais placé dans le menu utilisateur.
     */
    navigation
        .querySelectorAll(
            "[data-deconnexion-supabase]"
        )
        .forEach(function (bouton) {
            bouton.remove();
        });

    const nom = String(
        profil.nom_affiche || "Membre"
    );

    const role = String(
        profil.role || "eleve"
    );

    const avatarUrl = profil.avatar_url;

    const conteneur = document.createElement(
        "div"
    );

    conteneur.className =
        "menu-utilisateur";

    conteneur.id =
        "menu-utilisateur";

    conteneur.innerHTML = `
        <button
            class="bouton-menu-utilisateur"
            id="bouton-menu-utilisateur"
            type="button"
            aria-haspopup="true"
            aria-expanded="false"
            aria-controls="panneau-menu-utilisateur"
        >
            <span class="avatar-menu-utilisateur">
                ${creerContenuAvatarMenuUtilisateur(
                    avatarUrl,
                    nom
                )}
            </span>

            <span class="identite-menu-utilisateur">
                <strong>
                    ${securiserTexteMenuUtilisateur(
                        nom
                    )}
                </strong>

                <small>
                    ${securiserTexteMenuUtilisateur(
                        formaterRoleMenuUtilisateur(
                            role
                        )
                    )}
                </small>
            </span>

            <span
                class="fleche-menu-utilisateur"
                aria-hidden="true"
            >
                ▾
            </span>
        </button>

        <div
            class="panneau-menu-utilisateur"
            id="panneau-menu-utilisateur"
            role="menu"
            hidden
        >
            <div class="entete-menu-utilisateur">
                <span class="avatar-menu-utilisateur grand">
                    ${creerContenuAvatarMenuUtilisateur(
                        avatarUrl,
                        nom
                    )}
                </span>

                <div>
                    <strong>
                        ${securiserTexteMenuUtilisateur(
                            nom
                        )}
                    </strong>

                    <span>
                        ${securiserTexteMenuUtilisateur(
                            utilisateur.email ||
                            "Compte Discord"
                        )}
                    </span>
                </div>
            </div>

            <div
                class="separateur-menu-utilisateur"
                aria-hidden="true"
            ></div>

            <a
                href="./profil.html"
                role="menuitem"
            >
                <span aria-hidden="true">
                    👤
                </span>

                Mon profil
            </a>

            <a
                href="./personnalisation.html"
                role="menuitem"
            >
                <span aria-hidden="true">
                    🎨
                </span>

                Personnalisation
            </a>

            <a
                href="./parametres.html"
                role="menuitem"
            >
                <span aria-hidden="true">
                    ⚙️
                </span>

                Paramètres
            </a>

            <a
                href="./aide.html"
                role="menuitem"
            >
                <span aria-hidden="true">
                    ❔
                </span>

                Aide
            </a>

            ${
                role === "administrateur"
                    ? `
                        <a
                            class="lien-administration-menu"
                            href="./admin.html"
                            role="menuitem"
                        >
                            <span aria-hidden="true">
                                🛡️
                            </span>

                            Administration
                        </a>
                    `
                    : ""
            }

            <div
                class="separateur-menu-utilisateur"
                aria-hidden="true"
            ></div>

            <button
                class="deconnexion-menu-utilisateur"
                type="button"
                role="menuitem"
                data-deconnexion-supabase
            >
                <span aria-hidden="true">
                    ↪
                </span>

                Déconnexion
            </button>
        </div>
    `;

    navigation.appendChild(
        conteneur
    );
}

function activerMenuUtilisateur() {
    const conteneur = document.querySelector(
        "#menu-utilisateur"
    );

    const bouton = document.querySelector(
        "#bouton-menu-utilisateur"
    );

    const panneau = document.querySelector(
        "#panneau-menu-utilisateur"
    );

    if (
        !conteneur ||
        !bouton ||
        !panneau
    ) {
        return;
    }

    bouton.addEventListener(
        "click",
        function (evenement) {
            evenement.stopPropagation();

            const ouvert =
                bouton.getAttribute(
                    "aria-expanded"
                ) === "true";

            if (ouvert) {
                fermerMenuUtilisateur();
            } else {
                ouvrirMenuUtilisateur();
            }
        }
    );

    panneau.addEventListener(
        "click",
        function (evenement) {
            evenement.stopPropagation();
        }
    );

    document.addEventListener(
        "click",
        function () {
            fermerMenuUtilisateur();
        }
    );

    document.addEventListener(
        "keydown",
        function (evenement) {
            if (evenement.key === "Escape") {
                fermerMenuUtilisateur();

                bouton.focus();
            }
        }
    );

    /*
     * Le bouton de déconnexion est créé après le
     * chargement de deconnexion-supabase.js.
     * On lui ajoute donc son fonctionnement ici.
     */
    const boutonDeconnexion = panneau.querySelector(
        "[data-deconnexion-supabase]"
    );

    boutonDeconnexion?.addEventListener(
        "click",
        deconnecterDepuisMenuUtilisateur
    );
}

function ouvrirMenuUtilisateur() {
    const bouton = document.querySelector(
        "#bouton-menu-utilisateur"
    );

    const panneau = document.querySelector(
        "#panneau-menu-utilisateur"
    );

    if (
        !bouton ||
        !panneau
    ) {
        return;
    }

    panneau.hidden = false;

    bouton.setAttribute(
        "aria-expanded",
        "true"
    );

    document.body.classList.add(
        "menu-utilisateur-ouvert"
    );

    const premierLien = panneau.querySelector(
        'a, button:not([hidden])'
    );

    window.setTimeout(
        function () {
            premierLien?.focus();
        },
        0
    );
}

function fermerMenuUtilisateur() {
    const bouton = document.querySelector(
        "#bouton-menu-utilisateur"
    );

    const panneau = document.querySelector(
        "#panneau-menu-utilisateur"
    );

    if (
        !bouton ||
        !panneau
    ) {
        return;
    }

    panneau.hidden = true;

    bouton.setAttribute(
        "aria-expanded",
        "false"
    );

    document.body.classList.remove(
        "menu-utilisateur-ouvert"
    );
}

async function deconnecterDepuisMenuUtilisateur(
    evenement
) {
    const bouton =
        evenement.currentTarget;

    if (
        !bouton ||
        bouton.disabled
    ) {
        return;
    }

    bouton.disabled = true;

    bouton.innerHTML = `
        <span aria-hidden="true">
            …
        </span>

        Déconnexion…
    `;

    try {
        if (
            typeof deconnexionSupabase ===
            "function"
        ) {
            await deconnexionSupabase();
        } else {
            const { error } =
                await supabaseClient.auth.signOut();

            if (error) {
                throw error;
            }
        }

        window.location.replace(
            "./connexion.html"
        );
    } catch (erreur) {
        console.error(
            "Déconnexion depuis le menu impossible :",
            erreur
        );

        bouton.disabled = false;

        bouton.innerHTML = `
            <span aria-hidden="true">
                ↪
            </span>

            Déconnexion
        `;

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                "La déconnexion a échoué.",
                "erreur",
                5000
            );
        }
    }
}

function creerContenuAvatarMenuUtilisateur(
    avatarUrl,
    nom
) {
    if (avatarUrl) {
        return `
            <img
                src="${securiserTexteMenuUtilisateur(
                    avatarUrl
                )}"
                alt=""
                referrerpolicy="no-referrer"
            >
        `;
    }

    return `
        <span aria-hidden="true">
            ${securiserTexteMenuUtilisateur(
                creerInitialesMenuUtilisateur(
                    nom
                )
            )}
        </span>
    `;
}

function obtenirNomDiscordUtilisateur(
    utilisateur
) {
    return (
        utilisateur?.user_metadata?.full_name ||
        utilisateur?.user_metadata?.name ||
        utilisateur?.user_metadata?.preferred_username ||
        utilisateur?.user_metadata?.user_name ||
        "Membre"
    );
}

function obtenirAvatarDiscordUtilisateur(
    utilisateur
) {
    return (
        utilisateur?.user_metadata?.avatar_url ||
        utilisateur?.user_metadata?.picture ||
        ""
    );
}

function formaterRoleMenuUtilisateur(role) {
    const roles = {
        eleve: "Élève",
        parent: "Parent",
        professeur: "Professeur",
        personnel: "Personnel",
        administrateur: "Administrateur"
    };

    return roles[role] || "Membre";
}

function creerInitialesMenuUtilisateur(nom) {
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

function supprimerAncienMenuUtilisateur() {
    document
        .querySelector(
            "#menu-utilisateur"
        )
        ?.remove();
}

function securiserTexteMenuUtilisateur(
    valeur
) {
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
