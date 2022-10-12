const membership = (value) =>{
    if (value = "no"){
        document.getElementById("memberpassinput").style.display="block";
    }
    else{
        document.getElementById("memberpassinput").style.display="block";

    }
} 
    
const durations = document.getElementById("duration")[0].value;
// document.getElementById("testing").innerText(`${durations}`);
const forms= document.getElementsByTagName("form")
let totalduration=0
for(i=0;i<forms.length;i++){
    totalduration+=Number(forms[i].getElementsByTagName("input").value);

}
let subtotal = totalduration*0.58
let tax= subtotal*0.13
let total= subtotal+tax

document.getElementById("calculation").innerHTML()=(`<p> Subtotal: ${subtotal} </p>
                                                <p>Tax: ${tax}</p>
                                                <p>Total: ${total}</p>`)
