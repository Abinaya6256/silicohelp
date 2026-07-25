import {
    getAllWorkers,
    getAllClaims,
    getAllXrayCases,
    getAllDoctorReviews
} from "./data.js";

let allClaims = [];
let workerMap = {};
let caseMap = {};
let reviewMap = {};

const container = document.querySelector(".claims-container");
const searchInput = document.querySelector(".filters input");
const statusFilter = document.querySelector(".filters select");

async function loadVerificationCenter() {

    const workers = await getAllWorkers();
    const claims = await getAllClaims();
    const cases = await getAllXrayCases();
    const reviews = await getAllDoctorReviews();

    allClaims = claims;

    workerMap = {};
    workers.forEach(w => workerMap[w.id] = w);

    caseMap = {};
    cases.forEach(c => caseMap[c.id] = c);

    reviewMap = {};
    reviews.forEach(r => reviewMap[r.caseId] = r);

    // Summary cards
    document.getElementById("pendingCount").textContent =
        claims.filter(c => c.labourDeptStatus === "pending").length;

    document.getElementById("reviewCount").textContent =
        claims.filter(c => c.submissionStatus === "under_verification").length;

    document.getElementById("approvedCount").textContent =
        claims.filter(c => c.labourDeptStatus === "approved").length;

    document.getElementById("rejectedCount").textContent =
        claims.filter(c => c.labourDeptStatus === "rejected").length;

    renderCards(allClaims);
}

function renderCards(claims) {

    container.innerHTML = "";

    if (claims.length === 0) {
        container.innerHTML = "<h3>No claims found.</h3>";
        return;
    }

    claims.forEach(claim => {

        const worker = workerMap[claim.workerId];
        const xray = caseMap[claim.caseId];
        const review = reviewMap[claim.caseId];

        const checks = [
            !!worker?.aadhaarNumber,
            !!xray,
            !!review,
            !!worker?.address
        ];

        const progress = Math.round(
            (checks.filter(Boolean).length / checks.length) * 100
        );

        let priority = "low";

        if (progress < 50) priority = "high";
        else if (progress < 100) priority = "medium";

        const card = document.createElement("div");

        card.className = "claim-card";

        card.innerHTML = `
            <div class="card-top">
                <div>
                    <h2>${worker?.name ?? "Unknown Worker"}</h2>
                    <p>Claim ID : <strong>${claim.id}</strong></p>
                </div>

                <span class="priority ${priority}">
                    ${priority.toUpperCase()}
                </span>
            </div>

            <div class="details">
                <p><i class="fa-solid fa-location-dot"></i> ${worker?.address ?? "-"}</p>
                <p><i class="fa-solid fa-stethoscope"></i> ${review?.finalDiagnosis ?? xray?.aiClassification ?? "-"}</p>
                <p><i class="fa-solid fa-calendar"></i> ${claim.submissionStatus}</p>
            </div>

            <h3>Verification Checklist</h3>

            <div class="checklist">
                <p>${worker?.aadhaarNumber ? "✅" : "❌"} Aadhaar Verified</p>
                <p>${xray ? "✅" : "❌"} X-Ray Uploaded</p>
                <p>${review ? "✅" : "❌"} Doctor Review</p>
                <p>${worker?.address ? "✅" : "❌"} Address Available</p>
            </div>

            <div class="progress-header">
                <span>Verification Progress</span>
                <span>${progress}%</span>
            </div>

            <div class="progress-bar">
                <div class="progress-fill" style="width:${progress}%"></div>
            </div>

            <button class="review-btn">
                Review Claim
            </button>
        `;

        card.querySelector(".review-btn").addEventListener("click", () => {
            window.location.href = `compensation.html?id=${claim.id}`;
        });

        container.appendChild(card);
    });
}

function applyFilters() {

    const keyword = searchInput.value.toLowerCase();
    const status = statusFilter.value;

    const filtered = allClaims.filter(claim => {

        const worker = workerMap[claim.workerId];

        const searchMatch =
            (worker?.name ?? "").toLowerCase().includes(keyword) ||
            claim.id.toLowerCase().includes(keyword);

        const statusMatch =
            status === "All Status" ||
            claim.labourDeptStatus === status ||
            claim.submissionStatus === status;

        return searchMatch && statusMatch;
    });

    renderCards(filtered);
}

searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);

loadVerificationCenter();