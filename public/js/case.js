// case.js — powers case.html (Case Review)
// Loads the specific case from the URL, wires up Approve/Reject/Claim buttons

import { getXrayCase, getWorker, saveDoctorReview, isDuplicateXray } from './data.js';

// Get caseId from the URL, e.g. case.html?caseId=abc123
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
  if (!currentCase) {
    alert('Case not found.');
    return;
  }
  currentWorker = await getWorker(currentCase.workerId);

  // Fill in worker info
document.getElementById('caseID').textContent =
    currentCase.customId || currentCase.id;

document.getElementById('workerID').textContent =
    currentWorker?.customId || currentCase.workerId;

document.getElementById('workerName').textContent = currentWorker?.name || '—';
document.getElementById('workerAge').textContent = currentWorker?.age || '—';
document.getElementById('aadhaar').textContent = currentWorker?.aadhaarNumber || '—';
document.getElementById('phone').textContent = currentWorker?.phoneNumber || '—';
  // Fill in X-ray + AI diagnosis
  if (currentCase.xrayImageBase64) {
    document.getElementById('xrayImage').src = currentCase.xrayImageBase64;
  }
  if (currentCase.heatmapImageBase64) {
    document.getElementById('heatmapImage').src = currentCase.heatmapImageBase64;
  }
  document.getElementById('prediction').textContent = currentCase.aiClassification || 'Processing...';
  const confidencePct = currentCase.aiConfidenceScore ? Math.round(currentCase.aiConfidenceScore * 100) : 0;
  document.getElementById('confidence').textContent = confidencePct + '%';
  document.getElementById('confidenceBar').style.width = confidencePct + '%';
  document.getElementById('confidenceBar').textContent = confidencePct + '%';

  // AI Findings list
  const findingsList = document.getElementById('aiFindings');
  findingsList.innerHTML = '';
  if (currentCase.aiFindings) {
    const li = document.createElement('li');
    li.textContent = currentCase.aiFindings;
    findingsList.appendChild(li);
  }

  // Eligibility badge — only Silicosis/SilicoTB are claim-eligible
  const eligible = currentCase.aiClassification === 'Silicosis' || currentCase.aiClassification === 'SilicoTB';
  const eligBadge = document.getElementById('eligibilityBadge');
  eligBadge.textContent = eligible ? 'Eligible for Compensation' : 'Not Eligible for Compensation';
  eligBadge.className = eligible ? 'badge success' : 'badge secondary';
}

async function handleReview(decision) {
  const remarks = document.getElementById('doctorremarks').value;
  const rejectReason = document.getElementById('rejectReason').value;
  const signature = document.getElementById('signature').value;

  if (!signature) {
    alert('Digital signature is required.');
    return;
  }

  const finalDiagnosis = decision === 'confirmed' ? currentCase.aiClassification : 'rejected';

  await saveDoctorReview(caseId, {
    doctorId: 'doctor-001', // TODO: replace with real logged-in doctor ID once doctor auth exists
    decision,
    finalDiagnosis,
    digitalSignature: signature,
    remarks,
    rejectReason: decision === 'rejected' ? rejectReason : null
  });

  const outcomeDiv = document.getElementById('outcomeMessage');
  const eligible = finalDiagnosis === 'Silicosis' || finalDiagnosis === 'SilicoTB';

  if (decision === 'rejected') {
    outcomeDiv.innerHTML = `<p>❌ Case rejected. Worker will be notified.</p>`;
  } else if (eligible) {
    outcomeDiv.innerHTML = `<p>✅ Confirmed: ${finalDiagnosis}. Claim can now be generated.</p>`;
    document.getElementById('claimBtn').disabled = false;
  } else {
    outcomeDiv.innerHTML = `<p>✅ Confirmed: ${finalDiagnosis}. Health advisory will be sent (no claim, not silica-related).</p>`;
  }
}

document.getElementById('approveBtn').addEventListener('click', () => handleReview('confirmed'));
document.getElementById('rejectBtn').addEventListener('click', () => handleReview('rejected'));
document.getElementById('claimBtn').addEventListener('click', () => {
  window.location.href = `claim.html?caseId=${caseId}`;
});

loadCase();
