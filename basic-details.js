import { validateAadhaarNumber } from "./aadharValidation.js";
import { saveWorkerRegistration } from "./data.js";
import { setCurrentWorkerId } from "./session.js";

console.log("basic-details.js loaded");
console.log("Saved mobile:", localStorage.getItem("mobile"));
const aadhaarInput = document.getElementById("aadhaar");

aadhaarInput.addEventListener("input", () => {

    let value = aadhaarInput.value.replace(/\D/g, "");

    value = value.substring(0,12);

    value = value.replace(/(\d{4})(?=\d)/g,"$1 ");

    aadhaarInput.value = value;

});
// Auto-fill mobile number from OTP page

const savedMobile = localStorage.getItem("mobile");

if(savedMobile){

    const mobileInput = document.getElementById("mobile");

    if(mobileInput){

        mobileInput.value = savedMobile;
        console.log("Assigned:", mobileInput.value);
setTimeout(() => {
    console.log("After 1 second:", mobileInput.value);
}, 1000);

        mobileInput.readOnly = true;

    }

}

// -------------------- Gender Selection --------------------

let selectedGender = "";

const genderButtons = document.querySelectorAll(".gender-btn");

genderButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        genderButtons.forEach(btn=>btn.classList.remove("selected"));

        button.classList.add("selected");

        selectedGender = button.innerText.trim();

    });

});

// -------------------- Continue --------------------

document.getElementById("continueBtn").addEventListener("click", async () => {
console.log("Continue button clicked");

const fullName = document.getElementById("fullName").value.trim();

const aadhaar = document.getElementById("aadhaar").value.trim();

const dob = document.getElementById("dob").value;

const address = document.getElementById("address").value.trim();

const village = document.getElementById("village").value.trim();

const district = document.getElementById("district").value.trim();

const state = document.getElementById("state").value;
    

    // Validation

    if(fullName===""){

        alert("Please enter your full name.");

        return;

    }

    const aadhaarNumber = aadhaar.replace(/\s/g, "");

// First check: exactly 12 digits
if (aadhaarNumber.length !== 12 || !/^\d{12}$/.test(aadhaarNumber)) {
    alert("Please enter a valid 12-digit Aadhaar number.");
    return;
}

// Second check: Verhoeff validation
const result = validateAadhaarNumber(aadhaarNumber);

if (!result.valid) {
    alert(result.reason);
    aadhaarInput.focus();
    return;
}
if (dob === "") {
    alert("Please select your Date of Birth.");
    return;
}

    if(selectedGender===""){

        alert("Please select your gender.");

        return;

    }

    if(address===""){

        alert("Please enter your address.");

        return;

    }

    if(village===""){

        alert("Please enter your village/town.");

        return;

    }

    if(district===""){

        alert("Please enter your district.");

        return;

    }

    if(state===""){

        alert("Please select your state.");

        return;

    }

localStorage.setItem("fullName", fullName);
localStorage.setItem("aadhaar", aadhaarNumber);
localStorage.setItem("dob", dob);
localStorage.setItem("gender", selectedGender);
localStorage.setItem("address", address);
localStorage.setItem("village", village);
localStorage.setItem("district", district);
localStorage.setItem("state", state);

try {
    const birth = new Date(dob);
const today = new Date();

let age = today.getFullYear() - birth.getFullYear();

const month = today.getMonth() - birth.getMonth();

if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
    age--;
}
    const workerData = {

        name: fullName,
        age: age,
        aadhaarNumber: aadhaarNumber,
        gender: selectedGender,
        address: address,
        village: village,
        district: district,
        state: state,
        dob: dob,
        phoneNumber: savedMobile

    };

    const workerId = await saveWorkerRegistration(workerData);

console.log("Returned workerId:", workerId);

setCurrentWorkerId(workerId);

console.log(
    "Stored workerId:",
    localStorage.getItem("silicohelp_currentWorkerId")
);

    window.location.href = "occupational-history.html";

}
catch(error){

    console.error(error);

    alert("Registration failed. Please try again.");

}

});
document.getElementById("dob").max =
new Date().toISOString().split("T")[0];
const dob = document.getElementById("dob");

dob.addEventListener("change", () => {

    const birth = new Date(dob.value);

    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const month = today.getMonth() - birth.getMonth();

    if(month < 0 || (month === 0 && today.getDate() < birth.getDate())){

        age--;

    }

    document.getElementById("ageDisplay").innerHTML =
"🎂 Age: <strong>" + age + " years</strong>";

});
// -------------------- Dynamic State Translation --------------------

const stateDropdown = document.getElementById("state");

if (stateDropdown && typeof dropdownsText !== "undefined") {

    const language =
        localStorage.getItem("language") || "en-IN";

    const states =
        dropdownsText[language].states;

    stateDropdown.innerHTML = "";

    states.forEach((state, index) => {

        const option = document.createElement("option");

        option.textContent = state;

        option.value = index === 0 ? "" : state;

        stateDropdown.appendChild(option);

    });

}