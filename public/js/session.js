// session.js
// Stores the current logged-in worker's ID so any page can access it
// (Worker Dashboard, Claim Tracking, etc.) without passing it around manually.
//
// HOW IT WORKS:
//   - Person 1 calls setCurrentWorkerId() once, right after registration succeeds
//   - Any other page calls getCurrentWorkerId() to know who's logged in

const STORAGE_KEY = 'silicohelp_currentWorkerId';

// Call this right after saveWorkerRegistration() returns a workerId
export function setCurrentWorkerId(workerId) {
  localStorage.setItem(STORAGE_KEY, workerId);
}

// Call this on any page that needs to know who's currently logged in
export function getCurrentWorkerId() {
  return localStorage.getItem(STORAGE_KEY);
}

// Call this on logout
export function clearCurrentWorkerId() {
  localStorage.removeItem(STORAGE_KEY);
}

/* ==========================================================
   EXAMPLE USAGE — Person 1 (registration screen):
   ==========================================================

   import { saveWorkerRegistration } from './data.js';
   import { setCurrentWorkerId } from './session.js';

   const workerId = await saveWorkerRegistration({ name, age, ... });
   setCurrentWorkerId(workerId);   // <-- add this line right after registration

   ==========================================================
   EXAMPLE USAGE — Person 6 (worker-dashboard.js):
   ==========================================================

   import { getCurrentWorkerId } from './session.js';
   import { getClaimByWorker } from './data.js';

   const workerId = getCurrentWorkerId();
   if (!workerId) {
     // no one logged in — redirect to login/registration page
     window.location.href = 'register.html';
   } else {
     const claims = await getClaimByWorker(workerId);
     // display claims on the dashboard
   }

   ========================================================== */
