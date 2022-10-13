const adminvalue = document.getElementById("admincheck");




const checkadmin = () =>{
    try {
        if(adminvalue.value === "true"){

        }else{
            window.location.href = "./deny";
        }
    } catch (error) {
        window.location.href = "./deny";
    }
    
}

window.addEventListener("load", checkadmin);