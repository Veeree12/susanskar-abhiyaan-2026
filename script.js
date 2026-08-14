/*
  IMPORTANT:
  Replace APPS_SCRIPT_URL with your deployed Google Apps Script Web App URL.
*/
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxHJ2TX812WBNjBZ2iH_vHweRTlRdynSl1gpnGwbBwANza1ZasOWszPVYV6IcX8-Ng-4g/exec";

function cleanPhone(value){
  return String(value || "").replace(/\D/g,"").slice(-10);
}

function setMessage(id,text,ok=false){
  const el=document.getElementById(id);
  if(!el)return;
  el.textContent=text;
  el.style.color=ok ? "#16733a" : "#a00000";
}

async function login(){
  const dob=document.getElementById("dob").value;
  const whatsapp=cleanPhone(document.getElementById("whatsapp").value);

  if(!dob || whatsapp.length!==10){
    setMessage("login-message","Please enter a valid date of birth and 10-digit WhatsApp number.");
    return;
  }
  if(APPS_SCRIPT_URL.startsWith("PASTE_")){
    setMessage("login-message","The website is ready, but the Google Apps Script URL has not been added yet.");
    return;
  }

  setMessage("login-message","Checking...");
  try{
    const url=APPS_SCRIPT_URL+"?action=login&dob="+encodeURIComponent(dob)+"&whatsapp="+encodeURIComponent(whatsapp);
    const response=await fetch(url);
    const data=await response.json();

    if(data.success){
      setMessage("login-message","Login successful.",true);
      // Change this destination later to your actual student dashboard/next page.
      window.location.href="welcome.html";
    }else{
      setMessage("login-message",data.message || "Details not found. Please register first.");
    }
  }catch(e){
    setMessage("login-message","Unable to connect to the registration database.");
  }
}

async function submitRegistration(event){
  event.preventDefault();
  const form=event.target;
  const data=new FormData(form);
  const phone=cleanPhone(data.get("whatsapp"));

  if(phone.length!==10){
    setMessage("registration-message","Please enter a valid 10-digit WhatsApp number.");
    return;
  }

  const dob=`${data.get("dobYear")}-${data.get("dobMonth")}-${data.get("dobDay")}`;
  const payload=new URLSearchParams({
    action:"register",
    firstName:data.get("firstName"),
    middleName:data.get("middleName"),
    lastName:data.get("lastName"),
    gender:data.get("gender"),
    dob:dob,
    whatsapp:phone,
    address:data.get("address")
  });

  if(APPS_SCRIPT_URL.startsWith("PASTE_")){
    setMessage("registration-message","The website is ready, but the Google Apps Script URL has not been added yet.");
    return;
  }

  setMessage("registration-message","Submitting...");
  try{
    const response=await fetch(APPS_SCRIPT_URL,{
      method:"POST",
      body:payload
    });
    const result=await response.json();

    if(result.success){
      setMessage("registration-message","Registration successful!",true);
      form.reset();
    }else{
      setMessage("registration-message",result.message || "Registration failed.");
    }
  }catch(e){
    setMessage("registration-message","Unable to submit. Please check the Apps Script setup.");
  }
}
