//const
const durations = document.getElementsByClassName("duration");
const monthly = document.getElementById("monthcost").value;
const yearly = document.getElementById("yearcost").value;

//yes no checker
const membership = () =>{
    if (document.getElementById("no").checked === true){
        document.getElementById("memberpassinput").setAttribute("class","hidden");
    }else{
        document.getElementById("memberpassinput").setAttribute("class","unhidden");

    }
} 

//
const calculations = () =>{
    if(durations.length > 0){
        let subtotal = 0;
        let totalduration = 0;
        let tax = 0;
        let total = 0;
        if (document.getElementById("no").checked){
            for(i=0;i<durations.length;i++){
                totalduration += parseInt(durations[i].value);
            }
            subtotal = totalduration*0.58;
        }
        else{
            if (document.getElementsByTagName("select")[0].value==="yearly"){
                subtotal = parseInt(yearly);
            }
            else if(document.getElementsByTagName("select")[0].value==="monthly"){
                subtotal= parseInt(monthly);
            }
        }
    
        tax = subtotal*0.13;
        total = subtotal + tax;

        document.getElementById("calculation").innerHTML = 
        (
            `<p class="calc-left"> Subtotal: </p><p class="calc-right">$${subtotal.toFixed(2)} </p>
            <p class="calc-left">Tax: </p><p class="calc-right">$${tax.toFixed(2)}</p>
            <p class="calc-left">Total: </p><p class="calc-right">$${total.toFixed(2)}</p>
            <input type="hidden" name="total" value="$${total.toFixed(2)}">
            `
        );       
    }

}

//event listeners
if(document.getElementById("no") !== null && document.getElementById("yes") !== null)
{
    document.getElementById("no").addEventListener("click",membership);
    document.getElementById("yes").addEventListener("click",membership);
    document.getElementById("no").addEventListener("click",calculations);
    document.getElementById("yes").addEventListener("click",calculations);
    document.getElementsByTagName("select")[0].addEventListener("change",calculations);
}

window.addEventListener("load", calculations);

