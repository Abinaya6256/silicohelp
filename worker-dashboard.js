import { displayClaimStatus } from "./claimTracker.js";
import { clearCurrentWorkerId } from "./session.js";
// ==========================================
// SILICOHELP - WORKER DASHBOARD
// ==========================================

// Welcome Name
const workerName = localStorage.getItem("fullName");

document.getElementById("workerName").innerText =
workerName
? "Welcome, " + workerName + " 👋"
: "Welcome 👋";

// =============================
// AI Prediction
// =============================

// If Person 4 later stores the real result,
// it will automatically appear here.

const prediction =
localStorage.getItem("aiPrediction") ||
"Awaiting Doctor Review";

const confidence =
localStorage.getItem("aiConfidence") ||
"--";

document.getElementById("predictionResult").innerText =
prediction;

document.getElementById("confidenceResult").innerText =
confidence;


// =============================
// Logout
// =============================

document.getElementById("logoutBtn")
.addEventListener("click",()=>{

    if(confirm("Are you sure you want to logout?")){

        clearCurrentWorkerId();

localStorage.clear();

window.location.href = "login.html";
    }

});
displayClaimStatus().catch(console.error);