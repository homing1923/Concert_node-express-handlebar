const originalh1 = document.getElementsByClassName("inputerrortext")[0].innerHTML;

const usernameiput = document.getElementById("signupname");
const signuppassword = document.getElementById("signuppassword");
const signuppasswordconfirm = document.getElementById("signuppasswordconfirm");
const emailinput = document.getElementById("email");
const sumbitbutton = document.getElementsByTagName("button")[0];

let newformcontent = "";
let userok = false;
let passok = false;
let emailok = false;

const checkemail = () =>{
    const input = emailinput.value;
    if(input !== "" && input.trim() !== "" && input !== undefined){
        if(/^\S+@\S+\.\S+$/.test(input)){
            newformcontent += `Email format is acceptable`;
            emailinput.setAttribute("class","greenbracket");
            emailok = true;
        }else{
            newformcontent += `Please fill in a correct format of email address (abc@123.com)`;
            emailinput.setAttribute("class","redbracket");
            sumbitbutton.setAttribute("disabled","");
            emailok = false;
        }
    }else{
        newformcontent += `<p class="errortext">Email cannot be empty</p>`;
        emailinput.setAttribute("class","redbracket");
        sumbitbutton.setAttribute("disabled","");
        document.getElementsByClassName("inputerrortext")[0].innerHTML = newformcontent;
        emailok = false;
    }

}


const checkapiusername = (nameinputvalue) => {fetch(`/api/v0/usercheck/${nameinputvalue}`, {method:"POST", headers:{'Content-Type':'application/json'}})
.then(response =>{
    if(response !== undefined){
        return response.json();
    }
})
.then(json =>{
    console.log(json);
    if(json.result){
        newformcontent += `<p class="errortext">Username is Ok to use</p>`;
        usernameiput.setAttribute("class","greenbracket");
        document.getElementsByClassName("inputerrortext")[0].innerHTML = newformcontent;
        return true;

    }else{
        newformcontent += `<p class="errortext">Username is already in used</p>`;
        usernameiput.setAttribute("class","redbracket");
        sumbitbutton.setAttribute("disabled","");
        document.getElementsByClassName("inputerrortext")[0].innerHTML = newformcontent;
        return false;
    }

})
.then(response =>{
    if(response && passok && emailok){
        sumbitbutton.removeAttribute("disabled","");
        document.getElementsByClassName("inputerrortext")[0].innerHTML = "";
    }
})
.catch(err =>{
    console.log(err);
})
}

const checkuser = () => {
const nameinputvalue = usernameiput.value;
if(nameinputvalue !== "" && nameinputvalue.trim() !== "" && nameinputvalue !== undefined){
    checkapiusername(nameinputvalue);
}else{
    newformcontent += `<p class="errortext">Username cannot be empty</p>`;
    usernameiput.setAttribute("class","redbracket");
    sumbitbutton.setAttribute("disabled","");
    document.getElementsByClassName("inputerrortext")[0].innerHTML = newformcontent;
    userok = false;
}

}

const checksame = () =>{
    const signuppasswordvalue = signuppassword.value;
    const signuppasswordconfirmvalue = signuppasswordconfirm.value;
    if(signuppasswordvalue !== "" && signuppasswordvalue.trim() !== "" && signuppasswordvalue !== undefined && signuppasswordconfirmvalue !== "" && signuppasswordconfirmvalue.trim() !== "" && signuppasswordconfirmvalue !== undefined){
        if(signuppasswordvalue !== signuppasswordconfirmvalue){
            signuppassword.setAttribute("class","redbracket");
            signuppasswordconfirm.setAttribute("class","redbracket");
            newformcontent += `<p class="errortext">Passwords are not the same</p>`;
            document.getElementsByClassName("inputerrortext")[0].innerHTML = newformcontent;
            sumbitbutton.setAttribute("disabled","");
            passok = false;

        }else{
            newformcontent += `<p class="errortext">Passwords are OK</p>`;
            signuppassword.setAttribute("class","greenbracket");
            signuppasswordconfirm.setAttribute("class","greenbracket");
            passok = true;
        }
        
    }else{
        newformcontent += `<p class="errortext">Password cannot be empty</p>`;
        signuppassword.setAttribute("class","redbracket");
        signuppasswordconfirm.setAttribute("class","redbracket");
        sumbitbutton.setAttribute("disabled","");
        document.getElementsByClassName("inputerrortext")[0].innerHTML = newformcontent;
        passok = false;
    }
}

const checkall = () =>{
    newformcontent = "";
    checkuser();
    checksame();
    checkemail();
    if(userok && passok && emailok){
        sumbitbutton.removeAttribute("disabled","");
        document.getElementsByClassName("inputerrortext")[0].innerHTML = "";
    }
}

// const checkforfetch = () =>{
//     if(userok && passok && emailok){
//         sumbitbutton.removeAttribute("disabled","");
//         document.getElementsByClassName("inputerrortext")[0].innerHTML = "";
//     }else{
//         checkall();
//     }
// }

const useroutevent = usernameiput.addEventListener("focusout", checkall);
const passwordoutevent = signuppassword.addEventListener("focusout", checkall);
const emailoutevent = emailinput.addEventListener("focusout", checkall)
const confirmpasswordoutevent = signuppasswordconfirm.addEventListener("focusout", checkall);
