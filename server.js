//Import library
const express = require("express");
const app = express();
// const path = require("path");
const expressHDB = require("express-handlebars");
const mg = require("mongoose");
const bodyParser = require("body-parser");
const HTTP_PORT = process.env.PORT || 3000;

//Settings
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.engine('.hbs', expressHDB.engine({
   extname: '.hbs'
}));
app.set('view engine', '.hbs');
mg.connect("mongodb+srv://dbUser:dbPassword@t440cluster.uwdgov5.mongodb.net/?retryWrites=true&w=majority");

//Server Const
const userschema = new mg.Schema({id:Number,username:String,password:String,email:String,name:String,cart:Array,Membership:Boolean});
const lessonschema = new mg.Schema({name:String,instructor:String,duration:Number,fee:Number,img:String});
 
const lessons = mg.model("lessons", lessonschema);
const users = mg.model("users", userschema);



//Default listener
function onServerStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
    console.log(`http://localhost:${HTTP_PORT}`);
}

//Paging routes
app.get("/", (req, res) => {
    res.render("index", {layout:"mainframe"})
});

app.get("/class", (req, res) => {
    lessons.find({}).lean().exec()
    .then(response =>{
        res.status(200).render("timetable",{layout:'mainframe', data:response});
        console.log(response);
    })
    .catch(err =>{
        res.status(500).render("timetable",{layout:'mainframe', err:err});
    })
    // res.render("timetable", {layout:"mainframe"})
});

app.get("/createclass", (req,res) =>{
    lessons.find({}).lean().exec()
    .then(response =>{
        res.status(200).render("lessonmanage",{layout:'mainframe', data:response});
        console.log(response);
    })
    .catch(err =>{
        res.status(500).render("lessonmanage",{layout:'mainframe', err:err});
    })
})

app.post("/createclass", (req,res) =>{
    const newlesson = new lessons({name:req.body.nameinput, instructor:req.body.instructor, duration:req.body.durationinput, fee:req.body.fee, img:req.body.img})
    newlesson.save()
    .then(response =>{
        res.status(200).render("lessonmanage",{layout:"mainframe"});
    })
    .catch(err =>{
        res.status(500).render("lessonmanage",{layout:"mainframe"});
    })
})

app.post("/deleteclass/:id", (req,res) =>{
    lessons.deleteOne({_id:req.params.id}).lean().exec()
    .then(response =>{
        res.status(200).redirect("/createclass");
    })
    .catch(err =>{
        res.status(500).redirect("/createclass");
    })
})

app.get("/login", (req, res) => {
    res.render("login", {layout:"mainframe"})
});

app.get("/signup", (req, res) => {
    res.render("signup", {layout:"mainframe"})
});
app.get("/cart", (req, res) => {
    res.render("cart", {layout:"mainframe"})
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
    res.render("index", {layout:"mainframe"});

});

app.post("/signup", (req, res) => {
    
});

app.listen(HTTP_PORT, onServerStart);
