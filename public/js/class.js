const lessonredirectbtn = document.getElementsByClassName("lessontoregisterbtn");
const usercartitems = document.getElementsByClassName("cartitems");

redirecttologin = () =>{
    window.location.href = "./login";
}

const checkregistered = () =>{
    if(usercartitems.length > 0){
        for(each in usercartitems){
            let currentrow = document.getElementById(`${usercartitems[each].value}`);
            let rowbtn;
            try {
                rowbtn = currentrow.getElementsByTagName("button")[0];
                rowbtn.setAttribute("class", "lessonregisteredbtn");
                rowbtn.setAttribute("type", "button");
                document.getElementById(usercartitems[each].value).innerHTML +=
                `
                <br>
                <p class="lessonregisteredbar">This item is already in your cart</p>
                `;

            } catch (error) {
                console.log(error);
            }   
        }
    }
}

if(lessonredirectbtn !== null || lessonredirectbtn !== undefined){
    for (let i = 0; i < lessonredirectbtn.length; i++ ){
        lessonredirectbtn[i].addEventListener("click", redirecttologin);
    }
}

window.addEventListener("load", checkregistered);



