// -------------------- Dynamic Job Types --------------------

const jobDropdown = document.getElementById("jobType");

if (jobDropdown && typeof dropdownsText !== "undefined") {

    const language =
        localStorage.getItem("language") || "en-IN";

    const jobs =
        dropdownsText[language].jobTypes;

    jobDropdown.innerHTML = "";

    jobs.forEach((job, index) => {

        const option = document.createElement("option");

        option.textContent = job;

        option.value = index === 0 ? "" : job;

        jobDropdown.appendChild(option);

    });

}
const yearsSlider = document.getElementById("years");
const yearsValue = document.getElementById("yearsValue");
yearsValue.innerText = yearsSlider.value + " years";
const riskMessage = document.getElementById("riskMessage");

function updateYears() {
    yearsValue.innerText = yearsSlider.value + " years";

    if (yearsSlider.value >= 10) {
        riskMessage.innerHTML = "⚠️ High occupational exposure risk.";
    } else {
        riskMessage.innerHTML = "✅ Lower occupational exposure.";
    }
}

// Show the initial value as soon as the page loads
updateYears();

// Update while dragging
yearsSlider.addEventListener("input", updateYears);

let selectedDust = "";
let selectedMask = "";

// Dust Exposure

document.querySelectorAll(".dust-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".dust-btn").forEach(btn =>
            btn.classList.remove("selected")
        );

        button.classList.add("selected");

        selectedDust = button.innerText;

    });

});

// Safety Equipment

document.querySelectorAll(".mask-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".mask-btn").forEach(btn =>
            btn.classList.remove("selected")
        );

        button.classList.add("selected");

        selectedMask = button.innerText;

    });

});

// Continue

document.getElementById("continueBtn").addEventListener("click", () => {

    const workplace = document.getElementById("workplace").value;
    const jobType = document.getElementById("jobType").value;
    const yearsWorked = yearsSlider.value;

    if(workplace === ""){

        alert("Please enter your workplace name.");

        return;

    }

    if(jobType === ""){

        alert("Please select your job type.");

        return;

    }

    if(selectedDust === ""){

        alert("Please select your daily dust exposure.");

        return;

    }

    if(selectedMask === ""){

        alert("Please select your safety equipment usage.");

        return;

    }

    localStorage.setItem("workplace", workplace);
    localStorage.setItem("jobType", jobType);
    localStorage.setItem("yearsWorked", yearsWorked);
    localStorage.setItem("dustExposure", selectedDust);
    localStorage.setItem("maskUsage", selectedMask);

    window.location.href = "symptoms.html";

});