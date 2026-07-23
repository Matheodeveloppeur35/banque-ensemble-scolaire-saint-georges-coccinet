document.addEventListener("DOMContentLoaded", function () {
    const boutonsDeconnexion = document.querySelectorAll(
        "[data-deconnexion]"
    );

    boutonsDeconnexion.forEach(function (bouton) {
        bouton.addEventListener("click", function () {
            if (bouton.disabled) {
                return;
            }

            const texteInitial = bouton.textContent;

            bouton.disabled = true;
            bouton.textContent = "Déconnexion…";

            if (typeof fermerSessionDemo === "function") {
                fermerSessionDemo();
            }

            window.setTimeout(function () {
                window.location.replace("./connexion.html");
            }, 400);

            window.setTimeout(function () {
                bouton.disabled = false;
                bouton.textContent = texteInitial;
            }, 1500);
        });
    });
});
