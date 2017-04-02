'user strict';

const express = require('express');
const app = express();
const router = require('./router');
const multer = require('multer');
const sharp = require('sharp');
const upload = multer({
    dest: 'public/images/',
});


app.use(express.static('public'));


const mongoose = require('mongoose');
mongoose.connect('mongodb://accountAdmin01:changeMe@127.0.0.1:27017/observations');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
});


const observation = mongoose.Schema({
    time: Date,
    category: String,
    title: String,
    details: String,
    coordinates: {
        lat: Number,
        lng: Number,
    },
    thumbnail: String,
    image: String,
    original: String,
});


const Observation = mongoose.model('Observation', observation);


app.post('/api/create', upload.single('image'), function(req, res, next) {
    // req.file is the `avatar` file 
    // req.body will hold the text fields, if there were any 

    const imageFile = `images/image/${req.file.filename}`;

    sharp(req.file.path)
        .resize(768, 720)
        .toFile('public/' + imageFile)
        .then(() => {
            //console.log('saved image in 768x720 resolution');
        }).catch((err) => {
            console.log(err);
        });

    const thumbnailFile = `images/thumbnail/${req.file.filename}`;
    sharp(req.file.path)
        .resize(320, 300)
        .toFile('public/' + thumbnailFile)
        .then(() => {
            //console.log('saved image in 320x300 resolution');
        }).catch((err) => {
            console.log(err);
        });

    const originalFile = 'images/' + req.file;

    const observationObject = new Observation({
        time: new Date(),
        category: req.body.category,
        title: req.body.title,
        details: req.body.description,
        coordinates: {
            'lat': req.body.locationX,
            'lng': req.body.locationY,
        },
        thumbnail: thumbnailFile,
        image: imageFile,
        original: originalFile,
    });
    observationObject.save(function(err, observationObject) {
        if (err) return console.error(err);
    });
    res.redirect('../index.html');

});

app.get('/api/events', function(req, res) {
    Observation.find(function(err, observationCollection) {
        if (err) return console.error(err);
        res.send(observationCollection);
    });
});

app.listen(3000);