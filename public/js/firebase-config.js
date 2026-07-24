// firebase-config.js
// This file connects our app to our real Firebase project.
// Everyone on the team should import from THIS file — don't create new configs.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxVaZg6kECdJNydSRIXCUiZwzMA_q436A",
  authDomain: "silicohelp-8f9c5.firebaseapp.com",
  projectId: "silicohelp-8f9c5",
  storageBucket: "silicohelp-8f9c5.firebasestorage.app",
  messagingSenderId: "525693038905",
  appId: "1:525693038905:web:a9042734a1b4f4a5e5b8e8",
  measurementId: "G-41D988NQ6T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable offline mode — lets the app work with no internet and sync later.
// This is the "Offline Mode" feature from our feature list.
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Offline persistence failed: multiple tabs open at once.');
  } else if (err.code === 'unimplemented') {
    console.warn('Offline persistence not supported in this browser.');
  }
});

export { db, auth };
