const membership = (value) =>{
    if (value = "no"){
        document.getElementById("memberpassinput").style.display="block";
    }
    else{
        document.getElementById("memberpassinput").style.display="block";

    }
} 
    
const durations = document.getElementsByClassName("duration");
// document.getElementById("testing").innerText(`${durations}`);
let totalduration=0;
for(i=0;i<durations.length;i++){
    totalduration += parseInt(durations[i].value);
    console.log(totalduration);
}
let subtotal = Math.round(totalduration*0.58*100,2)/100;
let tax= Math.round(subtotal*0.13*100,2)/100;
let total= subtotal+tax

document.getElementById("calculation").innerHTML = (`<p> Subtotal: ${subtotal} </p>
                                                <p>Tax: ${tax}</p>
                                                <p>Total: ${total}</p>`)
