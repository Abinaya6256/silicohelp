const languageMap = {
    "en-IN": "English",
    "ta-IN": "தமிழ்",
    "hi-IN": "हिन्दी",
    "te-IN": "తెలుగు",
    "kn-IN": "ಕನ್ನಡ",
    "ml-IN": "മലയാളം",
    "mr-IN": "मराठी",
    "bn-IN": "বাংলা"
};

const language = localStorage.getItem("language");
const voice = localStorage.getItem("voice");

document.getElementById("language").innerText =
languageMap[language] || "English";

document.getElementById("voice").innerText =
voice === "enabled" ? "Enabled ✅" : "Disabled";

document.querySelector(".start-btn").addEventListener("click", () => {
    window.location.href = "portal-selection.html";
});

document.querySelector(".login-btn").addEventListener("click", () => {
    window.location.href = "login.html";
});