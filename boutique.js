const boutonsFiltres = document.querySelectorAll(".filtre");
const articlesBoutique = document.querySelectorAll(".article-boutique");

boutonsFiltres.forEach(function (bouton) {
    bouton.addEventListener("click", function () {
        const filtreChoisi = bouton.dataset.filtre;

        boutonsFiltres.forEach(function (autreBouton) {
            autreBouton.classList.remove("actif");
        });

        bouton.classList.add("actif");

        articlesBoutique.forEach(function (article) {
            const categorieArticle = article.dataset.categorie;

            const articleVisible =
                filtreChoisi === "tous" ||
                categorieArticle === filtreChoisi;

            article.hidden = !articleVisible;
        });
    });
});
