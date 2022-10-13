console.log("login js loaded");
if(document.getElementById("signupbtn") !== undefined || document.getElementById("signupbtn") !== null){
    const signupbtn = document.getElementById("signupbtn");

    signupbtn.addEventListener("click", () =>{
        location.href = "./signup";
    });
}
