document.querySelector(".worker-btn").addEventListener("click",()=>{

localStorage.setItem("registration","worker");

window.location.href="login.html";

});

document.querySelector(".organization-btn").addEventListener("click",()=>{

localStorage.setItem("registration","organization");

window.location.href="login.html";

});