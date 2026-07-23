document.addEventListener("DOMContentLoaded", function () {
    const boutonSauvegarde = document.querySelector(
        "#bouton-sauvegarde"
    );

    if (!boutonSauvegarde) {
        console.error(
            "Le bouton #bouton-sauvegarde est introuvable."
        );

        return;
    }

    boutonSauvegarde.addEventListener(
        "click",
        function () {
            telechargerSauvegarde(boutonSauvegarde);
        }
    );
});

function telechargerSauvegarde(bouton) {
    if (typeof obtenirDonneesBancaires !== "function") {
        window.alert(
            "Le système bancaire n’est pas chargé. " +
            "Rechargez la page puis réessayez."
        );

        return;
    }

    const donneesBancaires = obtenirDonneesBancaires();

    if (!donneesBancaires) {
        window.alert(
            "Aucune donnée bancaire n’est disponible."
        );

        return;
    }

    bouton.disabled = true;
    bouton.textContent = "Préparation…";

    try {
        const sauvegarde = {
            application: "Banque Saint-Georges RP",
            versionSauvegarde: 1,
            dateExportation: new Date().toISOString(),

            avertissement:
                "Données fictives de démonstration sans valeur réelle.",

            donneesBancaires: donneesBancaires
        };

        const contenuJSON = JSON.stringify(
            sauvegarde,
            null,
            2
        );

        const fichier = new Blob(
            [contenuJSON],
            {
                type: "application/json;charset=utf-8"
            }
        );

        const adresseFichier =
            URL.createObjectURL(fichier);

        const lienTelechargement =
            document.createElement("a");

        lienTelechargement.href = adresseFichier;
        lienTelechargement.download =
            creerNomSauvegarde();

        lienTelechargement.style.display = "none";

        document.body.appendChild(
            lienTelechargement
        );

        lienTelechargement.click();
        lienTelechargement.remove();

        window.setTimeout(function () {
            URL.revokeObjectURL(adresseFichier);
        }, 1000);
    } catch (erreur) {
        console.error(
            "Erreur pendant la sauvegarde :",
            erreur
        );

        window.alert(
            "Une erreur est survenue pendant la création " +
            "de la sauvegarde."
        );
    } finally {
        window.setTimeout(function () {
            bouton.disabled = false;
            bouton.textContent =
                "Télécharger une sauvegarde";
        }, 500);
    }
}

function creerNomSauvegarde() {
    const maintenant = new Date();

    const dateFichier = [
        maintenant.getFullYear(),

        String(
            maintenant.getMonth() + 1
        ).padStart(2, "0"),

        String(
            maintenant.getDate()
        ).padStart(2, "0")
    ].join("-");

    return (
        "sauvegarde-banque-saint-georges-" +
        dateFichier +
        ".json"
    );
}
