import {
    getClaim,
    getWorker,
    getXrayCase,
    getDoctorReviewByCase,
    getWorkHistoryByWorker,
    updateClaimStatus
} from "./data.js";

const params = new URLSearchParams(window.location.search);
const claimId = params.get("id");

const approveBtn = document.getElementById("approveBtn");
const rejectBtn = document.getElementById("rejectBtn");

let currentClaim = null;

async function loadClaim() {

    if (!claimId) {
        alert("Invalid claim.");
        return;
    }

    currentClaim = await getClaim(claimId);

    if (!currentClaim) {
        alert("Claim not found.");
        return;
    }

    const worker = await getWorker(currentClaim.workerId);
    const xray = await getXrayCase(currentClaim.caseId);
    const doctor = await getDoctorReviewByCase(currentClaim.caseId);
    const workHistory = await getWorkHistoryByWorker(currentClaim.workerId);

    document.getElementById("claimId").textContent = currentClaim.id;

    document.getElementById("claimStatus").textContent =
        currentClaim.labourDeptStatus;

    document.getElementById("workerName").textContent =
        worker?.name ?? "-";

    document.getElementById("workerAge").textContent =
        worker?.age ?? "-";

    document.getElementById("occupation").textContent =
        workHistory?.jobType ?? "-";

    document.getElementById("aadhaar").textContent =
        worker?.aadhaarNumber ?? "-";

    document.getElementById("aiDiagnosis").textContent =
        xray?.aiClassification ?? "-";

    document.getElementById("confidence").textContent =
        xray?.aiConfidenceScore
            ? `${xray.aiConfidenceScore}%`
            : "-";

    document.getElementById("doctorDiagnosis").textContent =
        doctor?.finalDiagnosis ?? "-";

    document.getElementById("remarks").textContent =
        doctor?.remarks ?? "-";

}

loadClaim();
approveBtn.addEventListener("click", async () => {

    const remarks = document.getElementById("govRemarks").value.trim();

    if (!remarks) {
        alert("Please enter officer remarks.");
        return;
    }

    try {

        await updateClaimStatus(
         currentClaim.id,
         "approved",
          document.getElementById("compensationAmount").value,
          document.getElementById("compensationReason").value,
         document.getElementById("govRemarks").value
);

        alert("Claim Approved Successfully!");

        window.location.href = "approved-claims.html";

    } catch (error) {

        console.error(error);
        alert("Failed to approve claim.");

    }

});

rejectBtn.addEventListener("click", async () => {

    const confirmReject = confirm("Reject this claim?");

    if (!confirmReject) return;

    const remarks = document.getElementById("govRemarks").value.trim();

    if (!remarks) {
        alert("Please enter officer remarks.");
        return;
    }

    try {

        await updateClaimStatus(
    currentClaim.id,
    "rejected",
    0,
    "",
    document.getElementById("govRemarks").value
);

        alert("Claim Rejected.");

        window.location.href = "govdashboard.html";

    } catch (error) {

        console.error(error);
        alert("Failed to reject claim.");

    }

});