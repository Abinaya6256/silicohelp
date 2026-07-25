// ==========================================
// SILICOHELP - AI RESULT PAGE
// ==========================================

import { getXrayCase } from "./data.js";

// ------------------------------
// Elements
// ------------------------------

const xrayImage = document.getElementById("xrayImage");
const heatmapImage =
document.getElementById("heatmapImage");
const prediction = document.getElementById("prediction");
const confidence = document.getElementById("confidence");
const findings = document.getElementById("findings");
const recommendation = document.getElementById("recommendationText");

const lang =
    localStorage.getItem("language") || "en-IN";

// ------------------------------
// Icons & Colors
// ------------------------------

const predictionStyle = {

    normal: {
        icon: "✅",
        color: "#16A34A"
    },

    silicosis: {
        icon: "🟠",
        color: "#F59E0B"
    },

    silicotuberculosis: {
        icon: "🟣",
        color: "#7C3AED"
    },

    tuberculosis: {
        icon: "🟡",
        color: "#EAB308"
    }

};

// ------------------------------
// Load AI Result
// ------------------------------

async function loadResult() {

    try {

        const caseId =
            localStorage.getItem("currentCaseId");

        if (!caseId) {

            alert("No AI result found.");

            return;

        }

        const xrayCase =
            await getXrayCase(caseId);

        console.log(xrayCase);

        // Uploaded Image

        if (xrayCase.xrayImageBase64) {

            xrayImage.src =
                xrayCase.xrayImageBase64;

        }
        const analysisMode = localStorage.getItem("analysisMode");

if (
    analysisMode === "demo" ||
    !xrayCase.heatmapImageBase64
) {

    heatmapImage.src =
        "../assets/images/demo-heatmap.png";

}
else {

    heatmapImage.src =
        xrayCase.heatmapImageBase64;

}
        // Classification

        const type =
            xrayCase.aiClassification.toLowerCase();

        const style =
            predictionStyle[type] || predictionStyle.normal;

        prediction.innerText =
            style.icon + " " +
            xrayCase.aiClassification;

        prediction.style.color =
            style.color;

        // Confidence Animation

        const finalScore =
            Math.round(
                xrayCase.aiConfidenceScore * 100
            );

        let score = 0;

        const animation = setInterval(() => {

            score++;

            confidence.innerText =
                score + "%";

            if (score >= finalScore) {

                clearInterval(animation);

            }

        }, 20);

        // Findings

        findings.innerHTML = "";

        xrayCase.aiFindings
            .split(",")

            .forEach(item => {

                const li =
                    document.createElement("li");

                li.textContent =
                    item.trim();

                findings.appendChild(li);

            });

        // Recommendation

        if (!xrayCase.isConfident) {

            recommendation.innerText =
                xrayCase.warningMessage;

        }
        else {

            recommendation.innerText =
                "Please consult a certified pulmonologist for medical confirmation.";

        }

        // Save for Dashboard

        localStorage.setItem(
            "aiPrediction",
            xrayCase.aiClassification
        );

        localStorage.setItem(
            "aiConfidence",
            finalScore + "%"
        );

    }

    catch (err) {

        console.error(err);

        alert("Unable to load AI result.");

    }

}

loadResult();

// ------------------------------
// Continue
// ------------------------------

document
    .getElementById("doctorBtn")
    .addEventListener("click", () => {

        window.location.href =
            "worker-dashboard.html";

    });