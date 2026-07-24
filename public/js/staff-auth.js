// staff-auth.js
// Email/password login for Doctors and Government officials
// (Workers use phone OTP via auth.js — this is separate, for staff accounts)

import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Call when creating a new doctor/government account (typically an admin-only action)
export async function registerStaffAccount(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, uid: result.user.uid };
  } catch (error) {
    console.error("Error registering staff account:", error);
    return { success: false, message: error.message };
  }
}

// Call on the doctor/government login screen
export async function loginStaff(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, uid: result.user.uid, email: result.user.email };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, message: "Incorrect email or password." };
  }
}

export async function logoutStaff() {
  await signOut(auth);
}

// Use this to protect a page — redirects to login if nobody's signed in
export function requireStaffLogin(onLoggedIn, redirectUrl = 'login.html') {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      onLoggedIn(user);
    } else {
      window.location.href = redirectUrl;
    }
  });
}

/* ==========================================================
   EXAMPLE USAGE — Doctor registration (one-time, by an admin):
   ==========================================================

   import { registerStaffAccount } from './staff-auth.js';
   import { saveDoctor, saveUserRole } from './data.js';

   const result = await registerStaffAccount("doctor@hospital.com", "securepassword");
   if (result.success) {
     await saveDoctor({
       uid: result.uid,
       name: "Dr. Priya Sharma",
       email: "doctor@hospital.com",
       phone: "+919876543210",
       hospital: "Salem Government Hospital",
       specialization: "Pulmonology",
       registrationNumber: "TNMC-20541"
     });
     await saveUserRole(result.uid, "doctor");
   }

   ==========================================================
   EXAMPLE USAGE — Doctor login screen:
   ==========================================================

   import { loginStaff } from './staff-auth.js';
   import { getDoctorByUID } from './data.js';

   const result = await loginStaff(email, password);
   if (result.success) {
     const doctorProfile = await getDoctorByUID(result.uid);
     // redirect to doctor dashboard, using doctorProfile.name etc.
   } else {
     alert(result.message);
   }

   ==========================================================
   EXAMPLE USAGE — Protecting the doctor dashboard page:
   ==========================================================

   import { requireStaffLogin } from './staff-auth.js';

   requireStaffLogin((user) => {
     console.log("Logged in as:", user.email);
     // load dashboard data here
   }, 'doctor-login.html');

   ========================================================== */
