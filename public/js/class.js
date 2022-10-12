const lessonredirectbtn = document.getElementById("lessonredirectbtn");
const usercartitems = document.getElementsByClassName("cartitems");
redirecttologin = () =>{
    window.location.href = "./login";
}

const checkregistered = () =>{
    if(usercartitems.length > 0){
        for(each in usercartitems){
            let currentrow = document.getElementById(`${usercartitems[each].value}`);
            let rowbtn = currentrow.getElementsByTagName("button")[0];
            rowbtn.setAttribute("class", "lessonregisteredbtn");
            rowbtn.setAttribute("type", "button");
            document.getElementById(usercartitems[each].value).innerHTML +=
            `
            <br>
            <p class="lessonregisteredbar">This item is already in your cart</p>
            `;
        }
    }
}

try {
    lessonredirectbtn.addEventListener("click", redirecttologin);
} catch (error) {
    console.log(error);
}
window.addEventListener("load", checkregistered);



