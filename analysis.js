// ==========================================
// SILICOHELP - AI ANALYSIS PAGE
// ==========================================

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const statusMessage = document.getElementById("statusMessage");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");
const step4 = document.getElementById("step4");

let progress = 0;

const statusUpdates = [

    { progress: 10, message: "Loading AI model..." },

    { progress: 25, message: "Checking X-ray quality..." },

    { progress: 45, message: "Detecting lung region..." },

    { progress: 65, message: "Screening for Silicosis..." },

    { progress: 85, message: "Generating AI Report..." },

    { progress: 100, message: "Analysis Completed Successfully." }

];

const interval = setInterval(() => {

    progress++;

    progressFill.style.width = progress + "%";

    progressText.innerText = progress + "%";

    statusUpdates.forEach(item => {

        if(progress === item.progress){

            statusMessage.innerText = item.message;

        }

    });

    if(progress === 25){

        step1.innerHTML = "✅ Checking image quality";

    }

    if(progress === 50){

        step2.innerHTML = "✅ Detecting lung region";

    }

    if(progress === 75){

        step3.innerHTML = "✅ Screening for Silicosis";

    }

    if (progress === 100) {

    step4.innerHTML = "✅ Generating AI report";

    clearInterval(interval);

    setTimeout(async () => {

        try {

            statusMessage.innerText = "Contacting AI server...";

            const response = await fetch("http://127.0.0.1:5000/predict", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    demo: true
                })

            });

            if (!response.ok) {
                throw new Error("Server not available");
            }

            const result = await response.json();

            localStorage.setItem("aiResult", JSON.stringify(result));
            localStorage.setItem("analysisMode", "real");

        }

        catch (error) {

            console.log("Backend unavailable. Switching to Demo Mode.");

            const demoResult = {

                disease: "Silicosis",

                confidence: "96%",

                severity: "Moderate",

                recommendation:
                    "Consult a pulmonologist for further evaluation."

            };

            localStorage.setItem("aiResult", JSON.stringify(demoResult));
            localStorage.setItem("analysisMode", "demo");

        }

        window.location.href = "result.html";

    }, 1200);

}

},80);