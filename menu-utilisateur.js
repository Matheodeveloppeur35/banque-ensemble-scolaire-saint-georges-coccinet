document.addEventListener(
    "DOMContentLoaded",
    function () {
        initialiserMenuUtilisateur();
    }
);

let actualiserCompteurNotificationsMenu = null;

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

        const profil =
            await chargerProfilMenuUtilisateur(
                session.user
            );

        creerMenuUtilisateur(
            navigation,
            session.user,
            profil
        );

        activerMenuUtilisateur();
        activerClocheNotificationsMenu();

        if (
            typeof demarrerActualisationNotificationsSupabase ===
            "function"
        ) {
            actualiserCompteurNotificationsMenu =
                demarrerActualisationNotificationsSupabase(
                    afficherCompteurNotificationsMenu,
                    60000
                );
        }
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
        "zone-utilisateur";

    conteneur.id =
        "zone-utilisateur";

    conteneur.innerHTML = `
        <div class="notifications-menu-utilisateur">
            <button
                class="bouton-notifications-menu"
                id="bouton-notifications-menu"
                type="button"
                aria-label="Ouvrir les notifications"
                aria-haspopup="true"
                aria-expanded="false"
                aria-controls="panneau-notifications-menu"
            >
                <span
                    class="icone-cloche-menu"
                    aria-hidden="true"
                >
                    🔔
                </span>

                <span
                    class="compteur-notifications-menu"
                    id="compteur-notifications-menu"
                    aria-label="0 notification non lue"
                    hidden
                >
                    0
                </span>
            </button>

            <div
                class="panneau-notifications-menu"
                id="panneau-notifications-menu"
                role="dialog"
                aria-label="Notifications récentes"
                hidden
            >
                <div class="entete-notifications-menu">
                    <div>
                        <p class="petit-titre">
                            Centre de notifications
                        </p>

                        <strong>
                            Notifications récentes
                        </strong>
                    </div>

                    <button
                        class="fermer-notifications-menu"
                        type="button"
                        data-fermer-notifications
                        aria-label="Fermer les notifications"
                    >
                        ×
                    </button>
                </div>

                <div
                    class="liste-notifications-menu"
                    id="liste-notifications-menu"
                    aria-live="polite"
                >
                    <p class="chargement-notifications-menu">
                        Chargement…
                    </p>
                </div>

                <div class="actions-notifications-menu">
                    <button
                        class="marquer-notifications-lues-menu"
                        id="marquer-notifications-lues-menu"
                        type="button"
                    >
                        Tout marquer comme lu
                    </button>

                    <a
                        href="./notifications.html"
                        class="voir-notifications-menu"
                    >
                        Voir toutes les notifications
                    </a>
                </div>
            </div>
        </div>

        <div
            class="menu-utilisateur"
            id="menu-utilisateur"
        >
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
                    <span
                        class="avatar-menu-utilisateur grand"
                    >
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
                    href="./notifications.html"
                    role="menuitem"
                >
                    <span aria-hidden="true">
                        🔔
                    </span>

                    Notifications
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
        </div>
    `;

    navigation.appendChild(
        conteneur
    );
}

function activerMenuUtilisateur() {
    const bouton = document.querySelector(
        "#bouton-menu-utilisateur"
    );

    const panneau = document.querySelector(
        "#panneau-menu-utilisateur"
    );

    if (!bouton || !panneau) {
        return;
    }

    bouton.addEventListener(
        "click",
        function (evenement) {
            evenement.stopPropagation();

            fermerNotificationsMenu();

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

    const boutonDeconnexion = panneau.querySelector(
        "[data-deconnexion-supabase]"
    );

    boutonDeconnexion?.addEventListener(
        "click",
        deconnecterDepuisMenuUtilisateur
    );
}

function activerClocheNotificationsMenu() {
    const bouton = document.querySelector(
        "#bouton-notifications-menu"
    );

    const panneau = document.querySelector(
        "#panneau-notifications-menu"
    );

    const boutonFermer = panneau?.querySelector(
        "[data-fermer-notifications]"
    );

    const boutonToutLire = document.querySelector(
        "#marquer-notifications-lues-menu"
    );

    if (!bouton || !panneau) {
        return;
    }

    bouton.addEventListener(
        "click",
        async function (evenement) {
            evenement.stopPropagation();

            fermerMenuUtilisateur();

            const ouvert =
                bouton.getAttribute(
                    "aria-expanded"
                ) === "true";

            if (ouvert) {
                fermerNotificationsMenu();
                return;
            }

            ouvrirNotificationsMenu();

            await chargerApercuNotificationsMenu();
        }
    );

    panneau.addEventListener(
        "click",
        function (evenement) {
            evenement.stopPropagation();
        }
    );

    boutonFermer?.addEventListener(
        "click",
        fermerNotificationsMenu
    );

    boutonToutLire?.addEventListener(
        "click",
        marquerToutesNotificationsLuesMenu
    );

    document.addEventListener(
        "click",
        function () {
            fermerMenuUtilisateur();
            fermerNotificationsMenu();
        }
    );

    document.addEventListener(
        "keydown",
        function (evenement) {
            if (evenement.key === "Escape") {
                fermerMenuUtilisateur();
                fermerNotificationsMenu();
            }
        }
    );

    document.addEventListener(
        "compteurNotificationsSupabaseActualise",
        function (evenement) {
            afficherCompteurNotificationsMenu(
                evenement.detail?.nombre || 0
            );
        }
    );

    document.addEventListener(
        "notificationsSupabaseActualisees",
        function () {
            if (!panneau.hidden) {
                chargerApercuNotificationsMenu();
            }
        }
    );
}

async function chargerApercuNotificationsMenu() {
    const conteneur = document.querySelector(
        "#liste-notifications-menu"
    );

    if (!conteneur) {
        return;
    }

    conteneur.innerHTML = `
        <p class="chargement-notifications-menu">
            Chargement…
        </p>
    `;

    try {
        if (
            typeof obtenirNotificationsSupabase !==
            "function"
        ) {
            throw new Error(
                "Le service de notifications est indisponible."
            );
        }

        const notifications =
            await obtenirNotificationsSupabase({
                limite: 5
            });

        afficherApercuNotificationsMenu(
            notifications
        );

        const nombre =
            await compterNotificationsNonLuesSupabase();

        afficherCompteurNotificationsMenu(
            nombre
        );
    } catch (erreur) {
        console.error(
            "Chargement des notifications impossible :",
            erreur
        );

        conteneur.innerHTML = `
            <p class="aucune-notification-menu">
                Impossible de charger les notifications.
            </p>
        `;
    }
}

function afficherApercuNotificationsMenu(
    notifications
) {
    const conteneur = document.querySelector(
        "#liste-notifications-menu"
    );

    if (!conteneur) {
        return;
    }

    if (
        !Array.isArray(notifications) ||
        notifications.length === 0
    ) {
        conteneur.innerHTML = `
            <p class="aucune-notification-menu">
                Vous n’avez aucune notification.
            </p>
        `;

        return;
    }

    conteneur.innerHTML = notifications
        .map(function (notification) {
            const classeLecture =
                notification.lue
                    ? "lue"
                    : "non-lue";

            return `
                <article
                    class="
                        notification-menu
                        ${classeLecture}
                    "
                    data-notification-id="${securiserTexteMenuUtilisateur(
                        notification.id
                    )}"
                >
                    <button
                        class="contenu-notification-menu"
                        type="button"
                        data-ouvrir-notification
                    >
                        <span
                            class="icone-notification-menu"
                            aria-hidden="true"
                        >
                            ${obtenirIconeNotificationMenu(
                                notification.type
                            )}
                        </span>

                        <span class="texte-notification-menu">
                            <strong>
                                ${securiserTexteMenuUtilisateur(
                                    notification.titre
                                )}
                            </strong>

                            <span>
                                ${securiserTexteMenuUtilisateur(
                                    notification.message
                                )}
                            </span>

                            <time>
                                ${formaterDateNotificationMenu(
                                    notification.cree_le
                                )}
                            </time>
                        </span>

                        ${
                            !notification.lue
                                ? `
                                    <span
                                        class="point-notification-non-lue"
                                        aria-label="Non lue"
                                    ></span>
                                `
                                : ""
                        }
                    </button>
                </article>
            `;
        })
        .join("");

    conteneur
        .querySelectorAll(
            "[data-ouvrir-notification]"
        )
        .forEach(function (bouton) {
            bouton.addEventListener(
                "click",
                ouvrirNotificationDepuisMenu
            );
        });
}

async function ouvrirNotificationDepuisMenu(
    evenement
) {
    const article =
        evenement.currentTarget.closest(
            "[data-notification-id]"
        );

    const notificationId =
        article?.dataset.notificationId;

    if (!notificationId) {
        return;
    }

    try {
        const notification =
            await obtenirNotificationSupabase(
                notificationId
            );

        if (!notification) {
            return;
        }

        if (!notification.lue) {
            await marquerNotificationLueSupabase(
                notificationId
            );
        }

        if (
            lienNotificationAutorise(
                notification.lien
            )
        ) {
            window.location.href =
                notification.lien;

            return;
        }

        await chargerApercuNotificationsMenu();
    } catch (erreur) {
        console.error(
            "Ouverture de la notification impossible :",
            erreur
        );
    }
}

async function marquerToutesNotificationsLuesMenu() {
    const bouton = document.querySelector(
        "#marquer-notifications-lues-menu"
    );

    if (!bouton || bouton.disabled) {
        return;
    }

    bouton.disabled = true;
    bouton.textContent = "Mise à jour…";

    try {
        await marquerToutesNotificationsLuesSupabase();

        afficherCompteurNotificationsMenu(0);
        await chargerApercuNotificationsMenu();
    } catch (erreur) {
        console.error(
            "Mise à jour des notifications impossible :",
            erreur
        );
    } finally {
        bouton.disabled = false;
        bouton.textContent =
            "Tout marquer comme lu";
    }
}

function afficherCompteurNotificationsMenu(
    nombre
) {
    const compteur = document.querySelector(
        "#compteur-notifications-menu"
    );

    const bouton = document.querySelector(
        "#bouton-notifications-menu"
    );

    if (!compteur || !bouton) {
        return;
    }

    const total = Math.max(
        Number(nombre) || 0,
        0
    );

    compteur.textContent =
        total > 99
            ? "99+"
            : String(total);

    compteur.hidden =
        total === 0;

    compteur.setAttribute(
        "aria-label",
        `${total} notification(s) non lue(s)`
    );

    bouton.setAttribute(
        "aria-label",
        total === 0
            ? "Ouvrir les notifications"
            : `Ouvrir les notifications, ${total} non lue(s)`
    );

    bouton.classList.toggle(
        "avec-notifications",
        total > 0
    );
}

function ouvrirNotificationsMenu() {
    const bouton = document.querySelector(
        "#bouton-notifications-menu"
    );

    const panneau = document.querySelector(
        "#panneau-notifications-menu"
    );

    if (!bouton || !panneau) {
        return;
    }

    panneau.hidden = false;

    bouton.setAttribute(
        "aria-expanded",
        "true"
    );
}

function fermerNotificationsMenu() {
    const bouton = document.querySelector(
        "#bouton-notifications-menu"
    );

    const panneau = document.querySelector(
        "#panneau-notifications-menu"
    );

    if (!bouton || !panneau) {
        return;
    }

    panneau.hidden = true;

    bouton.setAttribute(
        "aria-expanded",
        "false"
    );
}

function ouvrirMenuUtilisateur() {
    const bouton = document.querySelector(
        "#bouton-menu-utilisateur"
    );

    const panneau = document.querySelector(
        "#panneau-menu-utilisateur"
    );

    if (!bouton || !panneau) {
        return;
    }

    panneau.hidden = false;

    bouton.setAttribute(
        "aria-expanded",
        "true"
    );
}

function fermerMenuUtilisateur() {
    const bouton = document.querySelector(
        "#bouton-menu-utilisateur"
    );

    const panneau = document.querySelector(
        "#panneau-menu-utilisateur"
    );

    if (!bouton || !panneau) {
        return;
    }

    panneau.hidden = true;

    bouton.setAttribute(
        "aria-expanded",
        "false"
    );
}

async function deconnecterDepuisMenuUtilisateur(
    evenement
) {
    const bouton = evenement.currentTarget;

    if (!bouton || bouton.disabled) {
        return;
    }

    bouton.disabled = true;
    bouton.textContent = "Déconnexion…";

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
            "Déconnexion impossible :",
            erreur
        );

        bouton.disabled = false;
        bouton.textContent = "Déconnexion";
    }
}

function lienNotificationAutorise(lien) {
    return (
        typeof lien === "string" &&
        /^\.\/[a-zA-Z0-9_-]+\.html([?#].*)?$/.test(
            lien
        )
    );
}

function obtenirIconeNotificationMenu(type) {
    const icones = {
        information: "ℹ️",
        virement: "🔄",
        salaire: "💰",
        achat: "🛍️",
        administration: "🛡️",
        role: "🪪",
        suspension: "🔒",
        reactivation: "🔓",
        annonce: "📢"
    };

    return icones[type] || "🔔";
}

function formaterDateNotificationMenu(dateTexte) {
    const date = new Date(dateTexte);

    if (Number.isNaN(date.getTime())) {
        return "Date inconnue";
    }

    return date.toLocaleString(
        "fr-FR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );
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
        utilisateur?.user_metadata
            ?.preferred_username ||
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
            "#zone-utilisateur"
        )
        ?.remove();

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
