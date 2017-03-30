'user strict';

const express = require('express');
const observation = require('./model/observation');
const router = require('./router');
const multer = require('multer');
const sharp = require('sharp');
const app = express();
const Promise = require('es6-promise').Promise;
const upload = multer({
    dest: 'public/images/'
});


app.use(express.static('public'));


const mongoose = require('mongoose');
mongoose.connect('mongodb://accountAdmin01:changeMe@mongodb11286-hi-florian.jelastic.metropolia.fi:27017/eventplanner');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
});


app.post('/api/create', upload.single('image'), function (req, res, next) {
    // req.file is the `avatar` file 
    // req.body will hold the text fields, if there were any 
    console.log(req.body);

    const processImage = new Promise((resolve, reject) => {
        const file = `public/images/image/${req.file}`;
        sharp(req.file.path)
            .resize(320, 300)
            .toFiledestination(file)
            .then(() => {
                resolve(file);
            }).catch((err) => {
                reject(err);
            });
    });

    const processThumbnail = new Promise((resolve, reject) => {
        const file = `public/images/thumbnail/${req.file}`;
        sharp(req.file.path)
            .resize(320, 300)
            .toFile(file)
            .then(() => {
                resolve(file);
            }).catch((err) => {
                reject(err);
            });
    });


    Promise.all([processImage, processThumbnail]).then((files) => {
        const imageFile = files[0];
        const thumbnailFile = files[1];
        const originalFile = `public/images/image/${req.file}`;
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
        observationObject.save(function (err, observationObject) {
            if (err) return console.error(err);
        });
        Observation.find(function (err, observationCollection) {
            if (err) return console.error(err);
            console.log(observationCollection);
        });
    });
});


app.listen(3000);