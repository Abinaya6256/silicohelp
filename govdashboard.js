// government.js — powers government/dashboard.html (Government Dashboard)

import { getAllWorkers, getAllXrayCases, getAllClaims } from './data.js';

async function loadGovDashboard() {
  const workers = await getAllWorkers();
  const cases = await getAllXrayCases();
  const claims = await getAllClaims();

  // Top stat cards
  document.getElementById('totalWorkers').textContent = workers.length;
  document.getElementById('approvedClaims').textContent =
    claims.filter(c => c.submissionStatus === 'approved').length;
  document.getElementById('pendingClaims').textContent =
    claims.filter(c => c.submissionStatus === 'submitted' || c.submissionStatus === 'under_verification').length;
  document.getElementById('rejectedClaims').textContent =
    claims.filter(c => c.submissionStatus === 'rejected').length;
  document.getElementById('pendingReview').textContent =
    cases.filter(c => c.status === 'pending_doctor').length;
  document.getElementById('pendingAI').textContent =
    cases.filter(c => c.status === 'pending_ai').length;

  // Disease Distribution
  document.getElementById('silicosisCount').textContent =
    cases.filter(c => c.aiClassification === 'Silicosis').length;
  document.getElementById('silicoTbCount').textContent =
    cases.filter(c => c.aiClassification === 'SilicoTB').length;
  document.getElementById('tbCount').textContent =
    cases.filter(c => c.aiClassification === 'TB').length;
  document.getElementById('normalCount').textContent =
    cases.filter(c => c.aiClassification === 'Normal').length;

  // Recent Claims table — build dynamically instead of hardcoded rows
  const workerMap = {};
  workers.forEach(w => { workerMap[w.id] = w.name; });

  const tbody = document.querySelector('.claims-table tbody');
  tbody.innerHTML = '';

  claims.slice(0, 10).forEach(claim => {
    const relatedCase = cases.find(c => c.id === claim.caseId);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${claim.caseId}</td>
      <td>${workerMap[claim.workerId] || 'Unknown'}</td>
      <td>—</td>
      <td>${relatedCase?.aiClassification || '—'}</td>
      <td><span class="status ${claim.submissionStatus === 'approved' ? 'approved' : 'pending'}">${claim.submissionStatus}</span></td>
      <td><span class="status ${claim.labourDeptStatus === 'approved' ? 'approved' : 'pending'}">${claim.labourDeptStatus}</span></td>
      <td><button class="process-btn"onclick="window.location.href='compensation.html?id=${claim.id}'">Process</button>
</td>
    `;
    tbody.appendChild(row);
  });
}

loadGovDashboard();
