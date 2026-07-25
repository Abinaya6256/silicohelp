import { getWorkerByPhone } from "./data.js";
import { setCurrentWorkerId } from "./session.js";
const mobile = localStorage.getItem("mobile");

document.getElementById("mobileNumber").innerText =
"+91 " + mobile;

const inputs =
document.querySelectorAll(".otp-input");

inputs.forEach((input,index)=>{

input.addEventListener("input",()=>{

input.value=input.value.replace(/\D/g,"");

if(input.value && index<5){

inputs[index+1].focus();

}

});

input.addEventListener("keydown",(e)=>{

if(e.key==="Backspace" && !input.value && index>0){

inputs[index-1].focus();

}

});

});

let time=30;

const countdown=document.getElementById("countdown");

const timer=setInterval(()=>{

time--;

countdown.innerText=time;

if(time===0){

clearInterval(timer);

countdown.innerText="0";

}

},1000);

document.getElementById("verifyBtn").addEventListener("click", async () => {

    alert("OTP Verified Successfully!");
    console.log("Mobile from localStorage:", mobile);
    const worker = await getWorkerByPhone(mobile);
    console.log("Worker found:", worker);
    if (worker) {

        // Existing worker
        setCurrentWorkerId(worker.id);

        window.location.href = "worker-dashboard.html";

    } else {

        // First-time worker
        window.location.href = "basic-details.html";

    }

});
document.getElementById("changeMobile").addEventListener("click",()=>{

window.location.href="login.html";

});