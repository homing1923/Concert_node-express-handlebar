//Import library
const express = require("express");
const app = express();
const expressHDB = require("express-handlebars");
const mg = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const { response } = require("express");
const e = require("express");
const HTTP_PORT = process.env.PORT || 3001;

//Settings
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

//hbs
app.engine('.hbs', expressHDB.engine({
   extname: '.hbs'
}));
app.set('view engine', '.hbs');

//DB
mg.connect("mongodb+srv://dbUser:dbPassword@t440cluster.uwdgov5.mongodb.net/?retryWrites=true&w=majority");

//session
app.use(session({
    secret: "abc1233",
    resave: false,
    saveUninitialized: true,
}))

//MongoDB schema
const userschema = new mg.Schema({username:String,password:String,email:String,name:String,cart:Array,membership:Boolean,isadmin:Boolean});
const lessonschema = new mg.Schema({name:String,instructor:String,duration:Number,img:String});
const usercartschema = new mg.Schema({username:String,cart:Array});
const orderschema = new mg.Schema({username:String, amount:String, Tid:String, datetime:String});
 
const lessons = mg.model("lessons", lessonschema);
const users = mg.model("users", userschema);
const usercarts = mg.model("usercarts", usercartschema);
const orders = mg.model("orders", orderschema);

//const monthly and yearly cost
const yearcost = 900;
const monthcost = 75;

//Default listener
function onServerStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
    console.log(`http://localhost:${HTTP_PORT}`);
}

//Paging routes

//Main Page
app.get("/", (req, res) => {
    res.render("index", {layout:"mainframe",user:req.session})
});

//Timetable Page
app.get("/class", (req, res) => {
    lessons.find({}).lean().exec()
    .then(response =>{
        res.status(200).render("timetable",{layout:'mainframe', data:response, user:req.session});
    })
    .catch(err =>{
        res.status(500).render("timetable",{layout:'mainframe', err:err, user:req.session});
    })
});

//lesson Management
app.get("/manageclass", (req,res) =>{
    if(req.session.isadmin){
        lessons.find({}).lean().exec()
        .then(response =>{
            return res.status(200).render("lessonmanage",{layout:'mainframe', data:response, user:req.session});
        })
        .catch(err =>{
            return res.status(500).render("lessonmanage",{layout:'mainframe', err:err, user:req.session});
        })
    }else if(req.session.login){
        return res.render("redirect",{layout:"mainframe", action:{"forbidden":"You have no permission to view this page"}, user:req.session});
    }else{
        return res.render("redirect",{layout:"mainframe", action:{"unauthorized":"You have to login to view this page"}, user:req.session});
    }

})

//Gen lesson
app.post("/manageclass", (req,res) =>{
    if(req.session.isadmin){
        const newlesson = new lessons({name:req.body.nameinput, instructor:req.body.instructor, duration:req.body.duration, fee:req.body.fee, img:req.body.img})
        newlesson.save()
        .then(response =>{
            res.status(200).render("redirect",{layout:"mainframe", action:{"success":"Lesson Successfully created"}, user:req.session});
        })
        .catch(err =>{
            return res.status(500).render("redirect",{layout:"mainframe", user:req.session});
        })
    }
    if(req.session.login){
        res.status(403).render("redirect",{layout:"mainframe", action:{"fobidden":"You have no permission to view this page"}, user:req.session});
    }else{
        return res.status(401).render("redirect",{layout:"mainframe", action:{"unauthorized":"You have to login to view this page"}, user:req.session});
    }
})

//delete lesson
app.post("/deleteclass/:id", (req,res) =>{
    if(req.session.isadmin){
        lessons.deleteOne({_id:req.params.id}).lean().exec()
        .then(response =>{
            res.status(200).redirect("/manageclass");
        })
        .catch(err =>{
            res.status(500).redirect("/manageclass");
        })
    }
})


//Sign up page
app.get("/signup", (req, res) => {
    res.render("signup", {layout:"mainframe",user:req.session});
});

//post sign up data
app.post("/signup", (req, res) => {
    const usernameinput = req.body.signupname;
    const signuppassword = req.body.signuppassword;
    const signuppasswordconfirm = req.body.signuppasswordconfirm;
    const emailinput = req.body.email;
    let errarray = [];
    let haserr = false;
    //server side check
    if (usernameinput === undefined || usernameinput.trim() === ""){
        errarray.push({"err":"Username cannot be empty"});
        haserr = true;
    }
    if(signuppassword === undefined || signuppassword.trim() === ""){
        errarray.push({"err":"Password cannot be empty"});
        haserr = true;
    }
    if(emailinput === undefined || emailinput.trim() === ""){
        errarray.push({"err":"Email cannot be empty"});
        haserr = true;
    }
    if(signuppasswordconfirm === undefined || signuppasswordconfirm.trim() === ""){
        errarray.push({"err":"Confirm Password cannot be empty"});
        haserr = true;
    }
    if(haserr){
        console.log(errarray);
        return res.render("signup", {layout:"mainframe", err:errarray});
    }

    //no err then find one check dulp
    users.findOne({username:usernameinput}).lean().exec()
    .then(response =>{
        if(response === null){
            return true;
        }else{
            errarray.push({"err":"Username already being used"});
            return res.render("signup", {layout:"mainframe", err:errarray});
        }
    })
    .catch(err =>{
        console.log(err);
    })

    if(errarray.length > 0){
        return res.render("signup", {layout:"mainframe", err:errarray});
    }

    //no dulp then make new user obj on db
    const newuser = new users({username:usernameinput,password:signuppassword,email:emailinput,name:"",membership:false,isadmin:false})
    newuser.save()
    .then(response =>{
        req.session.userid = response._id;
        req.session.user = response.username;
        req.session.isadmin = response.isadmin;
        req.session.cart = response.cart;
        req.session.login = true;
    })
    .then(()=>{
        //make new cart obj on db
        const newusercart = new usercarts({username:usernameinput, cart:[]});
        newusercart.save()
        .then(response =>{
            req.session.cart = response.cart;
            return res.redirect("/cart");
        })
        .catch(err =>{
            errarray.push({"err":"Server Error"});
            return res.status(500).render("signup", {layout:"mainframe", err:errarray});
        })
    })
    .catch(err =>{
        errarray.push({"err":"Server Error"});
        return res.status(500).render("signup", {layout:"mainframe", err:errarray});
    })


});

//Check username avaliable api
app.post("/api/v0/usercheck/:username", (req,res)=>{
    if (req.params.username !== undefined || req.params.username.trim() !== ""){
        const usernameinput = req.params.username;
        users.findOne({username:usernameinput}).lean().exec()
        .then(response =>{
            if(response === null){
                return res.json({"result":true});
            }
            return res.json({"result":false});
        })
        .catch(err =>{
            Promise.reject(err);
        })
    }
})

//Add lesson to Cart 
app.post("/addcart/:id", (req,res) =>{
    if(req.session.login){
        let newitem = {lessonid:req.params.id, lessonimg: req.body.img, lessonname: req.body.name, lessoninstructor: req.body.instructor, lessonduration: req.body.duration};
        req.session.cart.push(newitem);
        usercarts.updateOne({username:req.session.user},{cart:req.session.cart}).lean().exec()
        .then(response =>{
            return res.status(200).redirect("/cart");
        })
        .catch(err=>{
            return res.status(500).redirect("/");
        })
    }else{
        return res.render("redirect",{layout:"mainframe", action:{"unauthorized":"You have to login to view this page"}, user:req.session});
    }
})

//get cart item from session when client to cart page
app.get("/cart", (req, res) => {
    if(req.session.login){
        res.render("cart", {layout:"mainframe",user:req.session, monthcost:monthcost, yearcost:yearcost});
    }else{
        return res.render("redirect",{layout:"mainframe", action:{"unauthorized":"You have to login to view this page"}, user:req.session});
    }
    
})

//Delete cart items from server
app.post("/deletecartitem/:lessonid", (req,res) =>{
    if(req.session.login){
        //loop to find obj
        for (let i = 0; i < req.session.cart.length; i++){
            for(eachitem in req.session.cart[i]){
                if(req.session.cart[i][eachitem] === req.params.lessonid){
                    req.session.cart.splice(i,1);
                    break;
                }
            }
        }

        //
        usercarts.updateOne({username:req.session.username},{username:req.session.username,cart:req.session.cart}).lean().exec()
        .then(response =>{
            console.log(response);
            return res.status(200).redirect("/cart");
        })
        .catch(err =>{
            console.log(err);
            return res.status(500).redirect("/cart");
        })
    }else{
        return res.status(401).render("redirect",{layout:"mainframe", action:{"unauthorized":"You have to login to view this page"}, user:req.session});
    }
})

//admin view all orders
app.get("/vieworder",(req,res)=>{
    if(req.session.isadmin){
        orders.find({}).lean().exec()
        .then(response=>{
            return res.render("allorder",{layout:"mainframe",order:response, user:req.session})
        })
        .catch(err=>{
            return res.status(500).redirect("/vieworder");
        })
    }else if(req.session.login){
        res.status(403).render("redirect",{layout:"mainframe", action:{"fobidden":"You have no permission to view this page"}, user:req.session});
    }else{
        return res.status(401).render("redirect",{layout:"mainframe", action:{"unauthorized":"You have to login to view this page"}, user:req.session});
    }


})

//Login page
app.get("/login", (req, res) => {
    res.render("login", {layout:"mainframe",user:req.session});
});

//dueling with login info
app.post("/login", (req, res) => {

    //get data from browser
    let usernameinput = req.body.loginname;
    let passwordinput = req.body.loginpassword;

    //empty check
    if (usernameinput === undefined || usernameinput.trim() === ""){
        return  res.render("login",{layout:"mainframe",user:req.session, err:"Username cannot be empty"})
    }else if(passwordinput === undefined || usernameinput.trim() === ""){
        return  res.render("login",{layout:"mainframe",user:req.session, err:"Password cannot be empty"})
    }else{

        //db find one
        users.findOne({username:usernameinput}).lean().exec()
        .then(response =>{
            //if user found, verify password, password ok, store data to session
            if(response !== null){
                if(passwordinput === response.password){
                    req.session.userid = response._id;
                    req.session.user = response.username;
                    req.session.isadmin = response.isadmin;
                    req.session.login = true;
                    return response;
                }else{
                   return res.render("login",{layout:"mainframe",user:req.session, err:"Incorrect login infomation provided"});
                }
            }else{
                return res.render("login",{layout:"mainframe",user:req.session, err:"Incorrect login infomation provided"});
            }
            
        })
        .catch(err =>{
            return res.render("login",{layout:"mainframe",user:req.session, err:"Incorrect login infomation provided"});
        })
        .then(userobj =>{
            //also need to retrievig the usercart obj
            usercarts.findOne({username:userobj.username}).lean().exec()
            .then(cartres =>{

                //then put in session
                req.session.cart = cartres.cart;
                if(req.session.isadmin){
                    return res.redirect("/manageclass");
                }else{
                    return res.redirect("cart");
                }
            }).catch(err =>{
                return res.render("login",{layout:"mainframe", err:err ,user:req.session});
            })
        })
        .catch(err =>{
            return res.render("login",{layout:"mainframe", err:err ,user:req.session});
        })
    }
});

//payment confirm page
app.get("/paymentconfirmation",(req,res)=>{
    if(req.session.login){
        res.render("paymentconfirmation",{layout:"mainframe",order:req.session.orders, user:req.session});
    }else{
        return res.status(401).render("redirect",{layout:"mainframe", action:{"unauthorized":"You have to login to view this page"}, user:req.session});
    }
})

//pay botton click to submit order
app.post("/payment",(req,res) =>{
    if(req.session.login){
        //form data retrieve
        const usernameinput = req.body.name;
        const emailinput = req.body.email;
        const cardnumberinput = req.body.creditcardnumber;
        const creditcardexpiryinput = req.body.creditcardexpiry;
        let errtext = [];
        //err check
        if(isempty(usernameinput)){
            errtext.push(`Name cannot be empty`);
        }
        if(isempty(emailinput)){
            errtext.push(`Email cannot be empty`);
        }
        if(isempty(cardnumberinput)){
            errtext.push(`Cardnumber cannot be empty`);
        }
        if(isempty(creditcardexpiryinput)){
            errtext.push(`Expiry Date cannot be empty`);
        }
        if(isNaN(cardnumberinput)){
            errtext.push(`Cardnumber should be a number`);
        }
        if(isNaN(creditcardexpiryinput)){
            errtext.push(`Expiry Date should be a number`);
        }
        if(errtext.length > 0){
            return res.render("cart", {layout:"mainframe", user:req.session, err:errtext});
        }

        //clear cart, gen new order and save to db
        req.session.orders={};
        const TransID = Math.round(Math.random()*10000000000);
        const timestamp = new Date();
        const neworder = new orders({username:req.session.user, amount:req.body.total, Tid:TransID, datetime:timestamp.toString().slice(0,34)})
        neworder.save()
        .then(response =>{
            req.session.orders= response;
            return response;
        })
        .then(orderobj =>{
            usercarts.findOneAndUpdate({username:orderobj.username},{username:req.session.user, cart:[]})
            .then(cartclearres =>{
                req.session.cart = [];
                res.status(200).redirect("/paymentconfirmation");
            })
            .catch(err =>{
                res.status(500).redirect("/cart");
            })
        })
    }else{
        return res.status(401).render("redirect",{layout:"mainframe", action:{"unauthorized":"You have to login to view this page"}, user:req.session});
    }
})

//check empty helper
const isempty = (input) =>{
    if(input === "" || input.trim() === ""){
        return true;
    }else{
        return false;
    }
}

//log out destroy session
app.get("/logout", (req, res) =>{
    if(req.session.login){
        req.session.destroy();
        res.redirect("/");
    }else{
        return res.status(401).render("redirect",{layout:"mainframe", action:{"unauthorized":"You have to login to view this page"}, user:req.session});
    }
})

//un auth handling
app.get("/deny", (req, res) =>{
    res.status(403).render("deny", {layout:"mainframe", user:req.session});
})

app.use("/", (req,res) =>{
    res.status(404).render("404",{layout:"mainframe", user:req.session});
})

app.listen(HTTP_PORT, onServerStart);
