const boutonsAdmin = document.querySelectorAll(".action-admin");
const messageAction = document.querySelector("#message-action-admin");
const rechercheAdmin = document.querySelector("#recherche-admin");
const lignesComptes = document.querySelectorAll(
    "#liste-comptes-admin tr"
);

const messagesActions = {
    "creer-compte":
        "La création de compte sera disponible avec la base de données.",

    "modifier-solde":
        "La modification des soldes n’est pas encore activée.",

    "suspendre-compte":
        "La suspension des comptes sera ajoutée dans une prochaine étape.",

    "rechercher":
        "Utilisez le champ de recherche situé au-dessus du tableau."
};

boutonsAdmin.forEach(function (bouton) {
    bouton.addEventListener("click", function () {
        const action = bouton.dataset.action;
        const message = messagesActions[action];

        messageAction.textContent =
            message || "Cette fonctionnalité n’est pas encore disponible.";

        messageAction.hidden = false;

        if (action === "rechercher") {
            rechercheAdmin.focus();
        }
    });
});

rechercheAdmin.addEventListener("input", function () {
    const recherche = normaliserTexte(rechercheAdmin.value);

    lignesComptes.forEach(function (ligne) {
        const contenuLigne = normaliserTexte(ligne.textContent);
        const correspond = contenuLigne.includes(recherche);

        ligne.hidden = !correspond;
    });
});

function normaliserTexte(texte) {
    return texte
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}
