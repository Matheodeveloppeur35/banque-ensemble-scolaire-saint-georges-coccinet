document.addEventListener(
    "DOMContentLoaded",
    function () {
        const champMotif = document.querySelector(
            "#motif"
        );

        if (!champMotif) {
            return;
        }

        const longueurMaximale = Number(
            champMotif.maxLength
        ) || 150;

        const compteur = document.createElement("small");

        compteur.id = "compteur-motif";
        compteur.className = "compteur-motif";
        compteur.setAttribute("aria-live", "polite");

        champMotif.insertAdjacentElement(
            "afterend",
            compteur
        );

        actualiserCompteur();

        champMotif.addEventListener(
            "input",
            actualiserCompteur
        );

        function actualiserCompteur() {
            const longueurActuelle =
                champMotif.value.length;

            const caracteresRestants =
                longueurMaximale - longueurActuelle;

            compteur.textContent =
                `${longueurActuelle} / ` +
                `${longueurMaximale} caractères`;

            compteur.classList.toggle(
                "proche-limite",
                caracteresRestants <= 25 &&
                caracteresRestants > 0
            );

            compteur.classList.toggle(
                "limite-atteinte",
                caracteresRestants === 0
            );
        }
    }
);
