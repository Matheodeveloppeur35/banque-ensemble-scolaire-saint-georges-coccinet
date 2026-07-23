const boutonSauvegarde = document.querySelector(
    "#bouton-sauvegarde"
);

if (boutonSauvegarde) {
    boutonSauvegarde.addEventListener(
        "click",
        telechargerSauvegarde
    );
}

function telechargerSauvegarde() {
    const donneesBancaires = obtenirDonneesBancaires();

    if (!donneesBancaires) {
        window.alert(
            "Aucune donnée bancaire n’est disponible."
        );

        return;
    }

    boutonSauvegarde.disabled = true;
    boutonSauvegarde.textContent = "Préparation…";

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

    const adresseFichier = URL.createObjectURL(fichier);
    const lienTelechargement = document.createElement("a");

    lienTelechargement.href = adresseFichier;
    lienTelechargement.download =
        creerNomSauvegarde();

    document.body.appendChild(lienTelechargement);
    lienTelechargement.click();
    lienTelechargement.remove();

    window.setTimeout(function () {
        URL.revokeObjectURL(adresseFichier);

        boutonSauvegarde.disabled = false;
        boutonSauvegarde.textContent =
            "Télécharger une sauvegarde";
    }, 500);
}

function creerNomSauvegarde() {
    const maintenant = new Date();

    const dateFichier = [
        maintenant.getFullYear(),
        String(maintenant.getMonth() + 1).padStart(2, "0"),
        String(maintenant.getDate()).padStart(2, "0")
    ].join("-");

    return (
        "sauvegarde-banque-saint-georges-" +
        dateFichier +
        ".json"
    );
}
