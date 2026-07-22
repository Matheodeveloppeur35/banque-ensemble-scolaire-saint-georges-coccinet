const liensNavigation = document.querySelectorAll("nav a");

let pageActuelle = window.location.pathname
    .split("/")
    .pop()
    .toLowerCase();

if (
    pageActuelle === "" ||
    pageActuelle === "banque-ensemble-scolaire-saint-georges-coccinet"
) {
    pageActuelle = "index.html";
}

liensNavigation.forEach(function (lien) {
    const adresseLien = lien
        .getAttribute("href")
        .replace("./", "")
        .split("?")[0]
        .split("#")[0]
        .toLowerCase();

    if (adresseLien === pageActuelle) {
        lien.classList.add("page-active");
        lien.setAttribute("aria-current", "page");
    }
});
