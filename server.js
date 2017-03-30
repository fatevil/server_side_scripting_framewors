'user strict';

const express = require('express');
const app = express();
//const db = require('db');


app.use(express.static('public'));


const mongoose = require('mongoose');
mongoose.connect('mongodb://mongodb11286-hi-florian.jelastic.metropolia.fi/eventplanner');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
});

const kittySchema = mongoose.Schema({
    name: String
});



// NOTE: methods must be added to the schema
// before compiling it with mongoose.model()
kittySchema.methods.speak = function () {
    const greeting = this.name ?
        'Meow name is ' + this.name :
        'I don\'t have a name';
    console.log(greeting);
};

const Kitten = mongoose.model('Kitten', kittySchema);

const silence = new Kitten({
    name: 'Silence',
});

console.log(silence.name); // 'Silence'

const fluffy = new Kitten({
    name: 'fluffy',
});
fluffy.speak(); // "Meow name is fluffy"

fluffy.save(function (err, fluffy) {
    if (err) return console.error(err);
    fluffy.speak();
});

Kitten.find(function (err, kittens) {
    if (err) return console.error(err);
    console.log(kittens);
});

app.listen(3000);