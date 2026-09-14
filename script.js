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

async function login() {

  const dobInput =
    document.getElementById("dob").value.trim();

  const dobParts =
    dobInput.split("/");

  if (
    dobParts.length !== 3 ||
    dobParts[0].length !== 2 ||
    dobParts[1].length !== 2 ||
    dobParts[2].length !== 4 ||
    isNaN(dobParts[0]) ||
    isNaN(dobParts[1]) ||
    isNaN(dobParts[2])
  ) {

    setMessage(
      "login-message",
      "Please enter Date of Birth in DD/MM/YYYY format."
    );

    return;
  }


  const dob =
    dobParts[2] +
    "-" +
    dobParts[1] +
    "-" +
    dobParts[0];


  const whatsapp =
    cleanPhone(
      document.getElementById(
        "whatsapp"
      ).value
    );


  if (
    !dob ||
    whatsapp.length !== 10
  ) {

    setMessage(
      "login-message",
      "Please enter a valid date of birth and 10-digit WhatsApp number."
    );

    return;
  }


  if (
    APPS_SCRIPT_URL.startsWith("PASTE_")
  ) {

    setMessage(
      "login-message",
      "The Google Apps Script URL has not been added yet."
    );

    return;
  }


  setMessage(
    "login-message",
    "Checking..."
  );


  try {

    const url =
      APPS_SCRIPT_URL +
      "?action=login" +
      "&dob=" +
      encodeURIComponent(dob) +
      "&whatsapp=" +
      encodeURIComponent(whatsapp);


    const response =
      await fetch(url);


    const data =
      await response.json();


    if (data.success) {

      localStorage.setItem(
        "studentDOB",
        dob
      );

      localStorage.setItem(
        "studentWhatsapp",
        whatsapp
      );

      localStorage.setItem(
        "studentName",
        data.name || "Student"
      );


      setMessage(
        "login-message",
        "Login successful.",
        true
      );


      window.location.href =
        "welcome.html";

      return;
    }


    /*
     * Student has not registered.
     */

    if (
      data.error ===
      "not_registered"
    ) {
              const registerBox =
          document.getElementById(
            "register-highlight"
          );
        
        if (registerBox) {
          registerBox.style.display =
            "block";
        }
      setMessage(
        "login-message",
        "⚠ You are not registered yet. Please register first."
      );


      const message =
        document.getElementById(
          "login-message"
        );


      message.style.background =
        "#fff3cd";

      message.style.border =
        "2px solid #ffca2c";

      message.style.padding =
        "12px";

      message.style.borderRadius =
        "10px";

      message.style.fontWeight =
        "600";


      return;
    }


    /*
     * WhatsApp is registered but
     * DOB is incorrect.
     */

    if (
      data.error ===
      "wrong_dob"
    ) {

      setMessage(
        "login-message",
        "The Date of Birth does not match your registered details."
      );


      return;
    }


    /*
     * Other error.
     */

    setMessage(
      "login-message",
      data.message ||
      "Unable to login. Please try again."
    );


  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    setMessage(
      "login-message",
      "Unable to connect to the registration database."
    );

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

    form.reset();

    localStorage.setItem(
    "registrationSuccess",
    "true"
    );

  window.location.href =
    "index.html";

}
    }else{
      setMessage("registration-message",result.message || "Registration failed.");
    }
  }catch(e){
    setMessage("registration-message","Unable to submit. Please check the Apps Script setup.");
  }
}
// ================================
// DOB: Manual DD/MM/YYYY + Calendar
// ================================

function openDOBPicker() {
  const picker = document.getElementById("dobPicker");

  if (!picker) return;

  // Try to open the native mobile calendar
  if (typeof picker.showPicker === "function") {
    picker.showPicker();
  } else {
    picker.click();
  }
}

document.addEventListener("DOMContentLoaded", function () {

  const dobInput = document.getElementById("dob");
  const dobPicker = document.getElementById("dobPicker");

  if (!dobInput || !dobPicker) return;

  // When a date is selected from the calendar
  dobPicker.addEventListener("change", function () {

    if (!this.value) return;

    // Browser gives YYYY-MM-DD
    const parts = this.value.split("-");

    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    // Display DD/MM/YYYY
    dobInput.value = `${day}/${month}/${year}`;
  });

  // Automatically add "/" while manually typing
  dobInput.addEventListener("input", function () {

    let value = this.value.replace(/\D/g, "").slice(0, 8);

    if (value.length > 4) {
      value =
        value.substring(0, 2) +
        "/" +
        value.substring(2, 4) +
        "/" +
        value.substring(4);
    } else if (value.length > 2) {
      value =
        value.substring(0, 2) +
        "/" +
        value.substring(2);
    }

    this.value = value;
  });

});
