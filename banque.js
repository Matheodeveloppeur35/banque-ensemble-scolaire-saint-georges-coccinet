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
            titre: "Allocation scolaire",
            description: "Versement hebdomadaire RP",
            montantCentimes: 15000,
            date: "2026-07-20T10:00:00"
        },
        {
            id: "SGC-TRANSACTION-002",
            type: "depense",
            titre: "Cafétéria scolaire",
            description: "Achat RP",
            montantCentimes: 1250,
            date: "2026-07-18T12:30:00"
        },
        {
            id: "SGC-TRANSACTION-003",
            type: "depense",
            titre: "Virement à Marie Martin",
            description: "Participation à un événement scolaire",
            montantCentimes: 5000,
            date: "2026-07-15T16:00:00"
        }
    ]
};

function initialiserBanqueDemo() {
    const donneesExistantes = localStorage.getItem(cleBanque);

    if (!donneesExistantes) {
        enregistrerDonneesBancaires(
            donneesBancairesInitiales
        );
    }

    return obtenirDonneesBancaires();
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
    const montantEuros = montantCentimes / 100;

    return montantEuros.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " € RP";
}

function reinitialiserBanqueDemo() {
    localStorage.removeItem(cleBanque);

    return initialiserBanqueDemo();
}
