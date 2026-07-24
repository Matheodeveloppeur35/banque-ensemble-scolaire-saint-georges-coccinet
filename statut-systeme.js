const configurationStatutSysteme = {
    type: "demonstration",
    titre: "Mode démonstration locale",
    message:
        "Les données sont enregistrées uniquement dans votre navigateur.",
    dateMiseAJour: "24 juillet 2026"
};

const cleBanniereMasquee =
    "saintGeorgesBanniereStatutMasquee";

initialiserStatutSysteme();

function initialiserStatutSysteme() {
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            afficherBanniereStatut
        );
    } else {
        afficherBanniereStatut();
    }
}

function afficherBanniereStatut() {
    if (
        document.querySelector("#banniere-statut-systeme") ||
        sessionStorage.getItem(cleBanniereMasquee) === "true"
    ) {
        return;
    }

    const banniere = document.createElement("aside");

    banniere.id = "banniere-statut-systeme";

    banniere.className =
        `banniere-statut-systeme ` +
        configurationStatutSysteme.type;

    banniere.setAttribute("role", "status");
    banniere.setAttribute("aria-live", "polite");

    banniere.innerHTML = `
        <div class="indicateur-statut-systeme"></div>

        <div class="contenu-statut-systeme">
            <strong></strong>
            <span class="message-statut-systeme"></span>
            <small></small>
        </div>

        <button
            class="fermer-statut-systeme"
            type="button"
            aria-label="Masquer l’état du système"
        >
            ×
        </button>
    `;

    banniere.querySelector(
        ".contenu-statut-systeme strong"
    ).textContent = configurationStatutSysteme.titre;

    banniere.querySelector(
        ".message-statut-systeme"
    ).textContent = configurationStatutSysteme.message;

    banniere.querySelector(
        ".contenu-statut-systeme small"
    ).textContent =
        `Mise à jour : ` +
        configurationStatutSysteme.dateMiseAJour;

    document.body.prepend(banniere);

    banniere.querySelector(
        ".fermer-statut-systeme"
    ).addEventListener("click", function () {
        sessionStorage.setItem(
            cleBanniereMasquee,
            "true"
        );

        banniere.classList.add("fermeture");

        window.setTimeout(function () {
            banniere.remove();
        }, 250);
    });
}
