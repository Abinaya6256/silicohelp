// claim.js — powers claim.html (Claim Preview)
// Loads case + worker + work history + doctor review data, wires up Submit Claim button

import {
  getXrayCase,
  getWorker,
  getWorkHistoryByWorker,
  getDoctorReviewByCase,
  createClaim,
  logNotification
} from './data.js';

const params = new URLSearchParams(window.location.search);
const caseId = params.get('caseId');

let currentCase = null;
let currentWorker = null;
let workHistory = null;
let doctorReview = null;

async function loadClaim() {
  if (!caseId) {
    alert('No case ID provided in the URL.');
    return;
  }

  currentCase = await getXrayCase(caseId);
  currentWorker = await getWorker(currentCase.workerId);
  workHistory = await getWorkHistoryByWorker(currentCase.workerId);
  doctorReview = await getDoctorReviewByCase(caseId);

  // Worker Information card
  document.getElementById('claimCaseId').textContent = currentCase.id;
  document.getElementById('claimWorkerId').textContent = currentCase.workerId;
  document.getElementById('claimWorkerName').textContent = currentWorker?.name || '—';
  document.getElementById('claimAge').textContent = currentWorker?.age || '—';
  document.getElementById('claimAadhaar').textContent = currentWorker?.aadhaarNumber || '—';
  document.getElementById('claimJobType').textContent = workHistory?.jobType || '—';
  document.getElementById('claimWorkplace').textContent = workHistory?.workplaceName || '—';
  document.getElementById('claimYearsWorked').textContent = workHistory?.yearsWorked
    ? `${workHistory.yearsWorked} Years` : '—';
  document.getElementById('claimDustExposure').textContent = workHistory?.dustExposureLevel || '—';
  document.getElementById('claimExposureScore').textContent = workHistory?.exposureScore
    ? `${workHistory.exposureScore} / 100` : '—';

  // Medical Assessment card
  document.getElementById('claimAiDiagnosis').textContent = currentCase.aiClassification || '—';
  document.getElementById('claimConfidence').textContent =
    currentCase.aiConfidenceScore ? Math.round(currentCase.aiConfidenceScore * 100) + '%' : '—';
  document.getElementById('claimDoctorDiagnosis').textContent = doctorReview?.finalDiagnosis || '—';
  document.getElementById('claimDoctorName').textContent = doctorReview?.doctorId || '—';
  document.getElementById('claimSignature').textContent = doctorReview?.digitalSignature
    ? `${doctorReview.digitalSignature} ✓` : 'Not signed';

  const eligible = currentCase.aiClassification === 'Silicosis' || currentCase.aiClassification === 'SilicoTB';
  document.getElementById('claimEligibility').textContent =
    eligible ? 'Eligible for Compensation' : 'Not Eligible for Compensation';
}

document.querySelector('.submit').addEventListener('click', async () => {
  // NOTE: pdfBase64 generation is Person 6's job (jsPDF) — this assumes
  // window.generateClaimPDF() exists and returns a base64 PDF string.
  // If that's not ready yet, this saves a placeholder instead.
  const pdfBase64 = typeof generateClaimPDF === 'function'
    ? await generateClaimPDF(currentCase, currentWorker, workHistory, doctorReview)
    : 'PLACEHOLDER_PDF_NOT_YET_GENERATED';

    console.log(pdfBase64);
    
  const claimId = await createClaim(caseId, currentCase.workerId, pdfBase64);
  await logNotification(currentCase.workerId, 'claim_submitted', 'Your compensation claim has been submitted.');

  alert(`Claim submitted! Claim ID: ${claimId}`);
});

loadClaim();
