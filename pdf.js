// ===============================
// Worker Data
// ============================

    export async function generateClaimPDF(currentCase, currentWorker, workHistory, doctorReview) {
     const workerData = {
    claimId: currentCase.id,
    reportDate: new Date().toLocaleDateString(),
    status: "Under Review",

    workerName: currentWorker?.name || "-",
    workerId: currentWorker?.id || currentCase.workerId,
    aadhaar: currentWorker?.aadhaarNumber || "-",
    age: currentWorker?.age || "-",
    gender: currentWorker?.gender || "-",
    mobile: currentWorker?.phoneNumber || "-",
    address: currentWorker?.address || "-",

    occupation: workHistory?.jobType || "-",
    employer: workHistory?.workplaceName || "-",
    yearsWorked: workHistory?.yearsWorked || "-",
    dustLevel: workHistory?.dustExposureLevel || "-",
    maskUsage: workHistory?.maskUsage || "-",
    exposureScore: workHistory?.exposureScore || "-",
    exposureRisk: workHistory?.exposureLevel || "-",

    diagnosis: currentCase.aiClassification || "-",
    confidence: currentCase.aiConfidenceScore
        ? Math.round(currentCase.aiConfidenceScore * 100) + "%"
        : "-",

    xrayDate: currentCase.uploadedAt
        ? currentCase.uploadedAt.toDate().toLocaleDateString()
        : "-",

    doctorName: doctorReview?.doctorName || "-",
    doctorRegistration: doctorReview?.registrationNumber || "-",
    hospital: doctorReview?.hospital || "-",
    doctorDecision: doctorReview?.decision || "-",
    remarks: doctorReview?.remarks || "-",

    compensation: "₹3,00,000"
};   
        
        
        
        
        const { jsPDF } = window.jspdf;
        console.log("workerData =", workerData);
        console.log("Age type =", workerData.age, typeof workerData.age);


    const doc = new jsPDF("p","mm","a4");
    // Page Border

doc.setDrawColor(0,70,140);
doc.setLineWidth(0.8);
doc.rect(5,5,200,287);

// Header Background

doc.setFillColor(25,60,120);
doc.rect(5,5,200,20,"F");

// White Title

doc.setTextColor(255,255,255);
doc.setFontSize(16);
doc.setFont("helvetica","bold");
doc.text("SILICOSIS COMPENSATION CLAIM REPORT",105,18,{align:"center"});

doc.setFont("helvetica","normal");

// Black Color Again

doc.setTextColor(0,0,0);
doc.setFontSize(11);

doc.text("Claim ID : " + workerData.claimId,10,35);

doc.text("Report Date : " + workerData.reportDate,80,35);

doc.text("Status : " + workerData.status,150,35);

// Header Separator
doc.setDrawColor(180);
doc.line(10,40,200,40);

// ========================================
// WORKER INFORMATION HEADER
// ========================================

// Blue Header
doc.setFillColor(30,60,120);
doc.rect(10,45,190,8,"F");

// White Heading
doc.setTextColor(255,255,255);
doc.setFontSize(12);
doc.text("WORKER INFORMATION",105,51,{align:"center"});

// Back to Black
doc.setTextColor(0,0,0);

// Outer Box
doc.rect(10,53,190,55);

doc.setDrawColor(220);

doc.line(10,64,200,64);
doc.line(10,75,200,75);
doc.line(10,86,200,86);
doc.line(10,97,200,97);

doc.setDrawColor(0);
// Vertical Line

doc.line(105,53,105,108);

// Horizontal Lines

doc.line(10,64,200,64);

doc.line(10,75,200,75);

doc.line(10,86,200,86);

doc.line(10,97,200,97);

// Left Side

doc.setFontSize(10);

doc.setFont("helvetica","bold");

doc.text("Worker Name",15,60);

doc.text("Worker ID",15,71);

doc.text("Age",15,82);

doc.text("Gender",15,93);

doc.text("Occupation",15,104);

// Right Side

doc.text("Mobile",110,60);

doc.text("Aadhaar",110,71);

doc.text("Employer",110,82);

doc.text("Years Worked",110,93);

doc.text("Address",110,104);

doc.setFont("helvetica","normal");

// Values

doc.text(String(workerData.workerName),45,60);

doc.text(String(workerData.workerId),45,71);

doc.text(String(workerData.age),45,82);

doc.text(String(workerData.gender),45,93);

doc.text(String(workerData.occupation),45,104);

doc.text(String(workerData.mobile),145,60);

doc.text(String(workerData.aadhaar),145,71);

doc.text(String(workerData.employer),145,82);

doc.text(String(workerData.yearsWorked),145,93);

doc.text(String(workerData.address),145,104);

// ===================================
// EXPOSURE ASSESSMENT HEADER
// ===================================

doc.setFillColor(25,60,120);
doc.rect(10,115,92,8,"F");

doc.setTextColor(255,255,255);
doc.setFontSize(11);
doc.text("EXPOSURE ASSESSMENT",14,121);

doc.setTextColor(0,0,0);

// Exposure Box

doc.rect(10,123,92,45);

doc.setFontSize(10);

doc.text("Years Worked",14,134);
doc.text(String(workerData.yearsWorked),60,134);

doc.text("Dust Level",14,144);
doc.text(String(workerData.dustLevel),60,144);

doc.text("Mask Usage",14,154);
doc.text(String(workerData.maskUsage),60,154);

doc.text("Exposure Score",14,164);
doc.text(String(workerData.exposureScore),60,164);
// Left Logo
// ===================================
// AI DIAGNOSIS HEADER
// ===================================

doc.setFillColor(25,60,120);
doc.rect(108,115,92,8,"F");

doc.setTextColor(255,255,255);
doc.text("AI DIAGNOSIS",112,121);

doc.setTextColor(0,0,0);

// AI Box

doc.rect(108,123,92,45);

doc.setFontSize(10);

doc.text("Disease",112,134);
doc.text(String(workerData.diagnosis),150,134);

doc.text("Confidence",112,144);
doc.text(String(workerData.confidence),150,144);

doc.text("X-ray Date",112,154);
doc.text(String(workerData.xrayDate),150,154);

doc.text("AI Status",112,164);
doc.text("Completed",150,164);

// ===================================
// DOCTOR VERIFICATION HEADER
// ===================================

doc.setFillColor(25,60,120);
doc.rect(10,175,190,8,"F");

doc.setTextColor(255,255,255);
doc.setFontSize(11);
doc.text("DOCTOR VERIFICATION",15,181);

doc.setTextColor(0,0,0);

// Doctor Verification Box

doc.rect(10,183,190,50);

// Left Side Labels

doc.setFontSize(10);

doc.text("Doctor Name",15,194);

doc.text("Registration No",15,205);

doc.text("Hospital",15,216);

doc.text("Decision",15,227);

// Right Side Values

doc.text(String(workerData.doctorName),70,194);

doc.text(String(workerData.doctorRegistration),70,205);

doc.text(String(workerData.hospital),70,216);

doc.text(String(workerData.doctorDecision),70,227);

// Remarks

doc.setFontSize(10);

doc.text("Remarks :",15,239);

doc.text(String(workerData.remarks),40,239);

// ===================================
// COMPENSATION SUMMARY HEADER
// ===================================

doc.setFillColor(25,60,120);
doc.rect(10,245,190,8,"F");

doc.setTextColor(255,255,255);
doc.setFontSize(11);
doc.text("COMPENSATION SUMMARY",15,251);

doc.setTextColor(0,0,0);

// Compensation Box

doc.rect(10,253,190,25);

doc.setFontSize(10);

doc.text("Eligibility",15,262);

doc.text("Compensation",15,270);

doc.text("Claim Status",110,262);

doc.text("Recommendation",110,270);

doc.text("Eligible",50,262);

doc.text(String(workerData.compensation),50,270);

doc.text(String(workerData.status),150,262);

doc.text("Approved by Doctor",150,270);

// ===================================
// FOOTER
// ===================================

// Signature Box
doc.rect(10,280,60,12);
doc.setFontSize(8);
doc.text("Doctor Signature",20,287);

// QR Code Placeholder
doc.rect(80,280,30,12);
doc.text("QR",92,287);

// Generated By
doc.rect(120,280,80,12);
doc.text("Generated by SilicoHelp AI System",125,287);

doc.setDrawColor(180);
doc.line(10,276,200,276);

doc.setFontSize(8);
doc.text("Page 1 of 1",175,295);
doc.rect(10,8,18,14);

doc.setFontSize(8);

doc.text("LOGO",14,17);

// Right Logo

doc.rect(177,8,18,14);

doc.text("LOGO",181,17);
const pdfBase64 = doc.output("datauristring").split(",")[1];
return pdfBase64;


}



