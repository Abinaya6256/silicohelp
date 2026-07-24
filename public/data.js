// data.js
// Shared data library for SilicoHelp. All Firestore access goes through here.

import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

/* ========================================================
   CASE STATUS VALUES (used throughout xrayCases.status)
   ======================================================== */
// registered -> uploaded -> pending_doctor -> doctor_reviewed
// -> government_reviewed -> approved -> compensated

/* ========================================================
   GENERATE CUSTOM IDS (e.g. DOC0001, GOV0001)
   ======================================================== */

async function generateCustomId(prefix, collectionName) {
  const snap = await getDocs(
    query(collection(db, collectionName), orderBy("createdAt", "desc"), limit(1))
  );
  let number = 1;
  if (!snap.empty) {
    const lastId = snap.docs[0].data().customId;
    if (lastId) {
      number = parseInt(lastId.replace(prefix, "")) + 1;
    }
  }
  return `${prefix}${String(number).padStart(4, "0")}`;
}

/* ========================================================
   1. WORKERS
   ======================================================== */

export async function saveWorkerRegistration(workerData) {

  const customId = await generateCustomId("WRK", "workers");

  const docRef = doc(collection(db, "workers"));

  await setDoc(docRef, {
    customId,
    ...workerData,
    createdAt: serverTimestamp()
  });

  return docRef.id;
}

export async function getWorker(workerId) {
  const snap = await getDoc(doc(db, "workers", workerId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getAllWorkers() {
  const snap = await getDocs(collection(db, "workers"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ========================================================
   2. WORK HISTORY + EXPOSURE SCORE
   ======================================================== */

export async function saveWorkHistory(workerId, workHistoryData) {
  const docRef = await addDoc(collection(db, "workHistory"), {
    workerId,
    ...workHistoryData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getWorkHistoryByWorker(workerId) {
  const q = query(collection(db, "workHistory"), where("workerId", "==", workerId));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

/* ========================================================
   3. SYMPTOMS
   ======================================================== */

export async function saveSymptoms(workerId, symptomData) {
  const docRef = await addDoc(collection(db, "symptoms"), {
    workerId,
    ...symptomData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

/* ========================================================
   4. X-RAY CASES
   ======================================================== */

// NOTE: still storing xrayImageBase64 (not Firebase Storage). See note at bottom
// of this file — Storage requires the paid Blaze plan. Confirm with team before
// switching; if you do switch, image-helper.js + the upload flow need updating together.
export async function createXrayCase(workerId, xrayImageBase64, xrayHash = null) {

  // Generate custom Case ID (CASE0001, CASE0002...)
  const customId = await generateCustomId("CASE", "xrayCases");

  // Create Firestore document
  const docRef = doc(collection(db, "xrayCases"));

  await setDoc(docRef, {
    customId,
    workerId,
    xrayImageBase64,
    xrayHash,
    aiClassification: null,
    aiConfidenceScore: null,
    aiFindings: null,
    heatmapImageBase64: null,
    status: "uploaded",
    createdAt: serverTimestamp()
  });

  // Return the Firestore document ID
  return docRef.id;
}

const CLASSIFICATION_MAP = {
  "normal": "Normal", "silicosis": "Silicosis",
  "tuberculosis": "TB", "silicotuberculosis": "SilicoTB",
  "Normal": "Normal", "Silicosis": "Silicosis", "TB": "TB", "SilicoTB": "SilicoTB"
};

function normalizeClassification(rawValue) {
  if (!rawValue) return rawValue;
  const normalized = CLASSIFICATION_MAP[rawValue.trim()];
  if (!normalized) {
    console.warn(`Unrecognized AI classification value: "${rawValue}".`);
    return rawValue;
  }
  return normalized;
}

export async function updateXrayCaseWithAIResult(caseId, aiResult) {
  await updateDoc(doc(db, "xrayCases", caseId), {
    ...aiResult,
    aiClassification: normalizeClassification(aiResult.aiClassification),
    status: "pending_doctor"
  });
}

export async function getXrayCase(caseId) {
  const snap = await getDoc(doc(db, "xrayCases", caseId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getXrayCasesByWorker(workerId) {
  const q = query(collection(db, "xrayCases"), where("workerId", "==", workerId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllXrayCases() {
  const snap = await getDocs(collection(db, "xrayCases"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPendingDoctorCases() {
  const q = query(collection(db, "xrayCases"), where("status", "==", "pending_doctor"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Government sees only doctor-reviewed or later-stage cases
export async function getGovernmentReviewCases() {
  const q = query(collection(db, "xrayCases"), where("status", "in", ["doctor_reviewed", "government_reviewed", "approved", "compensated"]));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ========================================================
   5. DOCTOR REVIEWS
   ======================================================== */

export async function saveDoctorReview(caseId, reviewData) {
  const existingReview = await getDoctorReviewByCase(caseId);
  if (existingReview) {
    throw new Error("This case has already been reviewed.");
  }
  // reviewData = { doctorId, doctorName, doctorEmail, hospital, registrationNumber,
  //                 decision, remarks, finalDiagnosis, digitalSignature }
  const docRef = await addDoc(collection(db, "doctorReviews"), {
    caseId,
    ...reviewData,
    reviewedAt: serverTimestamp()
  });

  await updateDoc(doc(db, "xrayCases", caseId), {
    status: "doctor_reviewed"
  });

  return docRef.id;
}

export async function getDoctorReviewByCase(caseId) {
  const q = query(collection(db, "doctorReviews"), where("caseId", "==", caseId));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

/* ========================================================
   6. DOCTORS
   ======================================================== */

export async function saveDoctor(doctorData) {
  const customId = await generateCustomId("DOC", "doctors");
  const docRef = doc(collection(db, "doctors"));
  await setDoc(docRef, {
    customId,
    uid: doctorData.uid,
    name: doctorData.name,
    email: doctorData.email,
    phone: doctorData.phone,
    hospital: doctorData.hospital,
    specialization: doctorData.specialization,
    registrationNumber: doctorData.registrationNumber,
    role: "doctor",
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getDoctor(doctorId) {
  const snap = await getDoc(doc(db, "doctors", doctorId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getDoctorByUID(uid) {
  const q = query(collection(db, "doctors"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getAllDoctors() {
  const snap = await getDocs(collection(db, "doctors"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ========================================================
   7. GOVERNMENT USERS
   ======================================================== */

export async function saveGovernmentUser(user) {
  const customId = await generateCustomId("GOV", "governmentUsers");
  const docRef = doc(collection(db, "governmentUsers"));
  await setDoc(docRef, {
    customId,
    uid: user.uid,
    name: user.name,
    email: user.email,
    department: user.department,
    designation: user.designation,
    role: "government",
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getGovernmentUser(uid) {
  const q = query(collection(db, "governmentUsers"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

/* ========================================================
   8. USER ROLES
   ======================================================== */

export async function saveUserRole(uid, role) {
  await setDoc(doc(db, "users", uid), {
    uid,
    role,
    updatedAt: serverTimestamp()
  });
}

export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

/* ========================================================
   9. CLAIMS / GOVERNMENT COMPENSATION DECISION
   ======================================================== */

export async function createClaim(caseId, workerId, pdfBase64) {
  const docRef = await addDoc(collection(db, "claims"), {
    caseId,
    workerId,
    pdfBase64,
    submissionStatus: "submitted",
    labourDeptStatus: "pending",
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateClaimStatus(claimId, newStatus) {
  await updateDoc(doc(db, "claims", claimId), {
    submissionStatus: newStatus,
    updatedAt: serverTimestamp()
  });
}

// Government uses this to approve/reject compensation, with decision history
export async function saveCompensationDecision(claimId, caseId, decision, decidedBy, remarks = null, compensationAmount = null) {
  await updateDoc(doc(db, "claims", claimId), {
    labourDeptStatus: decision,        // "approved" | "rejected"
    compensationAmount,
    decisionRemarks: remarks,
    decidedBy,
    decidedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  await updateDoc(doc(db, "xrayCases", caseId), {
    status: decision === "approved" ? "approved" : "government_reviewed"
  });
}

export async function getClaim(claimId) {
  const snap = await getDoc(doc(db, "claims", claimId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getClaimByWorker(workerId) {
  const q = query(collection(db, "claims"), where("workerId", "==", workerId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllClaims() {
  const snap = await getDocs(collection(db, "claims"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ========================================================
   10. NOTIFICATIONS
   ======================================================== */

export async function logNotification(workerId, type, message) {
  const docRef = await addDoc(collection(db, "notifications"), {
    workerId,
    type,
    message,
    sentAt: serverTimestamp()
  });
  return docRef.id;
}

/* ========================================================
   11. FRAUD DETECTION
   ======================================================== */

export async function isDuplicateAadhaar(aadhaarNumber) {
  const q = query(collection(db, "workers"), where("aadhaarNumber", "==", aadhaarNumber));
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function isDuplicateXray(xrayHash) {
  if (!xrayHash) return false;
  const q = query(collection(db, "xrayCases"), where("xrayHash", "==", xrayHash));
  const snap = await getDocs(q);
  return !snap.empty;
}

/* ========================================================
   NOTE ON X-RAY STORAGE
   ======================================================== 
   Images are stored as compressed base64 strings directly in Firestore
   (xrayImageBase64 field), NOT in Firebase Storage. This was a deliberate
   team decision because Firebase Storage now requires the paid Blaze plan
   even for free-tier usage. If your team wants to switch to Storage,
   confirm with everyone first — image-helper.js and the upload flow in
   Person 1's code both need to change together, or existing cases will
   break.
   ======================================================== */
