function initialiserMontantsRapidesSupabase() {
    const champMontant = document.querySelector(
        "#montant"
    );

    const boutons = document.querySelectorAll(
        "[data-montant-rapide]"
    );

    if (!champMontant || boutons.length === 0) {
        return;
    }

    boutons.forEach(function (bouton) {
        bouton.addEventListener(
            "click",
            async function () {
                const valeur =
                    bouton.dataset.montantRapide;

                let montantEuros;

                if (valeur === "solde") {
                    try {
                        const compte =
                            await obtenirCompteSupabase();

                        if (!compte) {
                            throw new Error(
                                "Compte introuvable."
                            );
                        }

                        montantEuros = Math.min(
                            Number(
                                compte.solde_centimes
                            ) / 100,
                            1000
                        );
                    } catch (erreur) {
                        console.error(
                            "Lecture du solde impossible :",
                            erreur
                        );

                        return;
                    }
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

                boutons.forEach(function (
                    autreBouton
                ) {
                    autreBouton.classList.remove(
                        "actif"
                    );
                });

                bouton.classList.add("actif");
            }
        );
    });
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialiserMontantsRapidesSupabase
    );
} else {
    initialiserMontantsRapidesSupabase();
}
