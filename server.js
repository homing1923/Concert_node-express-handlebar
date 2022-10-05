const express = require("express");
const app = express();
const path = require("path");
const HTTP_PORT = process.env.PORT || 3000;
app.use(express.static('public'));
app.use(express.json());
// call this function after the http server starts listening for requests
function onServerStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
    console.log(`http://localhost:${HTTP_PORT}`);
}




// app.get("/js/app.js", (req, res) => {
//     res.sendFile(path.join(__dirname, "/js/app.js"));
// });

// app.get("/css/app.css", (req, res) => {
//     res.sendFile(path.join(__dirname, "/css/app.css"));
// });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.get("/demoapi/all", (req,res) =>{
    res.json({
        "Country":"abc",
        "Countryb":"cde",
    })
})

app.post("/demoapi/place", (req,res)=>{
    res.json({
        message:`The place ${req.body.name} and capital ${req.body.capital} has been successfully created`
    })
})

app.put("/demoapi/place/:id", (req,res)=>{
    res.json({
        message:`The place ${req.body.name} and capital ${req.body.capital} with id ${req.params.id} has been successfully created`
    })
})

app.delete("/demoapi/place/:id", (req,res)=>{
    res.json({
        message:`id ${req.params.id} has been successfully deleted`
    })
})

app.listen(HTTP_PORT, onServerStart);
