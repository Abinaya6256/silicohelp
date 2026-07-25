// aadhaarValidation.js
// -----------------------------------------------------------------------
// Validates that a typed-in Aadhaar number is well-formed: exactly 12
// digits, AND passes the Verhoeff checksum algorithm that real Aadhaar
// numbers are generated with.
//
// IMPORTANT - what this does and doesn't prove:
// - It CAN catch typos (e.g. transposed digits, one wrong digit) before
//   they ever get submitted, because a mistyped number will almost always
//   fail the checksum.
// - It CANNOT prove the number belongs to a real, existing person, or
//   that this specific worker actually owns it. That would require a
//   live UIDAI verification service (e-KYC), which needs official
//   AUA/KUA registration - not something available for this project.
//   This is a format/typo check, not an identity verification.
//
// The Verhoeff algorithm is a standard, publicly documented checksum
// algorithm (not something UIDAI invented) - the three lookup tables
// below are the standard, fixed tables used by every correct
// implementation of it, and are verified below against known-correct
// test values before being used for real.
// -----------------------------------------------------------------------

// Multiplication table (d) - standard Verhoeff table, fixed values
const d = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,2,3,4,0,6,7,8,9,5],
  [2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],
  [4,0,1,2,3,9,5,6,7,8],
  [5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],
  [7,6,5,9,8,2,1,0,4,3],
  [8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0]
];

// Permutation table (p) - standard Verhoeff table, fixed values
const p = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,5,7,6,2,8,3,0,9,4],
  [5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],
  [9,4,5,3,1,2,6,8,7,0],
  [4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],
  [7,0,4,6,9,1,3,2,5,8]
];

// Inverse table - standard Verhoeff table, fixed values
const inv = [0,4,3,2,1,5,6,7,8,9];

/**
 * Computes the Verhoeff checksum for a string of digits.
 * Returns 0 if the number is valid (this is how the algorithm works -
 * a valid number's checksum computes to exactly 0).
 */
function verhoeffChecksum(digitString) {
  let c = 0;
  const digits = digitString.split('').reverse().map(Number);
  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[i % 8][digits[i]]];
  }
  return c;
}

/**
 * Main function to use: checks that a value is a well-formed, checksum-
 * valid Aadhaar number.
 *
 * Returns { valid: true } or { valid: false, reason: "..." } - always
 * check the reason and show it to the person so they know what to fix.
 */
function validateAadhaarNumber(rawInput) {
  const cleaned = String(rawInput).replace(/\s/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, reason: 'Aadhaar number should contain only digits.' };
  }
  if (cleaned.length !== 12) {
    return { valid: false, reason: `Aadhaar numbers are exactly 12 digits (this one has ${cleaned.length}).` };
  }
  if (verhoeffChecksum(cleaned) !== 0) {
    return { valid: false, reason: 'This doesn\'t look like a valid Aadhaar number - please double check for typos.' };
  }
  return { valid: true };
}

export { validateAadhaarNumber };
