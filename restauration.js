document.addEventListener("DOMContentLoaded", function () {
    const boutonRestauration = document.querySelector(
        "#bouton-restauration"
    );

    const champFichier = document.querySelector(
        "#fichier-restauration"
    );

    if (!boutonRestauration || !champFichier) {
        console.error(
            "Les éléments de restauration sont introuvables."
        );

        return;
    }

    boutonRestauration.addEventListener(
        "click",
        function () {
            champFichier.value = "";
            champFichier.click();
        }
    );

    champFichier.addEventListener(
        "change",
        function () {
            const fichier = champFichier.files[0];

            if (!fichier) {
                return;
            }

            restaurerDepuisFichier(
                fichier,
                boutonRestauration
            );
        }
    );
});

async function restaurerDepuisFichier(
    fichier,
    bouton
) {
    bouton.disabled = true;
    bouton.textContent = "Vérification…";

    try {
        verifierFichierSelectionne(fichier);

        const contenu = await fichier.text();
        const sauvegarde = JSON.parse(contenu);

        const resultatValidation =
            validerSauvegarde(sauvegarde);

        if (!resultatValidation.valide) {
            throw new Error(
                resultatValidation.message
            );
        }

        const donnees = resultatValidation.donnees;

        const confirmation = window.confirm(
            "Voulez-vous restaurer cette sauvegarde ?\n\n" +
            "Titulaire : " + donnees.titulaire + "\n" +
            "Compte : " + donnees.numeroCompte + "\n" +
            "Solde : " + formaterEuros(
                donnees.soldeCentimes
            ) + "\n" +
            "Transactions : " +
            donnees.transactions.length +
            "\n\nLes données actuelles seront remplacées."
        );

        if (!confirmation) {
            return;
        }

        enregistrerDonneesBancaires(donnees);

        window.alert(
            "La sauvegarde a été restaurée avec succès."
        );

        window.location.reload();
    } catch (erreur) {
        console.error(
            "Erreur pendant la restauration :",
            erreur
        );

        window.alert(
            erreur.message ||
            "Le fichier sélectionné ne peut pas être restauré."
        );
    } finally {
        bouton.disabled = false;
        bouton.textContent =
            "Restaurer une sauvegarde";
    }
}

function verifierFichierSelectionne(fichier) {
    const tailleMaximale = 2 * 1024 * 1024;

    if (fichier.size > tailleMaximale) {
        throw new Error(
            "Le fichier dépasse la taille maximale de 2 Mo."
        );
    }

    const nomFichier = fichier.name.toLowerCase();

    if (!nomFichier.endsWith(".json")) {
        throw new Error(
            "Veuillez sélectionner un fichier JSON."
        );
    }
}

function validerSauvegarde(sauvegarde) {
    if (
        !sauvegarde ||
        typeof sauvegarde !== "object"
    ) {
        return erreurValidation(
            "Le contenu de la sauvegarde est invalide."
        );
    }

    if (
        sauvegarde.application !==
        "Banque Saint-Georges RP"
    ) {
        return erreurValidation(
            "Ce fichier ne provient pas de la Banque Saint-Georges RP."
        );
    }

    if (sauvegarde.versionSauvegarde !== 1) {
        return erreurValidation(
            "Cette version de sauvegarde n’est pas compatible."
        );
    }

    const donnees = sauvegarde.donneesBancaires;

    if (!donnees || typeof donnees !== "object") {
        return erreurValidation(
            "Les données bancaires sont absentes."
        );
    }

    const titulaire = String(
        donnees.titulaire || ""
    ).trim();

    const numeroCompte = String(
        donnees.numeroCompte || ""
    ).trim();

    const role = String(
        donnees.role || ""
    ).trim();

    const statut = String(
        donnees.statut || ""
    ).trim();

    if (
        titulaire.length < 2 ||
        titulaire.length > 100
    ) {
        return erreurValidation(
            "Le titulaire de la sauvegarde est invalide."
        );
    }

    if (!/^SGC-[A-Z0-9-]{3,30}$/i.test(numeroCompte)) {
        return erreurValidation(
            "Le numéro de compte de la sauvegarde est invalide."
        );
    }

    if (role.length < 2 || role.length > 50) {
        return erreurValidation(
            "Le rôle de la sauvegarde est invalide."
        );
    }

    if (!["Actif", "Suspendu"].includes(statut)) {
        return erreurValidation(
            "Le statut du compte est invalide."
        );
    }

    if (
        !Number.isInteger(donnees.soldeCentimes) ||
        donnees.soldeCentimes < 0 ||
        donnees.soldeCentimes > 100000000
    ) {
        return erreurValidation(
            "Le solde de la sauvegarde est invalide."
        );
    }

    if (!Array.isArray(donnees.transactions)) {
        return erreurValidation(
            "La liste des transactions est invalide."
        );
    }

    if (donnees.transactions.length > 5000) {
        return erreurValidation(
            "La sauvegarde contient trop de transactions."
        );
    }

    const transactionsValidees = [];

    for (const transaction of donnees.transactions) {
        const resultat =
            validerTransactionSauvegardee(transaction);

        if (!resultat.valide) {
            return resultat;
        }

        transactionsValidees.push(
            resultat.transaction
        );
    }

    return {
        valide: true,

        donnees: {
            titulaire: titulaire,
            numeroCompte: numeroCompte,
            role: role,
            statut: statut,
            soldeCentimes: donnees.soldeCentimes,
            transactions: transactionsValidees
        }
    };
}

function validerTransactionSauvegardee(transaction) {
    if (
        !transaction ||
        typeof transaction !== "object"
    ) {
        return erreurValidation(
            "Une transaction de la sauvegarde est invalide."
        );
    }

    const id = String(transaction.id || "").trim();
    const type = String(transaction.type || "").trim();
    const categorie = String(
        transaction.categorie || ""
    ).trim();

    const titre = String(
        transaction.titre || ""
    ).trim();

    const description = String(
        transaction.description || ""
    ).trim();

    const destinataire = transaction.destinataire
        ? String(transaction.destinataire).trim()
        : "";

    if (
        id.length < 3 ||
        id.length > 100
    ) {
        return erreurValidation(
            "Une référence de transaction est invalide."
        );
    }

    if (!["revenu", "depense"].includes(type)) {
        return erreurValidation(
            "Un type de transaction est invalide."
        );
    }

    if (
        categorie.length < 2 ||
        categorie.length > 50
    ) {
        return erreurValidation(
            "Une catégorie de transaction est invalide."
        );
    }

    if (
        titre.length < 2 ||
        titre.length > 150
    ) {
        return erreurValidation(
            "Un titre de transaction est invalide."
        );
    }

    if (description.length > 500) {
        return erreurValidation(
            "Une description de transaction est trop longue."
        );
    }

    if (
        destinataire.length > 100
    ) {
        return erreurValidation(
            "Un destinataire est invalide."
        );
    }

    if (
        !Number.isInteger(transaction.montantCentimes) ||
        transaction.montantCentimes <= 0 ||
        transaction.montantCentimes > 100000000
    ) {
        return erreurValidation(
            "Un montant de transaction est invalide."
        );
    }

    const date = new Date(transaction.date);

    if (Number.isNaN(date.getTime())) {
        return erreurValidation(
            "Une date de transaction est invalide."
        );
    }

    return {
        valide: true,

        transaction: {
            id: id,
            type: type,
            categorie: categorie,
            titre: titre,
            description: description,
            montantCentimes:
                transaction.montantCentimes,
            date: date.toISOString(),

            ...(destinataire
                ? { destinataire: destinataire }
                : {})
        }
    };
}

function erreurValidation(message) {
    return {
        valide: false,
        message: message
    };
}
