const boutonExporterHistorique = document.querySelector(
    "#exporter-historique"
);

if (boutonExporterHistorique) {
    boutonExporterHistorique.addEventListener(
        "click",
        exporterHistoriqueCSV
    );
}

function exporterHistoriqueCSV() {
    const transactions = obtenirTransactionsPourExport();

    if (transactions.length === 0) {
        window.alert(
            "Aucune opération n’est disponible pour l’exportation."
        );

        return;
    }

    const colonnes = [
        "Référence",
        "Date",
        "Type",
        "Catégorie",
        "Titre",
        "Description",
        "Destinataire",
        "Montant en euros"
    ];

    const lignes = transactions.map(function (transaction) {
        const montantSigne =
            transaction.type === "revenu"
                ? transaction.montantCentimes
                : -transaction.montantCentimes;

        return [
            transaction.id,
            formaterDateExport(transaction.date),
            obtenirTypeExport(transaction.type),
            obtenirCategorieExport(transaction.categorie),
            transaction.titre,
            transaction.description,
            transaction.destinataire || "",
            (montantSigne / 100).toFixed(2)
        ];
    });

    const contenuCSV = [colonnes, ...lignes]
        .map(function (ligne) {
            return ligne
                .map(protegerCelluleCSV)
                .join(";");
        })
        .join("\r\n");

    const contenuAvecBOM = "\uFEFF" + contenuCSV;

    const fichierCSV = new Blob(
        [contenuAvecBOM],
        {
            type: "text/csv;charset=utf-8"
        }
    );

    const adresseFichier = URL.createObjectURL(fichierCSV);
    const lienTelechargement = document.createElement("a");

    lienTelechargement.href = adresseFichier;
    lienTelechargement.download = creerNomFichierHistorique();

    document.body.appendChild(lienTelechargement);
    lienTelechargement.click();
    lienTelechargement.remove();

    window.setTimeout(function () {
        URL.revokeObjectURL(adresseFichier);
    }, 1000);
}

function obtenirTransactionsPourExport() {
    const recherche = normaliserTexteExport(
        champRechercheHistorique.value
    );

    const transactionsFiltrees = obtenirTransactions()
        .filter(function (transaction) {
            return transactionCorrespondAuFiltre(
                transaction
            );
        })
        .filter(function (transaction) {
            if (!recherche) {
                return true;
            }

            const montantEuros = formaterEuros(
                transaction.montantCentimes
            );

            const montantSimple = (
                transaction.montantCentimes / 100
            ).toLocaleString("fr-FR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });

            const contenu = [
                transaction.id,
                transaction.type,
                transaction.categorie,
                transaction.titre,
                transaction.description,
                transaction.destinataire,
                montantEuros,
                montantSimple
            ]
                .filter(Boolean)
                .join(" ");

            return normaliserTexteExport(
                contenu
            ).includes(recherche);
        });

    return trierTransactions(
        transactionsFiltrees,
        champTriHistorique.value
    );
}

function protegerCelluleCSV(valeur) {
    let texte =
        valeur === null || valeur === undefined
            ? ""
            : String(valeur);

    /*
     * Empêche Excel ou un autre tableur d’interpréter
     * une valeur comme une formule.
     */
    if (/^[=+\-@]/.test(texte)) {
        texte = "'" + texte;
    }

    texte = texte.replace(/"/g, '""');

    return `"${texte}"`;
}

function formaterDateExport(dateTransaction) {
    const date = new Date(dateTransaction);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "medium"
    });
}

function obtenirTypeExport(type) {
    return type === "revenu"
        ? "Revenu"
        : "Dépense";
}

function obtenirCategorieExport(categorie) {
    const categories = {
        allocation: "Allocation",
        achat: "Achat",
        virement: "Virement"
    };

    return categories[categorie] || "Autre";
}

function normaliserTexteExport(texte) {
    return String(texte || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function creerNomFichierHistorique() {
    const maintenant = new Date();

    const dateFichier = [
        maintenant.getFullYear(),
        String(maintenant.getMonth() + 1).padStart(2, "0"),
        String(maintenant.getDate()).padStart(2, "0")
    ].join("-");

    return `historique-saint-georges-${dateFichier}.csv`;
}
