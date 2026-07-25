const allowButton = document.querySelector(".allow-btn");

const skipButton = document.querySelector(".skip-btn");

allowButton.addEventListener("click",()=>{

    localStorage.setItem("voice","enabled");

    window.location.href="login.html";

});

skipButton.addEventListener("click",()=>{

    localStorage.setItem("voice","disabled");

    window.location.href="login.html";

});