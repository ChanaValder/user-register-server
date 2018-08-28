const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();
const basePath = path.join(__dirname + "/dist");
const bodyParser = require("body-parser");
var cors=require("cors");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get(`/`, (req, res) => {
    let linkList = "";
    let resPage = fs.readFileSync("links.html", "utf-8");
    console.log(resPage);
    fs.readdir(basePath, (err, files) => {
        files.forEach((file) => {
            linkList += `<li><a href="/${file}" target="blank">${file}</a></li>`;
        })
        res.send(resPage.replace("placeHolder", linkList));
    });

});

fs.readdir(basePath, (err, files) => {
    files.forEach((file) => {
        app.use(express.static(`${basePath}/${file}`));
        app.get(`/${file}`, (req, res) => {
            res.sendFile(`${basePath}/${file}/index.html`);
        });
    })
});


app.post("/api/user", (req, res) => {
    console.log(req);
    let currentList = require('./user.json');
    let tz = req.body["tz"];
    let isValid = true;
    //check tz
    // try {
        let total = 0;
        for (let i = 0; i < 9; i++) {
            let x = (((i % 2) + 1) * tz.charAt(i));
            total += Math.floor(x / 10) + x % 10;
        }
        if (total % 10 != 0)
            isValid = false;
        //check age

        if (req.body["age"] > 120 || req.body["age"] < 0)
            isValid = false;

        //check name

        if (req.body["firstName"].length < 3 || req.body["firstName"].length > 15)
            isValid = false;
        //check isMale

        if (typeof JSON.parse(req.body["isMale"]) != "boolean")
            isValid = false;
        let countriesList = require('./countries.json');
        if (!countriesList.includes(req.body["country"]))
            isValid = false;
        if (isValid == true) 
        {
            currentList.push(req.body)
            fs.writeFileSync("user.json", JSON.stringify(currentList));
            res.status(201).send(JSON.stringify(currentList));
        }
        else  res.status(400).send();


   
})

const port = process.env.PORT || 3500;
app.listen(port, () => { console.log(`OK`); });