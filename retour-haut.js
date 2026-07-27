document.addEventListener(
    "DOMContentLoaded",
    function () {
        const boutonRetourHaut =
            document.createElement("button");

        boutonRetourHaut.type = "button";
        boutonRetourHaut.className = "bouton-retour-haut";
        boutonRetourHaut.setAttribute(
            "aria-label",
            "Retourner en haut de la page"
        );

        boutonRetourHaut.innerHTML = `
            <span aria-hidden="true">↑</span>
        `;

        document.body.appendChild(boutonRetourHaut);

        actualiserBoutonRetourHaut();

        window.addEventListener(
            "scroll",
            actualiserBoutonRetourHaut,
            {
                passive: true
            }
        );

        boutonRetourHaut.addEventListener(
            "click",
            function () {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        );

        function actualiserBoutonRetourHaut() {
            const boutonVisible =
                window.scrollY > 300;

            boutonRetourHaut.classList.toggle(
                "visible",
                boutonVisible
            );
        }
    }
);
