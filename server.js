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

//Server Const
const userschema = new mg.Schema({username:String,password:String,email:String,name:String,cart:Array,membership:Boolean,isadmin:Boolean});
const lessonschema = new mg.Schema({name:String,instructor:String,duration:Number,img:String});
 
const lessons = mg.model("lessons", lessonschema);
const users = mg.model("users", userschema);



//Default listener
function onServerStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
    console.log(`http://localhost:${HTTP_PORT}`);
}

//Paging routes
app.get("/", (req, res) => {
    res.render("index", {layout:"mainframe",user:req.session})
});

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

app.get("/manageclass", (req,res) =>{
    lessons.find({}).lean().exec()
    .then(response =>{
        res.status(200).render("lessonmanage",{layout:'mainframe', data:response, user:req.session});
    })
    .catch(err =>{
        res.status(500).render("lessonmanage",{layout:'mainframe', err:err, user:req.session});
    })
})

app.post("/manageclass", (req,res) =>{
    const newlesson = new lessons({name:req.body.nameinput, instructor:req.body.instructor, duration:req.body.duration, fee:req.body.fee, img:req.body.img})
    newlesson.save()
    .then(response =>{
        res.status(200).render("redirect",{layout:"mainframe"});
    })
    .catch(err =>{
        res.status(500).render("redirect",{layout:"mainframe"});
    })
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

app.get("/login", (req, res) => {
    res.render("login", {layout:"mainframe",user:req.session})
});

app.get("/signup", (req, res) => {
    res.render("signup", {layout:"mainframe",user:req.session})
});

app.post("/addcart/:id", (req,res) =>{
    let newcart = req.params.id;
    req.session.cart.push(newcart)
    users.updateOne({username:req.session.user},{cart:req.session.cart}).lean().exec()
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
                req.session.cart = response.cart;
                req.session.login = true;
                console.log(req.session);
            }
            if(req.session.isadmin){
                res.redirect("/manageclass");
            }else{
                res.render("cart",{layout:"mainframe",user:req.session});
            }
        }else{
            res.render("login",{layout:"mainframe",user:req.session});
        }
    })
    .catch(err =>{
        res.render("login",{layout:"mainframe", err:err});
    })
    // res.render("index", {layout:"mainframe"});

});

app.post("/signup", (req, res) => {
    
});

app.get("/logout", (req, res) =>{
    req.session.destroy();
    res.redirect("/");
})

app.get("/deny", (req, res) =>{
    res.render("deny", {layout:"mainframe",user:req.session});
})

app.listen(HTTP_PORT, onServerStart);
