const currentStep = Number(document.body.dataset.step);

const steps = document.querySelectorAll(".step");
const lines = document.querySelectorAll(".line");
const stepText = document.getElementById("stepText");

if (stepText) {
    stepText.textContent = `Step ${currentStep} of 5`;
}

steps.forEach((step, index) => {

    const stepNumber = index + 1;

    const circle = step.querySelector(".circle");

    if (stepNumber < currentStep) {

        step.classList.add("completed");
        circle.innerHTML = "✓";

    }
    else if (stepNumber === currentStep) {

        step.classList.add("active");

    }

});

lines.forEach((line, index) => {

    if (index + 1 < currentStep) {

        line.classList.add("completed");

    }

});