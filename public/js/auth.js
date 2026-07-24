// auth.js
// Phone OTP login for worker registration.
// Person 1: import these two functions into your registration screen.
//
// HOW IT WORKS (2 steps):
//   Step 1: sendOTP(phoneNumber) -> sends the OTP, shows a "enter code" box
//   Step 2: verifyOTP(code)      -> checks the code, logs the worker in
//
// HTML REQUIREMENT: you need one invisible div in your page for this to work:
//   <div id="recaptcha-container"></div>
// (This is just a Google spam-prevention check — it's invisible, no visible captcha shown)

import { auth } from './firebase-config.js';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

let confirmationResult = null;

// Call this when the worker submits their phone number
export async function sendOTP(phoneNumber) {
  // phoneNumber must be in format: "+91XXXXXXXXXX"
  try {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible'
    });

    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    return { success: true, message: "OTP sent!" };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, message: error.message };
  }
}

// Call this when the worker types in the 6-digit code they received
export async function verifyOTP(code) {
  try {
    if (!confirmationResult) {
      return { success: false, message: "Please request an OTP first." };
    }
    const result = await confirmationResult.confirm(code);
    // result.user contains the logged-in Firebase user object
    return { success: true, uid: result.user.uid, phoneNumber: result.user.phoneNumber };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, message: "Incorrect code. Please try again." };
  }
}

/* ==========================================================
   EXAMPLE USAGE (for Person 1 — copy this pattern):
   ==========================================================

   import { sendOTP, verifyOTP } from './js/auth.js';

   // When "Send OTP" button clicked:
   const result = await sendOTP("+919876543210");
   if (result.success) {
     // show the "enter code" input box
   } else {
     alert(result.message);
   }

   // When "Verify" button clicked:
   const verifyResult = await verifyOTP("123456");
   if (verifyResult.success) {
     // worker is logged in! proceed to registration form
     console.log("Logged in as:", verifyResult.phoneNumber);
   } else {
     alert(verifyResult.message);
   }

   ========================================================== */
