const boutonsFiltres = document.querySelectorAll(".filtre");
const articlesBoutique = document.querySelectorAll(".article-boutique");
const boutonsAchat = document.querySelectorAll(".bouton-achat");

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

boutonsAchat.forEach(function (bouton) {
    bouton.addEventListener("click", function () {
        const nomArticle = bouton.dataset.article;
        const prixArticle = Number(bouton.dataset.prix);

        afficherConfirmationAchat(
            nomArticle,
            prixArticle
        );
    });
});

function afficherConfirmationAchat(nomArticle, prixArticle) {
    supprimerFenetreAchat();

    const prixFormate = formaterMontant(prixArticle);

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
                <span>${securiserTexte(nomArticle)}</span>
                <strong>${prixFormate} € RP</strong>
            </div>

            <p class="avertissement-modal">
                Cet achat est entièrement fictif et appartient
                uniquement au système RP.
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
        .addEventListener("click", supprimerFenetreAchat);

    document
        .querySelector("#annuler-achat")
        .addEventListener("click", supprimerFenetreAchat);

    document
        .querySelector("#confirmer-achat")
        .addEventListener("click", function () {
            simulerAchat(nomArticle, prixArticle);
        });

    arrierePlan.addEventListener("click", function (evenement) {
        if (evenement.target === arrierePlan) {
            supprimerFenetreAchat();
        }
    });
}

function simulerAchat(nomArticle, prixArticle) {
    const boutonConfirmation = document.querySelector(
        "#confirmer-achat"
    );

    boutonConfirmation.disabled = true;
    boutonConfirmation.textContent = "Traitement en cours…";

    window.setTimeout(function () {
        const reference = creerReferenceAchat();
        const prixFormate = formaterMontant(prixArticle);

        const date = new Date().toLocaleString("fr-FR", {
            dateStyle: "long",
            timeStyle: "short"
        });

        const modal = document.querySelector(".modal-achat");

        modal.innerHTML = `
            <div class="icone-succes-achat">
                ✓
            </div>

            <p class="petit-titre">
                Achat confirmé
            </p>

            <h2>Reçu d’achat RP</h2>

            <div class="recu-achat">
                <div>
                    <span>Article</span>
                    <strong>${securiserTexte(nomArticle)}</strong>
                </div>

                <div>
                    <span>Montant</span>
                    <strong>${prixFormate} € RP</strong>
                </div>

                <div>
                    <span>Référence</span>
                    <strong>${reference}</strong>
                </div>

                <div>
                    <span>Date</span>
                    <strong>${date}</strong>
                </div>
            </div>

            <p class="avertissement-modal">
                Démonstration uniquement : votre solde
                n’a pas été modifié.
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
            .addEventListener("click", supprimerFenetreAchat);
    }, 800);
}

function supprimerFenetreAchat() {
    const fenetre = document.querySelector("#modal-achat");

    if (fenetre) {
        fenetre.remove();
    }

    document.body.classList.remove("modal-ouverte");
}

function formaterMontant(montant) {
    return montant.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function creerReferenceAchat() {
    const nombre = Math.floor(
        100000 + Math.random() * 900000
    );

    return `SGC-ACHAT-${nombre}`;
}

function securiserTexte(texte) {
    const element = document.createElement("div");
    element.textContent = texte;

    return element.innerHTML;
}
