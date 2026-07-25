// ==========================================
// SILICOHELP - CLAIM TRACKER
// Person 6
// ==========================================

import { getCurrentWorkerId } from "./session.js";
import { getClaimByWorker } from "./data.js";

const STAGE_LABELS = {
    submitted: "Claim Submitted",
    under_verification: "Doctor Verification",
    approved: "Approved",
    rejected: "Rejected"
};

const STATUS_LABELS = {
    submitted: "🟡 Under Review",
    under_verification: "🟡 Under Review",
    approved: "🟢 Approved",
    rejected: "🔴 Rejected"
};

export async function displayClaimStatus() {

    const workerId = getCurrentWorkerId();

    if (!workerId) {
        console.log("No worker is currently logged in.");
        return;
    }

    try {

        const claims = await getClaimByWorker(workerId);

        if (!claims || claims.length === 0) {

            document.getElementById("claimStatus").textContent = "No Claim Yet";
            document.getElementById("claimId").textContent = "--";
            document.getElementById("submittedDate").textContent = "--";
            document.getElementById("currentStage").textContent = "Awaiting Diagnosis";
            document.getElementById("lastUpdated").textContent = "--";

            return;
        }

        const claim = claims[0];

        document.getElementById("claimStatus").textContent =
            STATUS_LABELS[claim.submissionStatus] || claim.submissionStatus;

        document.getElementById("claimId").textContent =
            claim.id;

        document.getElementById("submittedDate").textContent =
            claim.submittedAt
                ? claim.submittedAt.toDate().toLocaleDateString()
                : "--";

        document.getElementById("currentStage").textContent =
            STAGE_LABELS[claim.submissionStatus] || claim.submissionStatus;

        document.getElementById("lastUpdated").textContent =
            claim.updatedAt
                ? claim.updatedAt.toDate().toLocaleString()
                : "--";

    } catch (error) {

        console.error("Error loading claim:", error);

    }

}