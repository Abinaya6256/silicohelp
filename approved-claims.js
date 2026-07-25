import {
    getAllClaims,
    getAllWorkers,
    getAllXrayCases
} from "./data.js";

const tbody = document.querySelector("#claimsTable tbody");
const searchInput = document.getElementById("searchInput");

let approvedClaims = [];
let workerMap = {};
let caseMap = {};

async function loadApprovedClaims() {

    const claims = await getAllClaims();
    const workers = await getAllWorkers();
    const cases = await getAllXrayCases();

    workerMap = {};
    workers.forEach(worker => {
        workerMap[worker.id] = worker;
    });

    caseMap = {};
    cases.forEach(xrayCase => {
        caseMap[xrayCase.id] = xrayCase;
    });

    approvedClaims = claims.filter(
        claim => claim.labourDeptStatus === "approved"
    );

    renderTable(approvedClaims);
}

function renderTable(claims) {

    tbody.innerHTML = "";

    claims.forEach(claim => {

        const worker = workerMap[claim.workerId];
        const xray = caseMap[claim.caseId];

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${claim.id}</td>
            <td>${worker?.name ?? "-"}</td>
            <td>${xray?.aiClassification ?? "-"}</td>
            <td>₹${claim.compensationAmount ?? 0}</td>
            <td>${
                claim.updatedAt
                    ? new Date(claim.updatedAt.seconds * 1000).toLocaleDateString()
                    : "-"
            }</td>
            <td>
                <button class="pdf-btn">
                    <i class="fa-solid fa-file-pdf"></i>
                    Download
                </button>
            </td>
        `;

        row.querySelector(".pdf-btn").addEventListener("click", () => {

            if (!claim.pdfBase64) {
                alert("No PDF available.");
                return;
            }

            const link = document.createElement("a");

            link.href = `data:application/pdf;base64,${claim.pdfBase64}`;
            link.download = `Claim-${claim.id}.pdf`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        });

        tbody.appendChild(row);

    });

}

searchInput.addEventListener("keyup", () => {

    const keyword = searchInput.value.toLowerCase();

    const filtered = approvedClaims.filter(claim => {

        const worker = workerMap[claim.workerId];

        return (
            claim.id.toLowerCase().includes(keyword) ||
            (worker?.name ?? "").toLowerCase().includes(keyword)
        );

    });

    renderTable(filtered);

});

loadApprovedClaims();