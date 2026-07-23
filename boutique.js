const boutonsFiltres = document.querySelectorAll(".filtre");

const articlesBoutique = document.querySelectorAll(
    ".article-boutique"
);

const boutonsAchat = document.querySelectorAll(".bouton-achat");

const affichageSoldeBoutique = document.querySelector(
    "#solde-boutique"
);

actualiserSoldeBoutique();

/* Gestion des filtres */

boutonsFiltres.forEach(function (bouton) {
    bouton.addEventListener("click", function () {
        const filtreChoisi = bouton.dataset.filtre;

        boutonsFiltres.forEach(function (autreBouton) {
            autreBouton.classList.remove("actif");
        });

        bouton.classList.add("actif");

        articlesBoutique.forEach(function (article) {
            const categorieArticle = article.dataset.categorie;

            const articleVisible =
                filtreChoisi === "tous" ||
                categorieArticle === filtreChoisi;

            article.hidden = !articleVisible;
        });
    });
});

/* Gestion des achats */

boutonsAchat.forEach(function (bouton) {
    bouton.addEventListener("click", function () {
        const nomArticle = bouton.dataset.article;

        const prixCentimes = convertirEurosEnCentimes(
            bouton.dataset.prix
        );

        if (
            !Number.isInteger(prixCentimes) ||
            prixCentimes <= 0
        ) {
           if (typeof afficherNotification === "function") {
    afficherNotification(
        "Le prix de cet article est invalide.",
        "erreur",
        6000
    );
} else {
    window.alert(
        "Le prix de cet article est invalide."
    );
}


            return;
        }

        afficherConfirmationAchat(
            nomArticle,
            prixCentimes
        );
    });
});

function actualiserSoldeBoutique() {
    const donnees = initialiserBanqueDemo();

    if (!affichageSoldeBoutique) {
        return;
    }

    affichageSoldeBoutique.textContent = formaterEuros(
        donnees.soldeCentimes
    );
}

function afficherConfirmationAchat(
    nomArticle,
    prixCentimes
) {
    supprimerFenetreAchat();

    const arrierePlan = document.createElement("div");

    arrierePlan.className = "arriere-plan-modal";
    arrierePlan.id = "modal-achat";

    arrierePlan.innerHTML = `
        <section
            class="modal-achat"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-modal-achat"
        >
            <button
                class="fermer-modal"
                id="fermer-modal"
                type="button"
                aria-label="Fermer"
            >
                ×
            </button>

            <div class="icone-modal-achat">
                🛍️
            </div>

            <p class="petit-titre">
                Confirmation d’achat
            </p>

            <h2 id="titre-modal-achat">
                Confirmer votre achat
            </h2>

            <p>
                Vous êtes sur le point d’acheter :
            </p>

            <div class="resume-achat">
                <span>
                    ${securiserTexte(nomArticle)}
                </span>

                <strong>
                    ${formaterEuros(prixCentimes)}
                </strong>
            </div>

            <p class="avertissement-modal">
                Le prix sera retiré de votre solde de démonstration
                et l’achat sera ajouté à votre historique.
            </p>

            <div class="actions-modal">
                <button
                    class="bouton-annuler-achat"
                    id="annuler-achat"
                    type="button"
                >
                    Annuler
                </button>

                <button
                    class="bouton-confirmer-achat"
                    id="confirmer-achat"
                    type="button"
                >
                    Confirmer l’achat
                </button>
            </div>
        </section>
    `;

    document.body.appendChild(arrierePlan);
    document.body.classList.add("modal-ouverte");

    document
        .querySelector("#fermer-modal")
        .addEventListener(
            "click",
            supprimerFenetreAchat
        );

    document
        .querySelector("#annuler-achat")
        .addEventListener(
            "click",
            supprimerFenetreAchat
        );

    document
        .querySelector("#confirmer-achat")
        .addEventListener("click", function () {
            effectuerAchat(
                nomArticle,
                prixCentimes
            );
        });

    arrierePlan.addEventListener(
        "click",
        function (evenement) {
            if (evenement.target === arrierePlan) {
                supprimerFenetreAchat();
            }
        }
    );
}

function effectuerAchat(nomArticle, prixCentimes) {
    const boutonConfirmation = document.querySelector(
        "#confirmer-achat"
    );

    if (
        !boutonConfirmation ||
        boutonConfirmation.disabled
    ) {
        return;
    }

    boutonConfirmation.disabled = true;
    boutonConfirmation.textContent =
        "Traitement en cours…";

    window.setTimeout(function () {
        const resultat = enregistrerDepense({
            titre: nomArticle,
            description: "Achat dans la boutique RP",
            montantCentimes: prixCentimes
        });

        if (!resultat.succes) {
            afficherErreurDansModal(
                resultat.message
            );

            return;
        }

        actualiserSoldeBoutique();
        afficherRecuAchat(resultat);
    }, 600);
}

function afficherRecuAchat(resultat) {
    const transaction = resultat.transaction;
    const modal = document.querySelector(".modal-achat");
if (typeof afficherNotification === "function") {
    afficherNotification(
        `${transaction.titre} acheté pour ` +
        `${formaterEuros(transaction.montantCentimes)}. ` +
        `Nouveau solde : ` +
        `${formaterEuros(resultat.nouveauSoldeCentimes)}.`,
        "succes",
        6000
    );
}

    if (!modal) {
        return;
    }

    const date = new Date(
        transaction.date
    ).toLocaleString("fr-FR", {
        dateStyle: "long",
        timeStyle: "short"
    });

    modal.innerHTML = `
        <div class="icone-succes-achat">
            ✓
        </div>

        <p class="petit-titre">
            Achat enregistré
        </p>

        <h2>Reçu d’achat RP</h2>

        <div class="recu-achat">
            <div>
                <span>Article</span>

                <strong>
                    ${securiserTexte(transaction.titre)}
                </strong>
            </div>

            <div>
                <span>Montant débité</span>

                <strong>
                    ${formaterEuros(
                        transaction.montantCentimes
                    )}
                </strong>
            </div>

            <div>
                <span>Nouveau solde</span>

                <strong>
                    ${formaterEuros(
                        resultat.nouveauSoldeCentimes
                    )}
                </strong>
            </div>

            <div>
                <span>Référence</span>

                <strong>
                    ${securiserTexte(transaction.id)}
                </strong>
            </div>

            <div>
                <span>Date</span>
                <strong>${date}</strong>
            </div>
        </div>

        <p class="avertissement-modal">
            Cet achat a été enregistré dans les données locales
            de démonstration.
        </p>

        <button
            class="bouton-confirmer-achat"
            id="terminer-achat"
            type="button"
        >
            Terminer
        </button>
    `;

    document
        .querySelector("#terminer-achat")
        .addEventListener(
            "click",
            supprimerFenetreAchat
        );
}

function afficherErreurDansModal(message) {
    if (typeof afficherNotification === "function") {
    afficherNotification(
        message,
        "erreur",
        6000
    );
}

    const modal = document.querySelector(".modal-achat");

    if (!modal) {
        return;
    }

    modal.innerHTML = `
        <div class="icone-erreur-achat">
            !
        </div>

        <p class="petit-titre">
            Achat refusé
        </p>

        <h2>Transaction impossible</h2>

        <p class="message-erreur-achat">
            ${securiserTexte(message)}
        </p>

        <button
            class="bouton-annuler-achat"
            id="fermer-erreur-achat"
            type="button"
        >
            Fermer
        </button>
    `;

    document
        .querySelector("#fermer-erreur-achat")
        .addEventListener(
            "click",
            supprimerFenetreAchat
        );
}

function supprimerFenetreAchat() {
    const fenetre = document.querySelector(
        "#modal-achat"
    );

    if (fenetre) {
        fenetre.remove();
    }

    document.body.classList.remove("modal-ouverte");
}

function securiserTexte(texte) {
    const element = document.createElement("div");

    element.textContent =
        texte === null || texte === undefined
            ? ""
            : String(texte);

    return element.innerHTML;
}
