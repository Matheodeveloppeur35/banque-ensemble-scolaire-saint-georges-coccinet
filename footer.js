const informationsSite = {
    version: "1.1.0-demo",
    derniereMiseAJour: "27 juillet 2026"
};

function actualiserPiedsDePage() {
    const anneeActuelle = new Date().getFullYear();

    document
        .querySelectorAll("[data-annee-actuelle]")
        .forEach(function (element) {
            element.textContent = anneeActuelle;
        });

    document
        .querySelectorAll("[data-version-site]")
        .forEach(function (element) {
            element.textContent =
                informationsSite.version;
        });

    document
        .querySelectorAll("[data-mise-a-jour-site]")
        .forEach(function (element) {
            element.textContent =
                informationsSite.derniereMiseAJour;
        });
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        actualiserPiedsDePage
    );
} else {
    actualiserPiedsDePage();
}
