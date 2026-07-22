const cleSession = "saintGeorgesSessionDemo";

function ouvrirSessionDemo(modeAdministrateur = false) {
    const session = {
        connecte: true,
        nom: modeAdministrateur
            ? "Administrateur Démo"
            : "Jean Dupont",
        role: modeAdministrateur
            ? "Administrateur RP"
            : "Élève",
        numeroCompte: modeAdministrateur
            ? "SGC-ADMIN-001"
            : "SGC-000042",
        administrateur: modeAdministrateur,
        dateConnexion: new Date().toISOString()
    };

    localStorage.setItem(
        cleSession,
        JSON.stringify(session)
    );
}

function obtenirSessionDemo() {
    const sessionEnregistree = localStorage.getItem(cleSession);

    if (!sessionEnregistree) {
        return null;
    }

    try {
        const session = JSON.parse(sessionEnregistree);

        if (!session.connecte) {
            return null;
        }

        return session;
    } catch (erreur) {
        localStorage.removeItem(cleSession);
        return null;
    }
}

function fermerSessionDemo() {
    localStorage.removeItem(cleSession);
}

function utilisateurConnecte() {
    return obtenirSessionDemo() !== null;
}

function utilisateurAdministrateur() {
    const session = obtenirSessionDemo();

    return Boolean(
        session &&
        session.connecte &&
        session.administrateur === true
    );
}
