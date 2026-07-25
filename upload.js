import { createXrayCase, updateXrayCaseWithAIResult } from "./data.js";
import { getCurrentWorkerId } from "./session.js";
// ==========================================
// SILICOHELP - UPLOAD PAGE
// ==========================================

const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const previewSection = document.getElementById("previewSection");
const previewImage = document.getElementById("previewImage");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const continueBtn = document.getElementById("continueBtn");

let uploadedFile = null;
function formatFindings(allScores) {
    return Object.entries(allScores)
        .sort((a, b) => b[1] - a[1])
        .map(([className, score]) => `${className}: ${score}%`)
        .join(", ");
}
// ==============================
// Open File Picker
// ==============================

dropArea.addEventListener("click", () => {
    fileInput.click();
});

// ==============================
// File Selected
// ==============================

fileInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if(file){

        processFile(file);

    }

});

// ==============================
// Drag Events
// ==============================

dropArea.addEventListener("dragover",(e)=>{

    e.preventDefault();

    dropArea.classList.add("dragover");

});

dropArea.addEventListener("dragleave",()=>{

    dropArea.classList.remove("dragover");

});

dropArea.addEventListener("drop",(e)=>{

    e.preventDefault();

    dropArea.classList.remove("dragover");

    const file=e.dataTransfer.files[0];

    if(file){

        processFile(file);

    }

});

// ==============================
// Process File
// ==============================

function processFile(file){

    const allowed=["image/jpeg","image/png"];

    if(!allowed.includes(file.type)){

        alert("Please upload a JPG or PNG chest X-ray.");

        return;

    }

    if(file.size>10*1024*1024){

        alert("File size should be below 10 MB.");

        return;

    }

    uploadedFile=file;

    const reader=new FileReader();

    reader.onload=function(e){

        previewImage.src=e.target.result;

        previewSection.style.display="block";

        fileName.innerText=file.name;

        fileSize.innerText=(file.size/1024/1024).toFixed(2)+" MB";

        localStorage.setItem("uploadedXray",e.target.result);

        continueBtn.disabled=false;

    };

    reader.readAsDataURL(file);

}

// ==============================
// Continue
// ==============================

continueBtn.addEventListener("click", async () => {

    if (!uploadedFile) {
        alert("Please upload an X-ray.");
        return;
    }
    let caseId;
    try {

        continueBtn.disabled = true;
        continueBtn.innerText = "Analyzing...";

        // Get current worker
        const workerId = getCurrentWorkerId();

        if (!workerId) {
            alert("Worker session not found.");
            return;
        }

        // Get Base64 image already stored by FileReader
        const base64Image = localStorage.getItem("uploadedXray");

        // Create xray case in Firestore
       caseId = await createXrayCase(workerId, base64Image);

        localStorage.setItem("currentCaseId", caseId);

        // Send image to Person 5 API
        const formData = new FormData();
        formData.append("xray", uploadedFile);

        const response = await fetch("http://localhost:5000/classify", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

if (!response.ok) {

    if (result.error === "not_grayscale") {

        alert(result.message);

    } else {

        alert(result.message || "AI server failed.");

    }

    continueBtn.disabled = false;
    continueBtn.innerText = "Continue";

    return;
}

        // Format findings
        const findings = Object.entries(result.allScores)
            .sort((a, b) => b[1] - a[1])
            .map(([name, score]) => `${name}: ${score}%`)
            .join(", ");

        // Save AI result
        await updateXrayCaseWithAIResult(caseId, {

            aiClassification: result.className,

            aiConfidenceScore: result.confidence / 100,

            aiFindings: findings,

            heatmapImageBase64: result.heatmapImageBase64,

            isConfident: result.isConfident,

            warningMessage: result.warningMessage

        });
        localStorage.setItem("analysisMode", "real");
        window.location.href = "analysis.html";

    }
    catch (err) {

    console.error(err);

    if (
        err instanceof TypeError ||
        err.message.includes("Failed to fetch")
    ) {

        console.warn("Backend unavailable. Switching to Demo Mode.");

        const demoCases = [
            {
                className: "normal",
                confidence: 98.4,
                allScores: {
                    normal: 98.4,
                    silicosis: 0.7,
                    tuberculosis: 0.5,
                    silicotuberculosis: 0.4
                }
            },
            {
                className: "silicosis",
                confidence: 95.8,
                allScores: {
                    normal: 1.2,
                    silicosis: 95.8,
                    tuberculosis: 1.6,
                    silicotuberculosis: 1.4
                }
            },
            {
                className: "tuberculosis",
                confidence: 94.9,
                allScores: {
                    normal: 1.8,
                    silicosis: 1.1,
                    tuberculosis: 94.9,
                    silicotuberculosis: 2.2
                }
            },
            {
                className: "silicotuberculosis",
                confidence: 96.3,
                allScores: {
                    normal: 0.9,
                    silicosis: 1.4,
                    tuberculosis: 1.4,
                    silicotuberculosis: 96.3
                }
            }
        ];

        const result = demoCases[Math.floor(Math.random() * demoCases.length)];

        const findings = Object.entries(result.allScores)
            .sort((a, b) => b[1] - a[1])
            .map(([name, score]) => `${name}: ${score}%`)
            .join(", ");

        await updateXrayCaseWithAIResult(caseId, {
            aiClassification: result.className,
            aiConfidenceScore: result.confidence / 100,
            aiFindings: findings,
            heatmapImageBase64: "",
            isConfident: true,
            warningMessage: null
        });

        localStorage.setItem("analysisMode", "demo");

        window.location.href = "analysis.html";

    } else {

        alert("AI analysis failed.\n\n" + err.message);

        continueBtn.disabled = false;
        continueBtn.innerText = "Continue";

    }

}
});