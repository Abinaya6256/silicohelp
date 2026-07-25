const form = document.getElementById("loginForm");

const toggle = document.getElementById("togglePassword");

const password = document.getElementById("password");

toggle.addEventListener("click",()=>{

    if(password.type==="password"){

        password.type="text";
        toggle.textContent="🙈";

    }else{

        password.type="password";
        toggle.textContent="👁";
    }

});

form.addEventListener("submit",(e)=>{

    e.preventDefault();

    const email=document.getElementById("email").value.trim();

    const pass=password.value.trim();

    if(email==="" || pass===""){

        alert("Please fill in all fields.");

        return;
    }

    // Replace with Firebase Authentication later

    window.location.href="govdashboard.html";

});