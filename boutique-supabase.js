const catalogueBoutiqueSupabase = {
    "kit-scolaire": {
        nom: "Kit scolaire complet",
        prixCentimes: 3500
    },

    cafeteria: {
        nom: "Formule cafétéria",
        prixCentimes: 1250
    },

    "sortie-scolaire": {
        nom: "Sortie scolaire",
        prixCentimes: 8000
    },

    "casier-scolaire": {
        nom: "Casier scolaire",
        prixCentimes: 10000
    },

    "club-scolaire": {
        nom: "Inscription à un club",
        prixCentimes: 4000
    },

    "evenement-scolaire": {
        nom: "Billet pour un événement",
        prixCentimes: 2000
    }
};

let achatBoutiqueEnCours = false;

async function initialiserBoutiqueSupabase() {
    try {
        const session = await protegerPageSupabase();

        if (!session) {
            return;
        }

        await actualiserSoldeBoutiqueSupabase();
        activerFiltresBoutiqueSupabase();
        activerAchatsBoutiqueSupabase();
    } catch (erreur) {
        console.error(
            "Initialisation de la boutique impossible :",
            erreur
        );

        afficherErreurBoutiqueSupabase(
            "Impossible de charger la boutique."
        );
    }
}

async function actualiserSoldeBoutiqueSupabase() {
    const affichage = document.querySelector(
        "#solde-boutique"
    );

    if (!affichage) {
        return;
    }

    try {
        const compte =
            await obtenirCompteSupabase();

        if (!compte) {
            throw new Error(
                "Compte bancaire introuvable."
            );
        }

        affichage.textContent =
            formaterEurosSupabase(
                compte.solde_centimes
            );
    } catch (erreur) {
        console.error(
            "Chargement du solde impossible :",
            erreur
        );

        affichage.textContent =
            "Solde indisponible";
    }
}

function activerFiltresBoutiqueSupabase() {
    const boutonsFiltres = document.querySelectorAll(
        "[data-filtre]"
    );

    const articles = document.querySelectorAll(
        "[data-categorie]"
    );

    boutonsFiltres.forEach(function (bouton) {
        bouton.addEventListener(
            "click",
            function () {
                const filtre =
                    bouton.dataset.filtre;

                boutonsFiltres.forEach(
                    function (autreBouton) {
                        autreBouton.classList.remove(
                            "actif"
                        );
                    }
                );

                bouton.classList.add("actif");

                articles.forEach(function (article) {
                    const visible =
                        filtre === "tous" ||
                        article.dataset.categorie ===
                            filtre;

                    article.hidden = !visible;
                });
            }
        );
    });
}

function activerAchatsBoutiqueSupabase() {
    document
        .querySelectorAll("[data-article-id]")
        .forEach(function (bouton) {
            bouton.addEventListener(
                "click",
                function () {
                    preparerAchatBoutiqueSupabase(
                        bouton.dataset.articleId
                    );
                }
            );
        });
}

function preparerAchatBoutiqueSupabase(
    articleId
) {
    const article =
        catalogueBoutiqueSupabase[articleId];

    if (!article) {
        afficherErreurBoutiqueSupabase(
            "Cet article est invalide."
        );

        return;
    }

    fermerConfirmationAchatSupabase();

    const arrierePlan =
        document.createElement("div");

    arrierePlan.className =
        "arriere-plan-modal";

    arrierePlan.id =
        "modal-confirmation-achat";

    arrierePlan.innerHTML = `
        <section
            class="modal-transaction modal-achat"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-confirmation-achat"
        >
            <button
                class="fermer-modal"
                id="fermer-confirmation-achat"
                type="button"
                aria-label="Fermer"
            >
                ×
            </button>

            <p class="petit-titre">
                Confirmation de l’achat
            </p>

            <h2 id="titre-confirmation-achat">
                ${securiserTexteBoutiqueSupabase(
                    article.nom
                )}
            </h2>

            <p>
                Cet achat débitera votre véritable solde RP
                enregistré dans Supabase.
            </p>

            <div class="details-transaction">
                <div>
                    <span>Article</span>

                    <strong>
                        ${securiserTexteBoutiqueSupabase(
                            article.nom
                        )}
                    </strong>
                </div>

                <div>
                    <span>Prix</span>

                    <strong>
                        ${formaterEurosSupabase(
                            article.prixCentimes
                        )}
                    </strong>
                </div>
            </div>

            <div
                class="message-action-admin"
                id="message-confirmation-achat"
                aria-live="polite"
                hidden
            ></div>

            <div class="actions-modal-admin">
                <button
                    class="bouton-clair"
                    id="annuler-confirmation-achat"
                    type="button"
                >
                    Annuler
                </button>

                <button
                    class="bouton"
                    id="confirmer-achat-supabase"
                    type="button"
                    data-article-id="${securiserTexteBoutiqueSupabase(
                        articleId
                    )}"
                >
                    Confirmer l’achat
                </button>
            </div>
        </section>
    `;

    document.body.appendChild(arrierePlan);
    document.body.classList.add(
        "modal-ouverte"
    );

    document
        .querySelector("#fermer-confirmation-achat")
        ?.addEventListener(
            "click",
            fermerConfirmationAchatSupabase
        );

    document
        .querySelector("#annuler-confirmation-achat")
        ?.addEventListener(
            "click",
            fermerConfirmationAchatSupabase
        );

    document
        .querySelector("#confirmer-achat-supabase")
        ?.addEventListener(
            "click",
            function () {
                effectuerAchatBoutiqueSupabase(
                    articleId
                );
            }
        );

    arrierePlan.addEventListener(
        "click",
        function (evenement) {
            if (evenement.target === arrierePlan) {
                fermerConfirmationAchatSupabase();
            }
        }
    );

    document
        .querySelector("#confirmer-achat-supabase")
        ?.focus();
}

async function effectuerAchatBoutiqueSupabase(
    articleId
) {
    if (achatBoutiqueEnCours) {
        return;
    }

    const bouton = document.querySelector(
        "#confirmer-achat-supabase"
    );

    achatBoutiqueEnCours = true;

    if (bouton) {
        bouton.disabled = true;
        bouton.textContent =
            "Traitement sécurisé…";
    }

    try {
        const { data, error } =
            await supabaseClient.rpc(
                "effectuer_achat_boutique",
                {
                    p_article_id: articleId
                }
            );

        if (error) {
            throw error;
        }

        if (!data || data.succes !== true) {
            throw new Error(
                "L’achat n’a pas été confirmé."
            );
        }

        fermerConfirmationAchatSupabase();
        await actualiserSoldeBoutiqueSupabase();

        if (
            typeof afficherNotification ===
            "function"
        ) {
            afficherNotification(
                `${data.article_nom} acheté pour ` +
                `${formaterEurosSupabase(
                    data.prix_centimes
                )}. Nouveau solde : ` +
                `${formaterEurosSupabase(
                    data.nouveau_solde_centimes
                )}.`,
                "succes",
                7000
            );
        }
    } catch (erreur) {
        console.error(
            "Achat Supabase impossible :",
            erreur
        );

        afficherMessageAchatSupabase(
            obtenirMessageErreurAchatSupabase(
                erreur
            )
        );

        if (bouton) {
            bouton.disabled = false;
            bouton.textContent =
                "Confirmer l’achat";
        }
    } finally {
        achatBoutiqueEnCours = false;
    }
}

function afficherMessageAchatSupabase(
    message
) {
    const conteneur = document.querySelector(
        "#message-confirmation-achat"
    );

    if (!conteneur) {
        return;
    }

    conteneur.hidden = false;
    conteneur.className =
        "message-action-admin erreur";

    conteneur.textContent = message;
}

function afficherErreurBoutiqueSupabase(
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

function obtenirMessageErreurAchatSupabase(
    erreur
) {
    const message = String(
        erreur?.message ||
        "L’achat a échoué."
    );

    const messagesConnus = [
        "Utilisateur non connecté.",
        "Article de boutique invalide.",
        "Compte bancaire introuvable.",
        "Votre compte bancaire n’est pas actif.",
        "Votre solde est insuffisant pour cet achat."
    ];

    return (
        messagesConnus.find(function (texte) {
            return message.includes(texte);
        }) ||
        "L’achat n’a pas pu être effectué."
    );
}

function fermerConfirmationAchatSupabase() {
    document
        .querySelector("#modal-confirmation-achat")
        ?.remove();

    document.body.classList.remove(
        "modal-ouverte"
    );

    achatBoutiqueEnCours = false;
}

function securiserTexteBoutiqueSupabase(
    valeur
) {
    const element = document.createElement("div");

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
            fermerConfirmationAchatSupabase();
        }
    }
);

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiserBoutiqueSupabase
    );
} else {
    initialiserBoutiqueSupabase();
}
