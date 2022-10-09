const previewlessonbtn = document.getElementById("previewlessonbtn");
const imgselection = document.getElementsByTagName("select")[0];
const previewimg = document.getElementById("previewimg");
const adminvalue = document.getElementById("admincheck");

renderpreview = () =>{
    console.log("render");
    const nameinput = document.getElementsByName("nameinput")[0].value;
    const instructor = document.getElementsByName("instructor")[0].value;
    const duration = document.getElementsByName("duration")[0].value;
    previewimg.setAttribute("src",imgselection.value);
    document.getElementById("previewtitle").innerText = nameinput;
    document.getElementById("previewinstructor").innerText = instructor;
    document.getElementById("previewduration").innerText = duration;
}

renderpreviewpic = () =>{
    previewimg.setAttribute("src",imgselection.value);
}

imgselection.addEventListener("change", renderpreviewpic);
previewlessonbtn.addEventListener("click", renderpreview);


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