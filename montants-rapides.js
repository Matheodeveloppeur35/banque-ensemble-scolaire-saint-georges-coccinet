function initialiserMontantsRapides() {
    const champMontant = document.querySelector(
        "#montant"
    );

    const boutonsMontants = document.querySelectorAll(
        ".montants-rapides [data-montant-rapide]"
    );

    if (!champMontant) {
        console.error(
            "Le champ #montant est introuvable."
        );

        return;
    }

    if (boutonsMontants.length === 0) {
        console.error(
            "Les boutons de montants rapides sont introuvables."
        );

        return;
    }

    boutonsMontants.forEach(function (bouton) {
        bouton.addEventListener(
            "click",
            function (evenement) {
                evenement.preventDefault();

                const valeur = bouton.getAttribute(
                    "data-montant-rapide"
                );

                let montantEuros = 0;

                if (valeur === "solde") {
                    if (
                        typeof obtenirSoldeCentimes !==
                        "function"
                    ) {
                        console.error(
                            "La fonction obtenirSoldeCentimes " +
                            "est introuvable."
                        );

                        return;
                    }

                    const soldeCentimes =
                        obtenirSoldeCentimes();

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

                champMontant.dispatchEvent(
                    new Event("change", {
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
            }
        );
    });

    champMontant.addEventListener(
        "input",
        actualiserBoutonActif
    );

    function actualiserBoutonActif() {
        const montantSaisi = Number(
            champMontant.value
        );

        boutonsMontants.forEach(function (bouton) {
            const valeur = bouton.getAttribute(
                "data-montant-rapide"
            );

            if (valeur === "solde") {
                bouton.classList.remove("actif");
                return;
            }

            bouton.classList.toggle(
                "actif",
                montantSaisi === Number(valeur)
            );
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiserMontantsRapides
    );
} else {
    initialiserMontantsRapides();
}
