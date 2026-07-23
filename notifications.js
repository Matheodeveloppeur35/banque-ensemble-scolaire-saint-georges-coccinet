const cleNotification = "saintGeorgesNotification";

document.addEventListener("DOMContentLoaded", function () {
    creerZoneNotifications();
    afficherNotificationMemorisee();
});

function creerZoneNotifications() {
    if (document.querySelector("#zone-notifications")) {
        return;
    }

    const zone = document.createElement("div");

    zone.id = "zone-notifications";
    zone.className = "zone-notifications";
    zone.setAttribute("aria-live", "polite");
    zone.setAttribute("aria-atomic", "false");

    document.body.appendChild(zone);
}

function afficherNotification(
    message,
    type = "information",
    duree = 4500
) {
    creerZoneNotifications();

    const zone = document.querySelector(
        "#zone-notifications"
    );

    const notification = document.createElement("div");

    const icones = {
        succes: "✓",
        erreur: "!",
        avertissement: "⚠",
        information: "i"
    };

    const titres = {
        succes: "Opération réussie",
        erreur: "Une erreur est survenue",
        avertissement: "Attention",
        information: "Information"
    };

    const typeValide = Object.hasOwn(
        titres,
        type
    )
        ? type
        : "information";

    notification.className =
        `notification-site ${typeValide}`;

    notification.setAttribute("role", "status");

    notification.innerHTML = `
        <div class="icone-notification">
            ${icones[typeValide]}
        </div>

        <div class="contenu-notification">
            <strong>${titres[typeValide]}</strong>
            <span></span>
        </div>

        <button
            class="fermer-notification"
            type="button"
            aria-label="Fermer la notification"
        >
            ×
        </button>
    `;

    notification.querySelector(
        ".contenu-notification span"
    ).textContent = String(message);

    zone.appendChild(notification);

    window.requestAnimationFrame(function () {
        notification.classList.add("visible");
    });

    const boutonFermer = notification.querySelector(
        ".fermer-notification"
    );

    boutonFermer.addEventListener("click", function () {
        fermerNotification(notification);
    });

    if (duree > 0) {
        window.setTimeout(function () {
            fermerNotification(notification);
        }, duree);
    }

    return notification;
}

function fermerNotification(notification) {
    if (
        !notification ||
        notification.classList.contains("fermeture")
    ) {
        return;
    }

    notification.classList.add("fermeture");
    notification.classList.remove("visible");

    window.setTimeout(function () {
        notification.remove();
    }, 250);
}

function memoriserNotification(
    message,
    type = "information"
) {
    const notification = {
        message: String(message),
        type: String(type),
        date: new Date().toISOString()
    };

    sessionStorage.setItem(
        cleNotification,
        JSON.stringify(notification)
    );
}

function afficherNotificationMemorisee() {
    const valeur = sessionStorage.getItem(
        cleNotification
    );

    if (!valeur) {
        return;
    }

    sessionStorage.removeItem(cleNotification);

    try {
        const notification = JSON.parse(valeur);

        if (
            !notification ||
            typeof notification.message !== "string"
        ) {
            return;
        }

        afficherNotification(
            notification.message,
            notification.type
        );
    } catch (erreur) {
        console.error(
            "La notification mémorisée est invalide.",
            erreur
        );
    }
}
