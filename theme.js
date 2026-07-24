const cleTheme = "saintGeorgesTheme";

appliquerThemeEnregistre();

document.addEventListener("DOMContentLoaded", function () {
    const boutonsTheme = document.querySelectorAll(
        "[data-changer-theme]"
    );

    actualiserBoutonsTheme(boutonsTheme);

    boutonsTheme.forEach(function (bouton) {
        bouton.addEventListener("click", function () {
            const themeActuel = obtenirThemeActuel();

            const nouveauTheme =
                themeActuel === "sombre"
                    ? "clair"
                    : "sombre";

            appliquerTheme(nouveauTheme);
            enregistrerTheme(nouveauTheme);
            actualiserBoutonsTheme(boutonsTheme);

            if (typeof afficherNotification === "function") {
                const message =
                    nouveauTheme === "sombre"
                        ? "Le thème sombre est activé."
                        : "Le thème clair est activé.";

                afficherNotification(
                    message,
                    "information",
                    3500
                );
            }
        });
    });
});

function appliquerThemeEnregistre() {
    const themeEnregistre = localStorage.getItem(
        cleTheme
    );

    if (
        themeEnregistre === "clair" ||
        themeEnregistre === "sombre"
    ) {
        appliquerTheme(themeEnregistre);
        return;
    }

    const requeteThemeSombre = window.matchMedia(
        "(prefers-color-scheme: dark)"
    );

    appliquerTheme(
        requeteThemeSombre.matches
            ? "sombre"
            : "clair"
    );
}

function appliquerTheme(theme) {
    document.documentElement.setAttribute(
        "data-theme",
        theme
    );

    document.documentElement.style.colorScheme =
        theme === "sombre"
            ? "dark"
            : "light";
}

function enregistrerTheme(theme) {
    localStorage.setItem(
        cleTheme,
        theme
    );
}

function obtenirThemeActuel() {
    return (
        document.documentElement.getAttribute(
            "data-theme"
        ) || "clair"
    );
}

function actualiserBoutonsTheme(boutons) {
    const themeSombre =
        obtenirThemeActuel() === "sombre";

    boutons.forEach(function (bouton) {
        const texte = themeSombre
            ? "Thème clair"
            : "Thème sombre";

        const icone = themeSombre
            ? "☀️"
            : "🌙";

        bouton.innerHTML = `
            <span aria-hidden="true">
                ${icone}
            </span>

            <span>${texte}</span>
        `;

        bouton.setAttribute(
            "aria-label",
            themeSombre
                ? "Activer le thème clair"
                : "Activer le thème sombre"
        );

        bouton.setAttribute(
            "aria-pressed",
            String(themeSombre)
        );
    });
}
