// image-helper.js
// Converts an uploaded X-ray photo into a compressed base64 string,
// since we're storing images directly in Firestore (no Firebase Storage).
//
// Person 1: use this in your X-ray upload screen before calling createXrayCase().

// Compresses and converts an image file to base64.
// maxWidth keeps the file small enough for Firestore's 1MB document limit.
export function imageToBase64(file, maxWidth = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize proportionally if wider than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 0.7 quality keeps file size low while staying clear enough to view
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(base64);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ==========================================================
   EXAMPLE USAGE (for Person 1 — copy this pattern):
   ==========================================================

   import { imageToBase64 } from './js/image-helper.js';
   import { createXrayCase } from './js/data.js';

   // When worker selects an X-ray file from <input type="file">:
   const fileInput = document.getElementById('xrayFileInput');
   const file = fileInput.files[0];

   const base64Image = await imageToBase64(file);
   const caseId = await createXrayCase(workerId, base64Image);

   console.log("X-ray case created:", caseId);

   ========================================================== */
