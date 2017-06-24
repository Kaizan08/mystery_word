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
var randomWord;
var hangman;

function displaygame(letter, wordLen){
    var display = '';
    if(letter == -1){ //no guesses yet
        for(var i=0; i<wordLen;i++){
            display += '_ ';
        }
        return display;
    } 
    else {
        if (randomWord.indexOf(letter) >= 0){ //letter found in word
            var correctguess=0;
            var counter;
            for(var i=0;i<randomWord.length; i++){
                counter = 0;
                for(var j=0;j<lettersGuessed.length;j++){
                    if(lettersGuessed[j]==randomWord[i]){
                        display += lettersGuessed[j]+' ';
                        counter = 1;
                        correctguess =+ 1;
                    }
                }
                if (counter==0){
                    display += '_ ';
                }    
            }
            return display; 
        } else { //decrement guesses left
            guessesLeft -= 1;
        }
    return hangman;
}
};

function game(type){
    if (type == 'Easy'){
        var word = words.filter(function(str){return (str.length >= 4 & str.length <= 6);});
    } else if (type == 'Normal'){
        var word = words.filter(function(str){return (str.length >= 6 & str.length <= 8);});
    } else {
        var word = words.filter(function(str){return (str.length >8);});
    }
    randomWord = word[Math.floor(Math.random() * word.length)];
    return randomWord;
}

app.get("/", function(req, res){
    var letter;
    if (!req.session.word){
        res.render("index");
    } else{
        if (guessesLeft > 1){
            if(lettersGuessed.length == 0){
                letter = -1;
            } else{
                letter = lettersGuessed[lettersGuessed.length-1];
            }
        hangman = displaygame(letter, req.session.word.length);
        res.render("index", {guess: guessesLeft, guessedLetters: lettersGuessed, gamemode:mode, hangman:hangman.toString()});
        } else {
            letter = lettersGuessed[lettersGuessed.length-1];
            hangman = displaygame(letter, req.session.word.length);
            console.log(req.session.word);
            res.render("index", {guess: guessesLeft, guessedLetters: lettersGuessed, gamemode: mode, hangman:req.session.word});    
        }
    }   
})

app.post("/", function(req, res){
    if (req.body.mode){ //call mode function to get word and set it
        randomWord = game(req.body.mode).toUpperCase();
        console.log(randomWord);
        req.session.word = randomWord.toUpperCase();
        mode = req.body.mode;
        res.redirect("/");
    } else{
        console.log(req.body.choice.toUpperCase());
        //check for valid letter
        if (lettersGuessed.length > 0 & lettersGuessed.indexOf(req.body.choice.toUpperCase()) == -1){
            lettersGuessed.push(req.body.choice.toUpperCase());
            res.redirect("/");
        } else if(lettersGuessed.length == 0){
            lettersGuessed.push(req.body.choice.toUpperCase());
            res.redirect("/");
        } else {
            res.redirect("/");
            //print error message duplicating letters already in array
        }
    }
})

app.listen(port, function(){
    console.log('Server started on port', port);
})
