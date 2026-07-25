const currentLanguage = localStorage.getItem("language") || "en-IN";

function translatePage(pageTranslations) {

    // Merge common translations with page translations
    const translations = {
        ...commonText[currentLanguage],
        ...pageTranslations[currentLanguage]
    };

    // Translate normal text
    document.querySelectorAll("[data-i18n]").forEach(element => {

        const key = element.dataset.i18n;

        if (translations[key]) {
            element.innerText = translations[key];
        }

    });

    // Translate placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {

        const key = element.dataset.i18nPlaceholder;

        if (translations[key]) {
            element.placeholder = translations[key];
        }

    });

    // Translate button values (if any)
    document.querySelectorAll("[data-i18n-value]").forEach(element => {

        const key = element.dataset.i18nValue;

        if (translations[key]) {
            element.value = translations[key];
        }

    });

}