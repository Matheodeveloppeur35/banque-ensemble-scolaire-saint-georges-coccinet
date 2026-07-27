document.addEventListener(
    "DOMContentLoaded",
    function () {
        const champMontant = document.querySelector(
            "#montant"
        );

        const boutonsMontants = document.querySelectorAll(
            "[data-montant-rapide]"
        );

        if (
            !champMontant ||
            boutonsMontants.length === 0
        ) {
            return;
        }

        boutonsMontants.forEach(function (bouton) {
            bouton.addEventListener(
                "click",
                function () {
                    const valeur =
                        bouton.dataset.montantRapide;

                    let montantEuros;

                    if (valeur === "solde") {
                        if (
                            typeof obtenirSoldeCentimes !==
                            "function"
                        ) {
                            return;
                        }

                        const soldeCentimes =
                            obtenirSoldeCentimes();

                        /*
                         * Le plafond reste fixé à 1 000 € RP.
                         */
                        montantEuros = Math.min(
                            soldeCentimes / 100,
                            1000
                        );
                    } else {
                        montantEuros = Number(valeur);
                    }

                    if (
                        !Number.isFinite(montantEuros) ||
                        montantEuros <= 0
                    ) {
                        return;
                    }

                    champMontant.value =
                        montantEuros.toFixed(2);

                    champMontant.dispatchEvent(
                        new Event("input", {
                            bubbles: true
                        })
                    );

                    boutonsMontants.forEach(
                        function (autreBouton) {
                            autreBouton.classList.remove(
                                "actif"
                            );
                        }
                    );

                    bouton.classList.add("actif");
                    champMontant.focus();
                }
            );
        });

        champMontant.addEventListener(
            "input",
            function () {
                const montantSaisi = Number(
                    champMontant.value
                );

                boutonsMontants.forEach(
                    function (bouton) {
                        const valeur =
                            bouton.dataset.montantRapide;

                        if (valeur === "solde") {
                            return;
                        }

                        bouton.classList.toggle(
                            "actif",
                            montantSaisi === Number(valeur)
                        );
                    }
                );
            }
        );
    }
);
