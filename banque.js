const cleBanque = "saintGeorgesBanqueDemo";

const donneesBancairesInitiales = {
    titulaire: "Jean Dupont",
    numeroCompte: "SGC-000042",
    role: "Élève",
    statut: "Actif",
    soldeCentimes: 124550,

    transactions: [
        {
            id: "SGC-TRANSACTION-001",
            type: "revenu",
            categorie: "allocation",
            titre: "Allocation scolaire",
            description: "Versement hebdomadaire RP",
            montantCentimes: 15000,
            date: "2026-07-20T10:00:00"
        },
        {
            id: "SGC-TRANSACTION-002",
            type: "depense",
            categorie: "achat",
            titre: "Cafétéria scolaire",
            description: "Achat RP",
            montantCentimes: 1250,
            date: "2026-07-18T12:30:00"
        },
        {
            id: "SGC-TRANSACTION-003",
            type: "depense",
            categorie: "virement",
            titre: "Virement à Marie Martin",
            description: "Participation à un événement scolaire",
            montantCentimes: 5000,
            date: "2026-07-15T16:00:00"
        }
    ]
};

function initialiserBanqueDemo() {
    const donneesExistantes = obtenirDonneesBancaires();

    if (!donneesExistantes) {
        enregistrerDonneesBancaires(
            copierDonnees(donneesBancairesInitiales)
        );
    }

    const donnees = obtenirDonneesBancaires();

    if (!Array.isArray(donnees.transactions)) {
        donnees.transactions = [];
        enregistrerDonneesBancaires(donnees);
    }

    return donnees;
}

function obtenirDonneesBancaires() {
    const donneesEnregistrees = localStorage.getItem(cleBanque);

    if (!donneesEnregistrees) {
        return null;
    }

    try {
        return JSON.parse(donneesEnregistrees);
    } catch (erreur) {
        localStorage.removeItem(cleBanque);
        return null;
    }
}

function enregistrerDonneesBancaires(donnees) {
    localStorage.setItem(
        cleBanque,
        JSON.stringify(donnees)
    );
}

function obtenirSoldeCentimes() {
    const donnees = initialiserBanqueDemo();

    return donnees.soldeCentimes;
}

function formaterEuros(montantCentimes) {
    const montantValide = Number.isInteger(montantCentimes)
        ? montantCentimes
        : 0;

    const montantEuros = montantValide / 100;

    return montantEuros.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " € RP";
}

function convertirEurosEnCentimes(montantEuros) {
    const montant = Number(montantEuros);

    if (!Number.isFinite(montant)) {
        return null;
    }

    return Math.round(montant * 100);
}

function enregistrerDepense(options) {
    const donnees = initialiserBanqueDemo();

    const montantCentimes = options.montantCentimes;
    const titre = String(options.titre || "").trim();
    const description = String(
        options.description || "Dépense RP"
    ).trim();

    if (
        !Number.isInteger(montantCentimes) ||
        montantCentimes <= 0
    ) {
        return {
            succes: false,
            raison: "montant-invalide",
            message: "Le montant de l’achat est invalide."
        };
    }

    if (donnees.statut !== "Actif") {
        return {
            succes: false,
            raison: "compte-inactif",
            message: "Votre compte bancaire RP n’est pas actif."
        };
    }

    if (donnees.soldeCentimes < montantCentimes) {
        return {
            succes: false,
            raison: "solde-insuffisant",
            message: "Votre solde est insuffisant pour cet achat."
        };
    }

    if (titre.length < 2) {
        return {
            succes: false,
            raison: "titre-invalide",
            message: "Le nom de l’article est invalide."
        };
    }

    const transaction = {
        id: creerReferenceTransaction("ACHAT"),
        type: "depense",
        categorie: "achat",
        titre: titre,
        description: description,
        montantCentimes: montantCentimes,
        date: new Date().toISOString()
    };

    donnees.soldeCentimes -= montantCentimes;
    donnees.transactions.push(transaction);

    enregistrerDonneesBancaires(donnees);

    return {
        succes: true,
        transaction: transaction,
        nouveauSoldeCentimes: donnees.soldeCentimes
    };
}

function creerReferenceTransaction(categorie = "TRANSACTION") {
    const date = new Date();

    const dateCompacte = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("");

    const tempsCompact = [
        String(date.getHours()).padStart(2, "0"),
        String(date.getMinutes()).padStart(2, "0"),
        String(date.getSeconds()).padStart(2, "0")
    ].join("");

    const nombreAleatoire = Math.floor(
        1000 + Math.random() * 9000
    );

    return [
        "SGC",
        categorie,
        dateCompacte,
        tempsCompact,
        nombreAleatoire
    ].join("-");
}

function reinitialiserBanqueDemo() {
    localStorage.removeItem(cleBanque);

    return initialiserBanqueDemo();
}

function copierDonnees(donnees) {
    return JSON.parse(JSON.stringify(donnees));
}
function enregistrerVirement(options) {
    const donnees = initialiserBanqueDemo();

    const destinataire = String(
        options.destinataire || ""
    ).trim();

    const motif = String(
        options.motif || ""
    ).trim();

    const montantCentimes = options.montantCentimes;

    const plafondCentimes = 100000;

    if (destinataire.length < 2) {
        return {
            succes: false,
            raison: "destinataire-invalide",
            message: "Le destinataire indiqué est invalide."
        };
    }

    if (
        !Number.isInteger(montantCentimes) ||
        montantCentimes <= 0
    ) {
        return {
            succes: false,
            raison: "montant-invalide",
            message: "Le montant du virement est invalide."
        };
    }

    if (montantCentimes > plafondCentimes) {
        return {
            succes: false,
            raison: "plafond-depasse",
            message:
                "Le plafond est limité à 1 000,00 € RP par virement."
        };
    }

    if (motif.length < 3) {
        return {
            succes: false,
            raison: "motif-invalide",
            message: "Le motif du virement est trop court."
        };
    }

    if (donnees.statut !== "Actif") {
        return {
            succes: false,
            raison: "compte-inactif",
            message: "Votre compte bancaire RP n’est pas actif."
        };
    }

    if (donnees.soldeCentimes < montantCentimes) {
        return {
            succes: false,
            raison: "solde-insuffisant",
            message: "Votre solde est insuffisant pour ce virement."
        };
    }

    const numeroCompteNormalise =
        donnees.numeroCompte.toLowerCase();

    const destinataireNormalise =
        destinataire.toLowerCase();

    if (
        destinataireNormalise ===
        donnees.titulaire.toLowerCase()
        ||
        destinataireNormalise ===
        numeroCompteNormalise
    ) {
        return {
            succes: false,
            raison: "auto-virement",
            message:
                "Vous ne pouvez pas effectuer un virement vers votre propre compte."
        };
    }

    const transaction = {
        id: creerReferenceTransaction("VIREMENT"),
        type: "depense",
        categorie: "virement",
        titre: `Virement à ${destinataire}`,
        description: motif,
        montantCentimes: montantCentimes,
        date: new Date().toISOString(),
        destinataire: destinataire
    };

    donnees.soldeCentimes -= montantCentimes;
    donnees.transactions.push(transaction);

    enregistrerDonneesBancaires(donnees);

    return {
        succes: true,
        transaction: transaction,
        nouveauSoldeCentimes: donnees.soldeCentimes
    };
}
