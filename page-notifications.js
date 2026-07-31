document.addEventListener(
    "DOMContentLoaded",
    function () {
        initialiserPageNotifications();
    }
);

let notificationsPage = [];
let filtreNotificationsPage = "toutes";
let actionNotificationsPageEnCours = false;

async function initialiserPageNotifications() {
    activerEvenementsPageNotifications();

    try {
        const session = await protegerPageSupabase();

        if (!session) {
            return;
        }

        await chargerNotificationsPage();
    } catch (erreur) {
        console.error(
            "Initialisation des notifications impossible :",
            erreur
        );

        afficherErreurChargementNotificationsPage(
            obtenirMessageErreurNotificationsPage(
                erreur
            )
        );
    }
}

function activerEvenementsPageNotifications() {
    const champRecherche = document.querySelector(
        "#recherche-notifications-page"
    );

    const boutonsFiltres = document.querySelectorAll(
        "[data-filtre-notification]"
    );

    const boutonToutLire = document.querySelector(
        "#marquer-toutes-lues-page"
    );

    const boutonSupprimerLues = document.querySelector(
        "#supprimer-notifications-lues-page"
    );

    champRecherche?.addEventListener(
        "input",
        actualiserAffichageNotificationsPage
    );

    boutonsFiltres.forEach(function (bouton) {
        bouton.addEventListener(
            "click",
            function () {
                filtreNotificationsPage =
                    bouton.dataset.filtreNotification ||
                    "toutes";

                boutonsFiltres.forEach(
                    function (autreBouton) {
                        autreBouton.classList.remove(
                            "actif"
                        );
                    }
                );

                bouton.classList.add("actif");

                actualiserAffichageNotificationsPage();
            }
        );
    });

    boutonToutLire?.addEventListener(
        "click",
        marquerToutesLuesDepuisPage
    );

    boutonSupprimerLues?.addEventListener(
        "click",
        supprimerToutesLuesDepuisPage
    );

    document.addEventListener(
        "notificationsSupabaseActualisees",
        function () {
            if (!actionNotificationsPageEnCours) {
                chargerNotificationsPage({
                    silencieux: true
                });
            }
        }
    );
}

async function chargerNotificationsPage(
    options = {}
) {
    const conteneur = document.querySelector(
        "#liste-notifications-page"
    );

    if (!conteneur) {
        return;
    }

    if (!options.silencieux) {
        conteneur.setAttribute(
            "aria-busy",
            "true"
        );

        conteneur.innerHTML = `
            <p class="chargement-notifications-page">
                Chargement des notifications…
            </p>
        `;
    }

    try {
        notificationsPage =
            await obtenirNotificationsSupabase({
                limite: 100
            });

        afficherResumeNotificationsPage();
        actualiserAffichageNotificationsPage();

        conteneur.setAttribute(
            "aria-busy",
            "false"
        );
    } catch (erreur) {
        console.error(
            "Chargement des notifications impossible :",
            erreur
        );

        conteneur.setAttribute(
            "aria-busy",
            "false"
        );

        afficherErreurChargementNotificationsPage(
            obtenirMessageErreurNotificationsPage(
                erreur
            )
        );
    }
}

function afficherResumeNotificationsPage() {
    const total = notificationsPage.length;

    const nonLues = notificationsPage.filter(
        function (notification) {
            return notification.lue !== true;
        }
    ).length;

    const lues = total - nonLues;

    definirTexteNotificationsPage(
        "#total-notifications-page",
        String(total)
    );

    definirTexteNotificationsPage(
        "#notifications-non-lues-page",
        String(nonLues)
    );

    definirTexteNotificationsPage(
        "#notifications-lues-page",
        String(lues)
    );

    const boutonToutLire = document.querySelector(
        "#marquer-toutes-lues-page"
    );

    const boutonSupprimerLues = document.querySelector(
        "#supprimer-notifications-lues-page"
    );

    if (boutonToutLire) {
        boutonToutLire.disabled =
            nonLues === 0;
    }

    if (boutonSupprimerLues) {
        boutonSupprimerLues.disabled =
            lues === 0;
    }
}

function actualiserAffichageNotificationsPage() {
    const champRecherche = document.querySelector(
        "#recherche-notifications-page"
    );

    const recherche =
        normaliserTexteNotificationsPage(
            champRecherche?.value || ""
        );

    const notificationsFiltrees =
        notificationsPage.filter(
            function (notification) {
                return notificationCorrespondFiltrePage(
                    notification
                );
            }
        ).filter(
            function (notification) {
                if (!recherche) {
                    return true;
                }

                const contenu = [
                    notification.type,
                    notification.titre,
                    notification.message,
                    notification.reference_transaction,
                    notification.cree_le
                ]
                    .filter(Boolean)
                    .join(" ");

                return normaliserTexteNotificationsPage(
                    contenu
                ).includes(recherche);
            }
        );

    afficherTitreListeNotificationsPage(
        notificationsFiltrees.length
    );

    afficherListeNotificationsPage(
        notificationsFiltrees
    );
}

function notificationCorrespondFiltrePage(
    notification
) {
    if (
        filtreNotificationsPage ===
        "toutes"
    ) {
        return true;
    }

    if (
        filtreNotificationsPage ===
        "non-lues"
    ) {
        return notification.lue !== true;
    }

    if (
        filtreNotificationsPage ===
        "lues"
    ) {
        return notification.lue === true;
    }

    if (
        filtreNotificationsPage ===
        "administration"
    ) {
        return [
            "administration",
            "role",
            "suspension",
            "reactivation",
            "annonce"
        ].includes(notification.type);
    }

    return (
        notification.type ===
        filtreNotificationsPage
    );
}

function afficherTitreListeNotificationsPage(
    nombreResultats
) {
    const titres = {
        toutes: "Toutes les notifications",
        "non-lues": "Notifications non lues",
        lues: "Notifications lues",
        virement: "Notifications de virements",
        salaire: "Notifications de salaires",
        administration:
            "Notifications administratives"
    };

    const titre = document.querySelector(
        "#titre-liste-notifications-page"
    );

    if (!titre) {
        return;
    }

    titre.textContent =
        `${titres[filtreNotificationsPage] ||
            "Notifications"} (${nombreResultats})`;
}

function afficherListeNotificationsPage(
    notifications
) {
    const conteneur = document.querySelector(
        "#liste-notifications-page"
    );

    if (!conteneur) {
        return;
    }

    if (
        !Array.isArray(notifications) ||
        notifications.length === 0
    ) {
        conteneur.innerHTML = `
            <div class="aucune-notification-page">
                <span aria-hidden="true">
                    🔔
                </span>

                <h3>
                    Aucune notification
                </h3>

                <p>
                    Aucune notification ne correspond
                    aux critères sélectionnés.
                </p>
            </div>
        `;

        return;
    }

    conteneur.innerHTML = notifications
        .map(function (notification) {
            return creerHTMLNotificationPage(
                notification
            );
        })
        .join("");

    activerActionsNotificationsPage();
}

function creerHTMLNotificationPage(
    notification
) {
    const estLue =
        notification.lue === true;

    const reference = notification
        .reference_transaction
        ? `
            <span class="reference-notification-page">
                Référence :
                ${securiserTexteNotificationsPage(
                    notification
                        .reference_transaction
                )}
            </span>
        `
        : "";

    const boutonLien =
        lienNotificationPageAutorise(
            notification.lien
        )
            ? `
                <button
                    class="action-notification-page ouvrir"
                    type="button"
                    data-action-notification="ouvrir"
                >
                    Ouvrir
                </button>
            `
            : "";

    return `
        <article
            class="
                notification-page
                ${estLue ? "lue" : "non-lue"}
            "
            data-notification-id="${securiserTexteNotificationsPage(
                notification.id
            )}"
        >
            <div
                class="
                    icone-notification-page
                    type-${securiserTexteNotificationsPage(
                        notification.type
                    )}
                "
                aria-hidden="true"
            >
                ${obtenirIconeNotificationsPage(
                    notification.type
                )}
            </div>

            <div class="contenu-notification-page">
                <div class="entete-notification-page">
                    <div>
                        <span class="type-notification-page">
                            ${securiserTexteNotificationsPage(
                                formaterTypeNotificationsPage(
                                    notification.type
                                )
                            )}
                        </span>

                        <h3>
                            ${securiserTexteNotificationsPage(
                                notification.titre
                            )}
                        </h3>
                    </div>

                    ${
                        estLue
                            ? `
                                <span class="badge-notification-lue">
                                    Lue
                                </span>
                            `
                            : `
                                <span class="badge-notification-non-lue">
                                    Non lue
                                </span>
                            `
                    }
                </div>

                <p>
                    ${securiserTexteNotificationsPage(
                        notification.message
                    )}
                </p>

                <div class="informations-notification-page">
                    <time datetime="${securiserTexteNotificationsPage(
                        notification.cree_le
                    )}">
                        ${formaterDateNotificationsPage(
                            notification.cree_le
                        )}
                    </time>

                    ${reference}
                </div>

                <div class="actions-notification-page">
                    ${boutonLien}

                    <button
                        class="action-notification-page lecture"
                        type="button"
                        data-action-notification="${
                            estLue
                                ? "non-lue"
                                : "lue"
                        }"
                    >
                        ${
                            estLue
                                ? "Marquer comme non lue"
                                : "Marquer comme lue"
                        }
                    </button>

                    <button
                        class="action-notification-page supprimer"
                        type="button"
                        data-action-notification="supprimer"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </article>
    `;
}

function activerActionsNotificationsPage() {
    document
        .querySelectorAll(
            "[data-action-notification]"
        )
        .forEach(function (bouton) {
            bouton.addEventListener(
                "click",
                traiterActionNotificationPage
            );
        });
}

async function traiterActionNotificationPage(
    evenement
) {
    const bouton = evenement.currentTarget;

    const article = bouton.closest(
        "[data-notification-id]"
    );

    const notificationId =
        article?.dataset.notificationId;

    const action =
        bouton.dataset.actionNotification;

    if (
        !notificationId ||
        !action ||
        bouton.disabled
    ) {
        return;
    }

    const notification =
        notificationsPage.find(
            function (element) {
                return (
                    element.id ===
                    notificationId
                );
            }
        );

    if (!notification) {
        return;
    }

    if (action === "ouvrir") {
        await ouvrirNotificationPage(
            notification
        );

        return;
    }

    if (action === "supprimer") {
        await demanderSuppressionNotificationPage(
            notification,
            bouton
        );

        return;
    }

    if (action === "lue") {
        await modifierLectureNotificationPage(
            notification,
            true,
            bouton
        );

        return;
    }

    if (action === "non-lue") {
        await modifierLectureNotificationPage(
            notification,
            false,
            bouton
        );
    }
}

async function ouvrirNotificationPage(
    notification
) {
    try {
        if (!notification.lue) {
            await marquerNotificationLueSupabase(
                notification.id
            );

            notification.lue = true;
            notification.lue_le =
                new Date().toISOString();
        }

        if (
            lienNotificationPageAutorise(
                notification.lien
            )
        ) {
            window.location.href =
                notification.lien;

            return;
        }

        afficherResumeNotificationsPage();
        actualiserAffichageNotificationsPage();
    } catch (erreur) {
        console.error(
            "Ouverture de la notification impossible :",
            erreur
        );

        afficherMessageNotificationsPage(
            obtenirMessageErreurNotificationsPage(
                erreur
            ),
            "erreur"
        );
    }
}

async function modifierLectureNotificationPage(
    notification,
    marquerLue,
    bouton
) {
    if (actionNotificationsPageEnCours) {
        return;
    }

    actionNotificationsPageEnCours = true;
    bouton.disabled = true;

    const texteOriginal = bouton.textContent;

    bouton.textContent = "Mise à jour…";

    try {
        if (marquerLue) {
            await marquerNotificationLueSupabase(
                notification.id
            );

            notification.lue = true;
            notification.lue_le =
                new Date().toISOString();
        } else {
            await marquerNotificationNonLueSupabase(
                notification.id
            );

            notification.lue = false;
            notification.lue_le = null;
        }

        afficherResumeNotificationsPage();
        actualiserAffichageNotificationsPage();

        afficherMessageNotificationsPage(
            marquerLue
                ? "La notification a été marquée comme lue."
                : "La notification a été marquée comme non lue.",
            "succes"
        );
    } catch (erreur) {
        console.error(
            "Modification de la notification impossible :",
            erreur
        );

        bouton.disabled = false;
        bouton.textContent = texteOriginal;

        afficherMessageNotificationsPage(
            obtenirMessageErreurNotificationsPage(
                erreur
            ),
            "erreur"
        );
    } finally {
        actionNotificationsPageEnCours = false;
    }
}

async function demanderSuppressionNotificationPage(
    notification,
    bouton
) {
    const confirmation = window.confirm(
        "Voulez-vous supprimer cette notification ?\n\n" +
        notification.titre
    );

    if (!confirmation) {
        return;
    }

    if (actionNotificationsPageEnCours) {
        return;
    }

    actionNotificationsPageEnCours = true;

    bouton.disabled = true;
    bouton.textContent = "Suppression…";

    try {
        await supprimerNotificationSupabase(
            notification.id
        );

        notificationsPage =
            notificationsPage.filter(
                function (element) {
                    return (
                        element.id !==
                        notification.id
                    );
                }
            );

        afficherResumeNotificationsPage();
        actualiserAffichageNotificationsPage();

        afficherMessageNotificationsPage(
            "La notification a été supprimée.",
            "succes"
        );
    } catch (erreur) {
        console.error(
            "Suppression de la notification impossible :",
            erreur
        );

        bouton.disabled = false;
        bouton.textContent = "Supprimer";

        afficherMessageNotificationsPage(
            obtenirMessageErreurNotificationsPage(
                erreur
            ),
            "erreur"
        );
    } finally {
        actionNotificationsPageEnCours = false;
    }
}

async function marquerToutesLuesDepuisPage() {
    const bouton = document.querySelector(
        "#marquer-toutes-lues-page"
    );

    if (
        !bouton ||
        bouton.disabled ||
        actionNotificationsPageEnCours
    ) {
        return;
    }

    const nombreNonLues =
        notificationsPage.filter(
            function (notification) {
                return notification.lue !== true;
            }
        ).length;

    if (nombreNonLues === 0) {
        return;
    }

    actionNotificationsPageEnCours = true;

    bouton.disabled = true;
    bouton.textContent = "Mise à jour…";

    try {
        await marquerToutesNotificationsLuesSupabase();

        const dateLecture =
            new Date().toISOString();

        notificationsPage.forEach(
            function (notification) {
                notification.lue = true;
                notification.lue_le =
                    dateLecture;
            }
        );

        afficherResumeNotificationsPage();
        actualiserAffichageNotificationsPage();

        afficherMessageNotificationsPage(
            `${nombreNonLues} notification(s) marquée(s) comme lue(s).`,
            "succes"
        );
    } catch (erreur) {
        console.error(
            "Mise à jour globale impossible :",
            erreur
        );

        afficherMessageNotificationsPage(
            obtenirMessageErreurNotificationsPage(
                erreur
            ),
            "erreur"
        );
    } finally {
        actionNotificationsPageEnCours = false;

        bouton.textContent =
            "Tout marquer comme lu";

        afficherResumeNotificationsPage();
    }
}

async function supprimerToutesLuesDepuisPage() {
    const bouton = document.querySelector(
        "#supprimer-notifications-lues-page"
    );

    if (
        !bouton ||
        bouton.disabled ||
        actionNotificationsPageEnCours
    ) {
        return;
    }

    const nombreLues =
        notificationsPage.filter(
            function (notification) {
                return notification.lue === true;
            }
        ).length;

    if (nombreLues === 0) {
        return;
    }

    const confirmation = window.confirm(
        "Voulez-vous supprimer toutes les notifications lues ?\n\n" +
        `${nombreLues} notification(s) seront supprimée(s).`
    );

    if (!confirmation) {
        return;
    }

    actionNotificationsPageEnCours = true;

    bouton.disabled = true;
    bouton.textContent = "Suppression…";

    try {
        const nombreSupprime =
            await supprimerNotificationsLuesSupabase();

        notificationsPage =
            notificationsPage.filter(
                function (notification) {
                    return notification.lue !== true;
                }
            );

        afficherResumeNotificationsPage();
        actualiserAffichageNotificationsPage();

        afficherMessageNotificationsPage(
            `${nombreSupprime} notification(s) supprimée(s).`,
            "succes"
        );
    } catch (erreur) {
        console.error(
            "Suppression globale impossible :",
            erreur
        );

        afficherMessageNotificationsPage(
            obtenirMessageErreurNotificationsPage(
                erreur
            ),
            "erreur"
        );
    } finally {
        actionNotificationsPageEnCours = false;

        bouton.textContent =
            "Supprimer les notifications lues";

        afficherResumeNotificationsPage();
    }
}

function afficherErreurChargementNotificationsPage(
    message
) {
    const conteneur = document.querySelector(
        "#liste-notifications-page"
    );

    if (!conteneur) {
        return;
    }

    conteneur.innerHTML = `
        <div class="aucune-notification-page erreur">
            <span aria-hidden="true">
                ⚠️
            </span>

            <h3>
                Chargement impossible
            </h3>

            <p>
                ${securiserTexteNotificationsPage(
                    message
                )}
            </p>

            <button
                class="bouton"
                id="reessayer-notifications-page"
                type="button"
            >
                Réessayer
            </button>
        </div>
    `;

    document
        .querySelector(
            "#reessayer-notifications-page"
        )
        ?.addEventListener(
            "click",
            function () {
                chargerNotificationsPage();
            }
        );
}

function afficherMessageNotificationsPage(
    message,
    type
) {
    const conteneur = document.querySelector(
        "#message-notifications-page"
    );

    if (!conteneur) {
        return;
    }

    conteneur.hidden = false;

    conteneur.className =
        `message-action-admin ${type}`;

    conteneur.textContent = message;
}

function definirTexteNotificationsPage(
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

function obtenirIconeNotificationsPage(
    type
) {
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

function formaterTypeNotificationsPage(
    type
) {
    const types = {
        information: "Information",
        virement: "Virement",
        salaire: "Salaire",
        achat: "Achat",
        administration: "Administration",
        role: "Changement de rôle",
        suspension: "Suspension",
        reactivation: "Réactivation",
        annonce: "Annonce"
    };

    return types[type] || "Notification";
}

function formaterDateNotificationsPage(
    dateTexte
) {
    const date = new Date(dateTexte);

    if (Number.isNaN(date.getTime())) {
        return "Date inconnue";
    }

    return date.toLocaleString(
        "fr-FR",
        {
            dateStyle: "long",
            timeStyle: "short"
        }
    );
}

function normaliserTexteNotificationsPage(
    texte
) {
    return String(texte || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();
}

function lienNotificationPageAutorise(
    lien
) {
    return (
        typeof lien === "string" &&
        /^\.\/[a-zA-Z0-9_-]+\.html([?#].*)?$/.test(
            lien
        )
    );
}

function obtenirMessageErreurNotificationsPage(
    erreur
) {
    const message = String(
        erreur?.message || ""
    );

    const messageNormalise =
        message.toLowerCase();

    if (
        messageNormalise.includes(
            "vous devez être connecté"
        ) ||
        messageNormalise.includes("jwt")
    ) {
        return (
            "Votre session a expiré. Reconnectez-vous."
        );
    }

    if (
        messageNormalise.includes(
            "row-level security"
        ) ||
        messageNormalise.includes(
            "permission denied"
        )
    ) {
        return (
            "Vous n’êtes pas autorisé à modifier cette notification."
        );
    }

    if (
        messageNormalise.includes(
            "introuvable"
        )
    ) {
        return (
            "La notification est introuvable."
        );
    }

    return (
        message ||
        "Une erreur est survenue avec les notifications."
    );
}

function securiserTexteNotificationsPage(
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
