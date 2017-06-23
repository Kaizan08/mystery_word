const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sessionConfig = require('./sessionConfig');
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

app.engine("mustache", mustacheExpress());
app.set("views","./public");
app.set("view engine", "mustache");


//Middleware
app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session(sessionConfig));

//global variables
var lettersGuessed =[];
var guessesLeft = 8;
var mode;

function game(type){
    if (type == 'Easy'){
        var word = words.filter(function(str){return (str.length >= 4 & str.length <= 6);});
        var randomWord = word[Math.floor(Math.random() * word.length)];
    } else if (type == 'Normal'){
        var word = words.filter(function(str){return (str.length >= 6 & str.length <= 8);});
        var randomWord = word[Math.floor(Math.random() * word.length)];
    } else {
        var word = words.filter(function(str){return (str.length >8);});
        var randomWord = word[Math.floor(Math.random() * word.length)];
    }
    return randomWord;
}

app.get("/", function(req, res){
    if (!req.session.word){
        res.render("index");
    } else{
        res.render("index", {guess: guessesLeft, guessedLetters: lettersGuessed, gamemode:mode});
    }
})

app.post("/", function(req, res){
    if (req.body.mode){ //call mode function to get word and set it
        console.log(req.body.mode)
        var randomWord = game(req.body.mode);
        req.session.word = randomWord;
        mode = req.body.mode;
        res.redirect("/");
    }
})

app.listen(port, function(){
    console.log('Server started on port', port);
})
