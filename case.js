// case.js — powers case.html (Case Review)
// Loads the specific case from the URL, wires up Approve/Reject/Claim buttons

import { getXrayCase, getWorker, saveDoctorReview } from './data.js';

// Get caseId from the URL
const params = new URLSearchParams(window.location.search);
const caseId = params.get('caseId');

let currentCase = null;
let currentWorker = null;

async function loadCase() {
  if (!caseId) {
    alert('No case ID provided in the URL.');
    return;
  }

  currentCase = await getXrayCase(caseId);
  console.log(currentCase);

  if (!currentCase) {
    alert('Case not found.');
    return;
  }

  currentWorker = await getWorker(currentCase.workerId);

  // Worker Info
  document.getElementById('caseID').textContent =
    currentCase.customId || currentCase.id;

document.getElementById('workerID').textContent =
    currentWorker?.customId || currentCase.workerId;
  document.getElementById('workerName').textContent = currentWorker?.name || '—';
  document.getElementById('workerAge').textContent = currentWorker?.age || '—';
  document.getElementById('aadhaar').textContent = currentWorker?.aadhaarNumber || '—';
  document.getElementById('phone').textContent = currentWorker?.phoneNumber || '—';

  // X-Ray
  if (currentCase.xrayImageBase64) {
    document.getElementById('xrayImage').src = currentCase.xrayImageBase64;
  }

  if (currentCase.heatmapImageBase64) {
    document.getElementById('heatmapImage').src = currentCase.heatmapImageBase64;
  }

  // AI Diagnosis
  const prediction = document.getElementById("prediction");

if (currentCase.isConfident === false) {
  prediction.textContent =
    currentCase.warningMessage || "⚠️ AI confidence is too low. Please review manually.";

  prediction.style.color = "#d97706";   // orange warning
} else {
  prediction.textContent =
    currentCase.aiClassification || "Processing...";

  prediction.style.color = "";
}

  if (currentCase.isConfident === false) {
  document.getElementById("confidence").textContent = "--";
  document.getElementById("confidenceBar").style.width = "0%";
  document.getElementById("confidenceBar").textContent = "";
} else {
  const confidencePct = currentCase.aiConfidenceScore
    ? Math.round(currentCase.aiConfidenceScore * 100)
    : 0;

  document.getElementById("confidence").textContent = confidencePct + "%";
  document.getElementById("confidenceBar").style.width = confidencePct + "%";
  document.getElementById("confidenceBar").textContent = confidencePct + "%";
}

  // AI Findings
  const findingsList = document.getElementById('aiFindings');
  findingsList.innerHTML = '';

  if (currentCase.aiFindings) {
    const li = document.createElement('li');
    li.textContent = currentCase.aiFindings;
    findingsList.appendChild(li);
  }

  // Eligibility Badge
const riskBadge = document.getElementById("riskBadge");
const eligBadge = document.getElementById("eligibilityBadge");

if (currentCase.isConfident === false) {

    // Hide High Risk badge
    riskBadge.style.display = "none";

    // Show warning badge
    eligBadge.textContent = "Low AI Confidence - Manual Review Required";
    eligBadge.className = "badge warning";

} else {

    // Show High Risk badge again
    riskBadge.style.display = "inline-block";

    const eligible =
        currentCase.aiClassification === "Silicosis" ||
        currentCase.aiClassification === "SilicoTB";

    eligBadge.textContent = eligible
        ? "Eligible for Compensation"
        : "Not Eligible for Compensation";

    eligBadge.className = eligible
        ? "badge success"
        : "badge secondary";
}
}
async function handleReview(decision) {
  console.log("Approve/Reject button clicked!");
  if (!currentCase) {
    alert("Case data has not loaded yet.");
    return;
  }

  const remarks = document.getElementById("doctorremarks").value;
  const rejectReason = document.getElementById("rejectReason").value;
  const signature = document.getElementById("signature").value;

  if (!signature) {
    alert("Digital signature is required.");
    return;
  }

  const doctor = document.getElementById("doctorSelect");
  const selectedDoctor = doctor.options[doctor.selectedIndex];

  if (doctor.selectedIndex === 0) {
    alert("Please select a reviewing doctor.");
    return;
  }

  const doctorName = selectedDoctor.text;
  const hospital = selectedDoctor.dataset.hospital;
  const registrationNumber = selectedDoctor.dataset.reg;

  const finalDiagnosis =
    decision === "confirmed"
      ? currentCase.aiClassification
      : "rejected";

  await saveDoctorReview(caseId, {
    doctorId: "doctor-001",
    doctorName,
    hospital,
    registrationNumber,
    decision,
    finalDiagnosis,
    digitalSignature: signature,
    remarks,
    rejectReason: decision === "rejected" ? rejectReason : null
  });

  const outcomeDiv = document.getElementById("outcomeMessage");

  const eligible =
  finalDiagnosis === "Silicosis" ||
  finalDiagnosis === "SilicoTB";

  if (decision === "rejected") {
    outcomeDiv.innerHTML =
      "<p>❌ Case rejected. Worker will be notified.</p>";
  } else if (eligible) {
    outcomeDiv.innerHTML =
      `<p>✅ Confirmed: ${finalDiagnosis}. Claim can now be generated.</p>`;

    document.getElementById("claimBtn").disabled = false;
  } else {
    outcomeDiv.innerHTML =
      `<p>✅ Confirmed: ${finalDiagnosis}. Health advisory will be sent (no claim).</p>`;
  }
}

// Buttons
document.getElementById("approveBtn").addEventListener("click", () => {
  handleReview("confirmed");
});

document.getElementById("rejectBtn").addEventListener("click", () => {
  handleReview("rejected");
});

document.getElementById("claimBtn").addEventListener("click", () => {
  window.location.href = `claim.html?caseId=${caseId}`;
});

// Load case
loadCase();

// Doctor dropdown
const doctorSelect = document.getElementById("doctorSelect");

doctorSelect.addEventListener("change", function () {
  const selected = this.options[this.selectedIndex];

  document.getElementById("doctorNameCard").textContent = selected.text;
  document.getElementById("doctorDepartmentCard").textContent =
    selected.dataset.department;
  document.getElementById("doctorRegCard").textContent =
    selected.dataset.reg;
});