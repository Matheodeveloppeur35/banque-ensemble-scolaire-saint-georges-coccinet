document.addEventListener(
    "DOMContentLoaded",
    function () {
        const formulaire = document.querySelector(
            "#formulaire-virement"
        );

        if (!formulaire) {
            return;
        }

        let formulaireModifie = false;
        let envoiAutorise = false;

        formulaire.addEventListener(
            "input",
            function () {
                formulaireModifie =
                    formulaireContientDesDonnees();
            }
        );

        formulaire.addEventListener(
            "change",
            function () {
                formulaireModifie =
                    formulaireContientDesDonnees();
            }
        );

        formulaire.addEventListener(
            "submit",
            function () {
                /*
                 * Le formulaire est traité par virement.js.
                 * La protection reste active jusqu’à la confirmation.
                 */
                formulaireModifie =
                    formulaireContientDesDonnees();
            }
        );

        window.addEventListener(
            "beforeunload",
            function (evenement) {
                if (
                    !formulaireModifie ||
                    envoiAutorise
                ) {
                    return;
                }

                evenement.preventDefault();
                evenement.returnValue = "";
            }
        );

        window.autoriserSortieVirement =
            function () {
                envoiAutorise = true;
                formulaireModifie = false;
            };

        function formulaireContientDesDonnees() {
            const destinataire = document
                .querySelector("#destinataire")
                .value
                .trim();

            const montant = document
                .querySelector("#montant")
                .value
                .trim();

            const motif = document
                .querySelector("#motif")
                .value
                .trim();

            const confirmation = document
                .querySelector("#confirmation")
                .checked;

            return Boolean(
                destinataire ||
                montant ||
                motif ||
                confirmation
            );
        }
    }
);
