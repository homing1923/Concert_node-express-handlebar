const membership = () =>{
    if (document.getElementById("no").checked===true){
        document.getElementById("memberpassinput").setAttribute("class","hidden");
    }else{
        document.getElementById("memberpassinput").setAttribute("class","unhidden");

    }


} 

    
const durations = document.getElementsByClassName("duration");
// document.getElementById("testing").innerText(`${durations}`);


const calculations = () =>{

let subtotal = 0;
let totalduration=0;
if (document.getElementById("no").checked){

for(i=0;i<durations.length;i++){
    totalduration += parseInt(durations[i].value);
    console.log(totalduration);

}
subtotal = Math.round(totalduration*0.58*100,2)/100;
}
   else{
    if (document.getElementsByTagName("select")[0].value==="yearly"){
        subtotal=995
    }
    else if(document.getElementsByTagName("select")[0].value==="monthly"){
        subtotal=65
    }
   }

let tax= Math.round(subtotal*0.13*100,2)/100;
let total= subtotal+tax
document.getElementById("calculation").innerHTML = (`<p> Subtotal: ${subtotal} </p>
                                                <p>Tax: ${tax}</p>
                                                <p>Total: ${total}</p>
                                                <input type="hidden" name="total" value="${total}">`)
}
document.getElementById("no").addEventListener("click",membership)
document.getElementById("yes").addEventListener("click",membership)
document.getElementById("no").addEventListener("click",calculations)
document.getElementById("yes").addEventListener("click",calculations)
document.getElementsByTagName("select")[0].addEventListener("change",calculations)

