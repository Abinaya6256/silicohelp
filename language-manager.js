const currentLanguage =
localStorage.getItem("language") || "en-IN";

document.querySelectorAll("[data-translate]").forEach(element => {

    const key = element.dataset.translate;

    if(
        translations[currentLanguage] &&
        translations[currentLanguage][key]
    ){

        element.innerText =
        translations[currentLanguage][key];

    }

});