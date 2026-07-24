// doctor.js — powers dashboard (1).html (Doctor Dashboard)
// Lists all X-ray cases, shows stats, links each row to case.html

import { getAllXrayCases, getAllWorkers } from './data.js';

async function loadDashboard() {
  const cases = await getAllXrayCases();
  const workers = await getAllWorkers();

 // Build a quick lookup: workerId -> worker object
const workerMap = {};
workers.forEach(w => {
  workerMap[w.id] = w;
});

  // Stats
  const pending = cases.filter(c => c.status === 'pending_doctor').length;
  const reviewed = cases.filter(c => c.status === 'doctor_reviewed');
  document.querySelector('.stat-card:nth-child(1) h2').textContent = pending;
  document.querySelector('.stat-card:nth-child(4) h2').textContent = cases.length;
  // NOTE: "Approved"/"Rejected" counts need doctorReviews data cross-referenced —
  // for now showing reviewed count; ask Person 3 if you need exact approve/reject split

  // Build table rows
  const tbody = document.querySelector('table tbody');
  tbody.innerHTML = '';

  cases.forEach(c => {
    const row = document.createElement('tr');
    const statusLabel = c.status === 'doctor_reviewed' ? 'approved' : 'pending';
    const statusText = c.status === 'doctor_reviewed' ? 'Approved' : 'Pending';

   const worker = workerMap[c.workerId];

const worker = workerMap[c.workerId];

row.innerHTML = `
      <td>${c.customId || c.id}</td>
      <td>${worker?.customId || c.workerId}</td>
      <td>${worker?.name || 'Unknown'}</td>
  <td>${c.aiClassification || 'Processing...'}</td>
  <td>${c.aiConfidenceScore ? Math.round(c.aiConfidenceScore * 100) + '%' : '—'}</td>
  <td><span class="${statusLabel}">${statusText}</span></td>
  <td>
    <a href="case.html?caseId=${c.id}">
      <button class="review-btn">${statusLabel === 'approved' ? 'View' : 'Review'}</button>
    </a>
  </td>
`;
    tbody.appendChild(row);
  });
}

loadDashboard();
