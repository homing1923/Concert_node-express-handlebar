//Import library
const express = require("express");
const app = express();
const expressHDB = require("express-handlebars");
const mg = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const HTTP_PORT = process.env.PORT || 3000;

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
const orderscheme = new mg.Schema({username:String, amount:Number, Tid:String, datetime:String});
 
const lessons = mg.model("lessons", lessonschema);
const users = mg.model("users", userschema);
const usercarts = mg.model("usercarts", usercartschema);
const orders = mg.model("orderscheme", orderscheme);


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
    // res.render("timetable", {layout:"mainframe"})
});

//Class Management

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

app.post("/deleteclass/:id", (req,res) =>{
    lessons.deleteOne({_id:req.params.id}).lean().exec()
    .then(response =>{
        res.status(200).redirect("/manageclass");
    })
    .catch(err =>{
        res.status(500).redirect("/manageclass");
    })
})


//Sign up

app.get("/signup", (req, res) => {
    res.render("signup", {layout:"mainframe",user:req.session});
});

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
    let useranotavaliable = true;
    users.findOne({username:usernameinput}).lean().exec()
    .then(response =>{
        if(response === null){
            return true;
        }else{
            errarray.push({"err":"Username already being used"});
            return res.render("signup", {layout:"mainframe", err:errarray});
        }
    })
    // .then(response =>{

    // })
    .catch(err =>{
        console.log(err);
    })

    if(errarray.length > 0){
        return res.render("signup", {layout:"mainframe", err:errarray});
    }

    const newuser = new users({username:usernameinput,password:signuppassword,email:emailinput,name:"",membership:false,isadmin:false})
    newuser.save()
    .then(response =>{
        req.session.userid = response._id;
        req.session.user = response.username;
        req.session.isadmin = response.isadmin;
        req.session.cart = response.cart;
        req.session.login = true;
        // return res.redirect("/cart");
    })
    .then(()=>{
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

//Check username api

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

//Cart related

app.post("/addcart/:id", (req,res) =>{
    console.log(req.body);
    console.log(req.session);
    let newitem = {lessonid:req.params.id, lessonimg: req.body.img, lessonname: req.body.name, lessoninstructor: req.body.instructor, lessonduration: req.body.duration};
    req.session.cart.push(newitem);
    usercarts.updateOne({username:req.session.user},{cart:req.session.cart}).lean().exec()
    .then(response =>{
        console.log(response);
        res.status(200).redirect("/cart");
    })
    .catch(err=>{
        console.log(err);
        res.status(500).redirect("/");
    })
})

app.get("/cart", (req, res) => {
    res.render("cart", {layout:"mainframe",user:req.session})
})
app.post("/deletecartitem/:id", (req,res) =>{
    usercarts.deleteOne({id:req.params.id}).lean().exec()
    .then(response =>{
        res.status(200).redirect("/cart");
    })
    .catch(err =>{
        res.status(500).redirect("/cart");
    })
})
// app.get("/servermigrate", (req,res) =>{
//     let newcart = [];
//     users.find({}).lean().exec()
//     .then(response =>{
//         console.log(response);
//         for (eachuser in response){
//             newcart.push({"username":response[eachuser].username,"cart":response[eachuser].cart});
//         }
//         console.log(newcart);
//         return newcart;
//     })
//     .then(cart =>{
//         for(eachcartitem in cart){
//             const newcart = new usercarts({username:cart[eachcartitem]["username"],cart:cart[eachcartitem]["cart"]});
//             newcart.save({})
//             .then(response =>{
//                 console.log(response);
//             })
//             .catch(err =>{
//                 console.log(err);
//             })
//         }
//     })
//     .catch(err =>{
//         console.log(err);
//     })
// })

//Login

app.get("/login", (req, res) => {
    res.render("login", {layout:"mainframe",user:req.session});
});

app.post("/login", (req, res) => {
    //1 verify empty
    //2 verify space only .trim() === ""
    let usernameinput = req.body.loginname;
    let passwordinput = req.body.loginpassword;
    if (usernameinput === undefined || usernameinput.trim() === ""){
        return res.send(`<script>alert("Username cannot be empty"; )</script>`);
    }else if(passwordinput === undefined || usernameinput.trim() === ""){
        return res.send(`<script>alert("Password cannot be empty")</script>`);
    }
    users.findOne({username:usernameinput}).lean().exec()
    .then(response =>{
        if(response !== null){
            if(passwordinput === response.password){
                req.session.userid = response._id;
                req.session.user = response.username;
                req.session.isadmin = response.isadmin;
                req.session.login = true;
            }
        }else{
            const err = {err:"Incorrect login infomation provided"}
            res.render("login",{layout:"mainframe",user:req.session, err:err});
        }
    })
    .then(
        usercarts.findOne({username:usernameinput}).lean().exec()
        .then(response =>{
            req.session.cart = response.cart;
            if(req.session.isadmin){
                return res.redirect("/manageclass");
            }else{
                return res.render("cart",{layout:"mainframe",user:req.session});
            }
        }).catch(err =>{
            res.render("login",{layout:"mainframe", err:err ,user:req.session});
        })
    )
    .catch(err =>{
        res.render("login",{layout:"mainframe", err:err ,user:req.session});
    })

    // res.render("index", {layout:"mainframe"});

});


app.get("/logout", (req, res) =>{
    req.session.destroy();
    res.redirect("/");
})

app.get("/deny", (req, res) =>{
    res.status(403).render("deny", {layout:"mainframe",user:req.session});
})

app.use("/", (req,res) =>{
    res.status(404).render("404",{layout:"mainframe", user:req.session})
})

app.listen(HTTP_PORT, onServerStart)
