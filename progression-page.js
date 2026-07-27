document.addEventListener(
    "DOMContentLoaded",
    function () {
        const barreProgression =
            document.createElement("div");

        barreProgression.className =
            "barre-progression-page";

        barreProgression.setAttribute(
            "aria-hidden",
            "true"
        );

        const progression =
            document.createElement("div");

        progression.className =
            "progression-page";

        barreProgression.appendChild(progression);
        document.body.appendChild(barreProgression);

        actualiserProgression();

        window.addEventListener(
            "scroll",
            actualiserProgression,
            {
                passive: true
            }
        );

        window.addEventListener(
            "resize",
            actualiserProgression
        );

        function actualiserProgression() {
            const hauteurDocument =
                document.documentElement.scrollHeight -
                window.innerHeight;

            const pourcentage = hauteurDocument > 0
                ? Math.min(
                    100,
                    Math.max(
                        0,
                        window.scrollY /
                        hauteurDocument *
                        100
                    )
                )
                : 0;

            progression.style.width =
                `${pourcentage}%`;

            barreProgression.classList.toggle(
                "visible",
                hauteurDocument > 100
            );
        }
    }
);
