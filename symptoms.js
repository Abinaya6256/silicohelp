// ==========================================
// Dynamic Dropdown Translation
// ==========================================

const language = localStorage.getItem("language") || "en-IN";

if (typeof dropdownsText !== "undefined") {

    // Duration Dropdown
    const durationDropdown = document.getElementById("duration");

    if (durationDropdown) {

        durationDropdown.innerHTML = "";

        dropdownsText[language].durations.forEach((item, index) => {

            const option = document.createElement("option");

            option.textContent = item;

            option.value = index === 0 ? "" : item;

            durationDropdown.appendChild(option);

        });

    }

    // Smoking Dropdown
    const smokingDropdown = document.getElementById("smoking");

    if (smokingDropdown) {

        smokingDropdown.innerHTML = "";

        dropdownsText[language].smoking.forEach((item, index) => {

            const option = document.createElement("option");

            option.textContent = item;

            option.value = index === 0 ? "" : item;

            smokingDropdown.appendChild(option);

        });

    }

}
// ==========================================
// SILICOHELP - SYMPTOMS PAGE
// ==========================================

// All symptom radio groups
const symptomGroups = [
    "cough",
    "breath",
    "chest",
    "fever",
    "weight",
    "fatigue",
    "blood",
    "work"
];

// Counter
const counter = document.getElementById("symptomCount");

// Update symptom count
function updateCounter() {

    let count = 0;

    symptomGroups.forEach(group => {

        const selected = document.querySelector(`input[name="${group}"]:checked`);

        if(selected && selected.value === "Yes"){
            count++;
        }

    });

    counter.innerHTML = `Symptoms Reported: <strong>${count}</strong> / 8`;

}

// Listen to all radio buttons
document.querySelectorAll('input[type="radio"]').forEach(radio=>{

    radio.addEventListener("change",updateCounter);

});

// Initial update
updateCounter();


// ==========================================
// Continue Button
// ==========================================

document.getElementById("continueBtn").addEventListener("click",()=>{

    const symptoms={};

    // Check every symptom
    for(const group of symptomGroups){

        const selected=document.querySelector(`input[name="${group}"]:checked`);

        if(!selected){

            alert("Please answer all symptom questions.");

            return;

        }

        symptoms[group]=selected.value;

    }

    // Duration
    const duration=document.getElementById("duration").value;

    if(duration===""){

        alert("Please select symptom duration.");

        return;

    }

    // Smoking
    const smoking=document.getElementById("smoking").value;

    if(smoking===""){

        alert("Please select smoking history.");

        return;

    }

    // Save everything
    localStorage.setItem("persistentCough",symptoms.cough);

    localStorage.setItem("breathlessness",symptoms.breath);

    localStorage.setItem("chestPain",symptoms.chest);

    localStorage.setItem("fever",symptoms.fever);

    localStorage.setItem("weightLoss",symptoms.weight);

    localStorage.setItem("fatigue",symptoms.fatigue);

    localStorage.setItem("bloodCough",symptoms.blood);

    localStorage.setItem("workDifficulty",symptoms.work);

    localStorage.setItem("symptomDuration",duration);

    localStorage.setItem("smokingHistory",smoking);

    // Total symptoms
    let totalSymptoms=0;

    Object.values(symptoms).forEach(value=>{

        if(value==="Yes"){

            totalSymptoms++;

        }

    });

    localStorage.setItem("symptomScore",totalSymptoms);

    // Next Page
    window.location.href="upload.html";

});