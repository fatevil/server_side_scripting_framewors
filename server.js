'user strict';

const express = require('express');
const app = express();
const router = require('./router');
const multer = require('multer');
const sharp = require('sharp');
const imageUtils = require('./model/images');
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
    delete req.body._id;

    const imageFile = imageUtils.saveImage768x720(req.file.filename, req.file.path);

    const thumbnailFile = imageUtils.saveThumbnail(req.file.filename, req.file.path);

    const originalFile = 'images/' + req.file.filename;

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

app.get('/api/read', function(req, res) {
    // console.log('GET read all');
    Observation.find((err, observationCollection) => {
        if (err) return console.error(err);
        res.send(observationCollection);
    });
});
app.get('/api/read/:property/:value', (req, res) => {
    const property = req.params.property;
    const value = req.params.value;
    // console.log(`GET read ${property} ${value}`);
    Observation.where(property.toLowerCase(), { $regex: '.*' + value + '.*' }).exec((err, observationCollection) => {
        if (err) return console.error(err);
        res.send(observationCollection);
    });
});


app.delete('/api/delete/:observationId', (req, res) => {
    Observation.findById(req.params.observationId).remove().exec()
        .then(() => {
            res.send({
                status: 'OK',
            });
        }).catch((err) => {
            res.json(err);
        });
});

app.patch('/api/update', upload.single('image'), (req, res, next) => {
    let observation = req.body;
    delete observation.updateCheckBox;

    if (req.file !== undefined) {
        observation.image = imageUtils.saveImage768x720(req.file.filename, req.file.path);
        observation.thumbnail = imageUtils.saveThumbnail(req.file.filename, req.file.path);
        observation.original = 'images/' + req.file.filename;
    }

    console.log(observation);
    Observation.update({
        _id: observation._id
    }, {
        $set: observation
    }, () => {
        res.send({
            status: 'OK'
        });
    });
});

app.get('/api/categories/read', (req, res) => {
    // console.log("getting categories ");
    Observation.find().select('category').exec()
        .then((categories) => {
            res.send(categories);
        }).catch((err) => {
            res.json(err);
        });
});


app.listen(3000);