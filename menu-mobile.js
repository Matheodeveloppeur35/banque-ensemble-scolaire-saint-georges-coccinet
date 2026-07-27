document.addEventListener(
    "DOMContentLoaded",
    function () {
        const entete = document.querySelector("header");
        const navigation = document.querySelector("header nav");

        if (!entete || !navigation) {
            return;
        }

        if (document.querySelector("#bouton-menu-mobile")) {
            return;
        }

        navigation.id = "navigation-principale";

        const boutonMenu = document.createElement("button");

        boutonMenu.id = "bouton-menu-mobile";
        boutonMenu.className = "bouton-menu-mobile";
        boutonMenu.type = "button";

        boutonMenu.setAttribute(
            "aria-label",
            "Ouvrir le menu de navigation"
        );

        boutonMenu.setAttribute(
            "aria-controls",
            "navigation-principale"
        );

        boutonMenu.setAttribute(
            "aria-expanded",
            "false"
        );

        boutonMenu.innerHTML = `
            <span aria-hidden="true">☰</span>
            <span class="texte-menu-mobile">Menu</span>
        `;

        entete.insertBefore(
            boutonMenu,
            navigation
        );

        boutonMenu.addEventListener(
            "click",
            function () {
                const menuOuvert = navigation.classList.toggle(
                    "menu-mobile-ouvert"
                );

                boutonMenu.classList.toggle(
                    "actif",
                    menuOuvert
                );

                boutonMenu.setAttribute(
                    "aria-expanded",
                    String(menuOuvert)
                );

                boutonMenu.setAttribute(
                    "aria-label",
                    menuOuvert
                        ? "Fermer le menu de navigation"
                        : "Ouvrir le menu de navigation"
                );

                boutonMenu.querySelector(
                    "span[aria-hidden='true']"
                ).textContent = menuOuvert ? "×" : "☰";
            }
        );

        navigation.addEventListener(
            "click",
            function (evenement) {
                if (
                    evenement.target.closest("a") ||
                    evenement.target.closest("[data-deconnexion]")
                ) {
                    fermerMenuMobile();
                }
            }
        );

        document.addEventListener(
            "keydown",
            function (evenement) {
                if (evenement.key === "Escape") {
                    fermerMenuMobile();
                }
            }
        );

        window.addEventListener(
            "resize",
            function () {
                if (window.innerWidth > 900) {
                    fermerMenuMobile();
                }
            }
        );

        function fermerMenuMobile() {
            navigation.classList.remove(
                "menu-mobile-ouvert"
            );

            boutonMenu.classList.remove("actif");

            boutonMenu.setAttribute(
                "aria-expanded",
                "false"
            );

            boutonMenu.setAttribute(
                "aria-label",
                "Ouvrir le menu de navigation"
            );

            boutonMenu.querySelector(
                "span[aria-hidden='true']"
            ).textContent = "☰";
        }
    }
);
