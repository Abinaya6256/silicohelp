// ==========================================
// SILICOHELP - DOCTOR CASES
// PART 1 : FOUNDATION
// ==========================================

import {
    getAllXrayCases,
    getAllWorkers
} from "./data.js";

// ==========================================
// DOM ELEMENTS
// ==========================================

const pendingContainer =
document.getElementById("pendingCases");

const reviewedContainer =
document.getElementById("reviewedCases");

const pendingSection =
document.getElementById("pendingSection");

const reviewedSection =
document.getElementById("reviewedSection");

const searchInput =
document.getElementById("searchInput");

const statusFilter =
document.getElementById("statusFilter");

const pendingCount =
document.getElementById("pendingCount");

const approvedCount =
document.getElementById("approvedCount");

const rejectedCount =
document.getElementById("rejectedCount");

const totalCases =
document.getElementById("totalCases");

// ==========================================
// GLOBAL VARIABLES
// ==========================================

let allCases = [];

let workerMap = {};

let currentFilter = "all";

let currentDiagnosis = "all";

let searchText = "";

// ==========================================
// INITIALIZE
// ==========================================

window.addEventListener("DOMContentLoaded", async () => {

    await loadCases();

});

// ==========================================
// LOAD FIREBASE DATA
// ==========================================

async function loadCases(){

    try{

        const cases = await getAllXrayCases();

        const workers = await getAllWorkers();

        workerMap = {};

        workers.forEach(worker=>{

            workerMap[worker.id] = worker.name;

        });

        allCases = [...cases];

        sortCases();

        updateStatistics();

        setActiveCard("totalCard");

        showSections("all");

        applyFilters();

    }

    catch(error){

        console.error(error);

        pendingContainer.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <h2>Unable to load cases</h2>

            <p>Please refresh the page.</p>

        </div>

        `;

    }

}

// ==========================================
// SORT CASES
// ==========================================

function sortCases(){

    allCases.sort((a,b)=>{

        const first = a.createdAt || 0;

        const second = b.createdAt || 0;

        return second - first;

    });

}

// ==========================================
// UPDATE STATISTICS
// ==========================================
function updateStatistics(){

    let pending = 0;
    let approved = 0;
    let rejected = 0;

    allCases.forEach(c=>{

        switch((c.status || "").toLowerCase()){

            case "pending":
            case "pending_doctor":
                pending++;
                break;

            case "approved":
            case "doctor_reviewed":
                approved++;
                break;

            case "rejected":
                rejected++;
                break;

            default:
                console.warn("Unknown status:", c.id, c.status);
        }

    });

    pendingCount.textContent = pending;
    approvedCount.textContent = approved;
    rejectedCount.textContent = rejected;
    totalCases.textContent = pending + approved + rejected;

}

// ==========================================
// APPLY ALL FILTERS
// ==========================================

function applyFilters(){

    let filtered = [...allCases];

    // Search

    if(searchText !== ""){

        filtered = filtered.filter(c=>{

            const workerName =
            (workerMap[c.workerId] || "")
            .toLowerCase();

            const diagnosis =
            (c.aiClassification || "")
            .toLowerCase();

            return (

                workerName.includes(searchText) ||

                c.workerId.toLowerCase().includes(searchText) ||

                c.id.toLowerCase().includes(searchText) ||

                diagnosis.includes(searchText)

            );

        });

    }

    // Status

    if(currentFilter !== "all"){

        filtered = filtered.filter(c=>{

            switch(currentFilter){

                case "pending":

                    return c.status==="pending_doctor";

                case "approved":

                    return c.status==="doctor_reviewed";

                case "rejected":

                    return c.status==="rejected";

                default:

                    return true;

            }

        });

    }

    // Diagnosis

    if(currentDiagnosis !== "all"){

        filtered = filtered.filter(c=>{

            return (c.aiClassification || "")
            .toLowerCase()
            .includes(currentDiagnosis);

        });

    }

    renderCases(filtered);

}
// ==========================================
// PART 2 : RENDERING ENGINE
// ==========================================

function renderCases(cases){

    pendingContainer.innerHTML = "";

    reviewedContainer.innerHTML = "";

    if(cases.length===0){

        const emptyHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-folder-open"></i>

            <h2>No Cases Found</h2>

            <p>No worker cases match your search.</p>

        </div>

        `;

        pendingContainer.innerHTML = emptyHTML;

        reviewedContainer.innerHTML = emptyHTML;

        return;

    }

    cases.forEach(c=>{

        const card = createCaseCard(c);

        switch(c.status){

            case "doctor_reviewed":

                reviewedContainer.appendChild(card);

                break;

            case "pending_doctor":

            case "rejected":

            default:

                pendingContainer.appendChild(card);

        }

    });

}

// ==========================================
// CREATE CASE CARD
// ==========================================

function createCaseCard(c){

    const workerName =
        workerMap[c.workerId] || "Unknown Worker";

    const confidence =
        c.aiConfidenceScore
        ? Math.round(c.aiConfidenceScore * 100)
        : 0;

    const diagnosis =
        c.aiClassification || "Processing";

    const initials = workerName
        .split(" ")
        .map(word=>word[0])
        .join("")
        .substring(0,2)
        .toUpperCase();

    const diagnosisClass =
        getDiagnosisClass(diagnosis);

    const statusInfo =
        getStatusInfo(c.status);

    const card = document.createElement("div");

    card.className = "case-card";

    card.innerHTML = `

<div class="card-header">

    <div class="worker-profile">

        <div class="avatar">

            ${initials}

        </div>

        <div>

            <h2>${workerName}</h2>

            <p>Worker ID : ${c.workerId}</p>

        </div>

    </div>

    <span class="priority medium">

        Case

    </span>

</div>

<div class="card-body">

    <div class="info-grid">

        <div class="info-box">

            <h4>Case ID</h4>

            <p>${c.id}</p>

        </div>

        <div class="info-box">

            <h4>AI Diagnosis</h4>

            <span class="diagnosis ${diagnosisClass}">

                ${diagnosis}

            </span>

        </div>

        <div class="info-box">

            <h4>Confidence</h4>

            <p>${confidence}%</p>

        </div>

        <div class="info-box">

            <h4>Status</h4>

            <span class="status ${statusInfo.className}">

                ${statusInfo.text}

            </span>

        </div>

    </div>

    <div class="confidence">

        <div class="confidence-top">

            <span>AI Confidence</span>

            <span>${confidence}%</span>

        </div>

        <div class="progress">

            <div
                class="progress-fill"
                style="width:${confidence}%">

            </div>

        </div>

    </div>

    <div class="status-row">

        <button
            class="review-btn"
            onclick="window.location.href='case.html?caseId=${c.id}'">

            ${statusInfo.button}

        </button>

    </div>

</div>

`;

    return card;

}

// ==========================================
// STATUS INFO
// ==========================================

function getStatusInfo(status){

    switch(status){

        case "doctor_reviewed":

            return{

                className:"approved",

                text:"Reviewed",

                button:"View Review"

            };

        case "rejected":

            return{

                className:"rejected",

                text:"Rejected",

                button:"View Case"

            };

        default:

            return{

                className:"pending",

                text:"Pending Review",

                button:"Review Case"

            };

    }

}

// ==========================================
// DIAGNOSIS COLORS
// ==========================================

function getDiagnosisClass(diagnosis){

    switch(diagnosis.toLowerCase()){

        case "silicosis":

            return "silicosis";

        case "tuberculosis":

            return "tb";

        case "silico-tb":

            return "silicotb";

        case "pneumonia":

            return "pneumonia";

        default:

            return "normal";

    }

}
// ==========================================
// PART 3 : INTERACTIONS
// ==========================================

// ACTIVE DASHBOARD CARD

function setActiveCard(cardId){

    document.querySelectorAll(".stat-card").forEach(card=>{

        card.classList.remove("active");

    });

    const card=document.getElementById(cardId);

    if(card){

        card.classList.add("active");

    }

}

// ==========================================
// SHOW / HIDE SECTIONS
// ==========================================

function showSections(type){

    switch(type){

        case "pending":

            pendingSection.style.display="block";
            reviewedSection.style.display="none";
            break;

        case "approved":

            pendingSection.style.display="none";
            reviewedSection.style.display="block";
            break;

        case "rejected":

            pendingSection.style.display="block";
            reviewedSection.style.display="none";
            break;

        default:

            pendingSection.style.display="block";
            reviewedSection.style.display="block";

    }

}

// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener("input",()=>{

    searchText=searchInput.value
        .trim()
        .toLowerCase();

    applyFilters();

});

// ==========================================
// STATUS DROPDOWN
// ==========================================

statusFilter.addEventListener("change",()=>{

    currentFilter=statusFilter.value;

    switch(currentFilter){

        case "pending":

            setActiveCard("pendingCard");
            showSections("pending");
            break;

        case "approved":

            setActiveCard("approvedCard");
            showSections("approved");
            break;

        case "rejected":

            setActiveCard("rejectedCard");
            showSections("rejected");
            break;

        default:

            setActiveCard("totalCard");
            showSections("all");

    }

    applyFilters();

});

// ==========================================
// DASHBOARD CARDS
// ==========================================

document.getElementById("pendingCard")
.addEventListener("click",()=>{

    currentFilter="pending";

    statusFilter.value="pending";

    setActiveCard("pendingCard");

    showSections("pending");

    applyFilters();

});

document.getElementById("approvedCard")
.addEventListener("click",()=>{

    currentFilter="approved";

    statusFilter.value="approved";

    setActiveCard("approvedCard");

    showSections("approved");

    applyFilters();

});

document.getElementById("rejectedCard")
.addEventListener("click",()=>{

    currentFilter="rejected";

    statusFilter.value="rejected";

    setActiveCard("rejectedCard");

    showSections("rejected");

    applyFilters();

});

document.getElementById("totalCard")
.addEventListener("click",()=>{

    currentFilter="all";

    statusFilter.value="all";

    setActiveCard("totalCard");

    showSections("all");

    applyFilters();

});

// ==========================================
// DIAGNOSIS FILTER BUTTONS
// ==========================================

const filterButtons=
document.querySelectorAll(".filter-btn");

filterButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        filterButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

        currentDiagnosis=
        button.textContent
            .trim()
            .toLowerCase();

        if(currentDiagnosis==="all"){

            currentDiagnosis="all";

        }

        applyFilters();

    });

});

// ==========================================
// REFRESH
// ==========================================

const refreshBtn=
document.querySelector(".action-btn:last-child");

if(refreshBtn){

    refreshBtn.addEventListener("click",()=>{

        loadCases();

    });

}

// ==========================================
// LOGOUT
// ==========================================

const logoutBtn=
document.getElementById("logoutBtn");

if(logoutBtn){

    logoutBtn.addEventListener("click",()=>{

        if(confirm("Are you sure you want to logout?")){

            window.location.href="doctor-login.html";

        }

    });

}

// ==========================================

console.log("Doctor Cases Loaded Successfully");