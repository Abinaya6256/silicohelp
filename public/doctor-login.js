// Doctor Login Page

document.querySelector(".login-btn").addEventListener("click",(e)=>{

    const email=document.querySelector('input[type="email"]').value.trim();

    const password=document.querySelector('input[type="password"]').value.trim();

    if(email==="" || password===""){

        e.preventDefault();

        alert("Please enter your email and password.");

        return;

    }

});