import {
    getAllWorkers,
    getAllClaims,
    getAllXrayCases
} from "./data.js";

const workersCount=document.getElementById("workersCount");
const casesCount=document.getElementById("casesCount");
const claimsCount=document.getElementById("claimsCount");

const approvedCount=document.getElementById("approvedCount");
const pendingCount=document.getElementById("pendingCount");
const rejectedCount=document.getElementById("rejectedCount");

async function loadAnalytics(){

    const workers=await getAllWorkers();
    const claims=await getAllClaims();
    const cases=await getAllXrayCases();

    workersCount.textContent=workers.length;
    casesCount.textContent=cases.length;
    claimsCount.textContent=claims.length;

    const approved=claims.filter(c=>c.labourDeptStatus==="approved").length;

    const rejected=claims.filter(c=>c.labourDeptStatus==="rejected").length;

    const pending=claims.filter(c=>c.labourDeptStatus==="pending").length;

    approvedCount.textContent=approved;
    rejectedCount.textContent=rejected;
    pendingCount.textContent=pending;

    buildDiseaseChart(cases);

    buildClaimChart(approved,pending,rejected);

}

function buildDiseaseChart(cases){

    let silicosis=0;
    let normal=0;
    let tb=0;
    let silicoTB=0;

    cases.forEach(c=>{

        switch(c.aiClassification){

            case "Silicosis":
                silicosis++;
                break;

            case "Tuberculosis":
                tb++;
                break;

            case "Silicotuberculosis":
                silicoTB++;
                break;

            default:
                normal++;

        }

    });

    new Chart(document.getElementById("diseaseChart"),{

        type:"bar",

        data:{

            labels:["Normal","Silicosis","TB","SilicoTB"],

            datasets:[{

                label:"Cases",

                data:[
                    normal,
                    silicosis,
                    tb,
                    silicoTB
                ]

            }]

        }

    });

}

function buildClaimChart(a,p,r){

    new Chart(document.getElementById("claimChart"),{

        type:"doughnut",

        data:{

            labels:["Approved","Pending","Rejected"],

            datasets:[{

                data:[a,p,r]

            }]

        }

    });

}

loadAnalytics();