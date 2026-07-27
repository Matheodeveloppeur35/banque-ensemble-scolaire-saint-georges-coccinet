const configurationSite = {
    version: "1.0.0-demo",
    derniereMiseAJour: "27 juillet 2026"
};

initialiserPiedDePage();

function initialiserPiedDePage() {
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            afficherPiedDePage
        );
    } else {
        afficherPiedDePage();
    }
}

function afficherPiedDePage() {
    const anneeActuelle = new Date().getFullYear();

    document.querySelectorAll(
        "[data-annee-actuelle]"
    ).forEach(function (element) {
        element.textContent = String(anneeActuelle);
    });

    document.querySelectorAll(
        "[data-version-site]"
    ).forEach(function (element) {
        element.textContent =
            configurationSite.version;
    });

    document.querySelectorAll(
        "[data-mise-a-jour-site]"
    ).forEach(function (element) {
        element.textContent =
            configurationSite.derniereMiseAJour;
    });
}
