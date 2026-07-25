const instructionButton = document.querySelector(".instruction-btn");

instructionButton.addEventListener("click", () => {

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
        "Please choose the language you are most comfortable using."
    );

    speech.lang = "en-IN";
    speech.rate = 0.9;
    speech.pitch = 1;

    speechSynthesis.speak(speech);

});
const cards = document.querySelectorAll(".language-card");

cards.forEach(card => {

    card.addEventListener("click", () => {

        cards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");

        const speakerButton = card.querySelector(".speaker-btn");

        const selectedLanguage = speakerButton.dataset.code;

        localStorage.setItem("language", selectedLanguage);

        const messages = {

    "en-IN": "✅ English Selected",

    "ta-IN": "✅ தமிழ் தேர்ந்தெடுக்கப்பட்டது",

    "hi-IN": "✅ हिन्दी चुनी गई",

    "te-IN": "✅ తెలుగు ఎంపిక చేయబడింది",

    "kn-IN": "✅ ಕನ್ನಡ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ",

    "ml-IN": "✅ മലയാളം തിരഞ്ഞെടുത്തു",

    "mr-IN": "✅ मराठी निवडले",

    "bn-IN": "✅ বাংলা নির্বাচিত"

};

        const toast = document.getElementById("toast");

        toast.innerHTML = messages[selectedLanguage];

        toast.classList.add("show");

        setTimeout(() => {

           window.location.href = "portal-selection.html";

        },1000);

    });

});

document.querySelectorAll(".speaker-btn").forEach(button => {

    button.addEventListener("click", (e) => {

        e.stopPropagation();

        const speech = new SpeechSynthesisUtterance(
            button.dataset.language
        );

        speech.lang = button.dataset.code;
        speech.rate = 0.9;

        speechSynthesis.speak(speech);

    });

});