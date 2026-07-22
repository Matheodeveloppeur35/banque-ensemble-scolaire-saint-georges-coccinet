const cleSession = "saintGeorgesSessionDemo";

function ouvrirSessionDemo() {
    const session = {
        connecte: true,
        nom: "Jean Dupont",
        role: "Élève",
        numeroCompte: "SGC-000042",
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
