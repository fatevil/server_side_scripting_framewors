'user strict';

const express = require('express');
const observation = require('./observation');
const app = express();
//const db = require('db');


app.use(express.static('public'));


const mongoose = require('mongoose');
mongoose.connect('mongodb://accountAdmin01:changeMe@mongodb11286-hi-florian.jelastic.metropolia.fi:27017/eventplanner');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
});


app.listen(3000);