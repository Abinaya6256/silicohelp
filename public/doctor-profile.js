// Replace this later with Firebase

let doctor = {

name:"Dr. John Smith",

email:"doctor@gmail.com",

bio:"",

specialization:"",

hospital:"",

experience:"",

registration:"",

image:"../assets/images/default-doctor.png"

};

// Sample cases

const cases=[

{
id:"CASE-001",
worker:"Ravi Kumar",
result:"Silicosis",
status:"Approved"
},

{
id:"CASE-002",
worker:"Suresh",
result:"Tuberculosis",
status:"Rejected"
},

{
id:"CASE-003",
worker:"Rahul",
result:"Normal",
status:"Approved"
},

{
id:"CASE-004",
worker:"Kumar",
result:"Silicosis",
status:"Pending"
}

];

// ----------------------------

document.getElementById("doctorName").innerText=doctor.name;

document.getElementById("doctorEmail").innerText=doctor.email;

document.getElementById("doctorBio").value=doctor.bio;

document.getElementById("specialization").value=doctor.specialization;

document.getElementById("hospital").value=doctor.hospital;

document.getElementById("experience").value=doctor.experience;

document.getElementById("registration").value=doctor.registration;

document.getElementById("profileImage").src=doctor.image;

// ----------------------------

const approved=cases.filter(x=>x.status==="Approved");

const rejected=cases.filter(x=>x.status==="Rejected");

document.getElementById("totalCases").innerText=cases.length;

document.getElementById("approvedCases").innerText=approved.length;

document.getElementById("rejectedCases").innerText=rejected.length;

// ----------------------------

showCases(cases,"All Cases");

document.getElementById("totalBtn").onclick=()=>{

showCases(cases,"All Cases");

}

document.getElementById("approvedBtn").onclick=()=>{

showCases(approved,"Approved Cases");

}

document.getElementById("rejectedBtn").onclick=()=>{

showCases(rejected,"Rejected Cases");

}

// ----------------------------

function showCases(list,title){

document.getElementById("listTitle").innerText=title;

const table=document.getElementById("caseTable");

table.innerHTML="";

list.forEach(c=>{

table.innerHTML+=`

<tr>

<td>${c.id}</td>

<td>${c.worker}</td>

<td>${c.result}</td>

<td>${c.status}</td>

</tr>

`;

});

}

// ----------------------------

document.getElementById("imageInput").addEventListener("change",function(){

const file=this.files[0];

if(!file) return;

const reader=new FileReader();

reader.onload=function(e){

document.getElementById("profileImage").src=e.target.result;

};

reader.readAsDataURL(file);

});

// ----------------------------

document.getElementById("saveProfile").onclick=function(){

doctor.bio=document.getElementById("doctorBio").value;

doctor.specialization=document.getElementById("specialization").value;

doctor.hospital=document.getElementById("hospital").value;

doctor.experience=document.getElementById("experience").value;

doctor.registration=document.getElementById("registration").value;

alert("Profile Saved");

};