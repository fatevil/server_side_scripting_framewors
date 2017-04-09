'user strict';

const express = require('express');
const app = express();
const router = require('./router');
const multer = require('multer');
const sharp = require('sharp');
const dbImport = require('./model/db');
const imageUtils = require('./model/images');
const upload = multer({
    dest: 'public/images/',
});

app.use(express.static('public'));

const mongoose = require('mongoose');
mongoose.connect(dbImport.url);

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


/**
 * @api {post} /api/create Create new observation.
 * @apiName CreateObservation
 * @apiGroup Observation
 * @apiDescription Create new observation with parameters in req body. 
 *  Transforms image to thumbnail image and 768x720 image, saves then in image directory.
 *  Should contain:
 *      - category
 *      - title
 *      - locationX, locationY
 *      - file: image
 * 
 */
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

/**
 * @api {get} /api/read Get collection of observations in DB.
 * @apiName ReadObservation
 * @apiGroup Observation
 * @apiDescription Get collections of all observations from database.
 *
 * @apiError ObservationsNotFound 404 No observations found.
 */
app.get('/api/read', function(req, res) {
    // console.log('GET read all');
    Observation.find((err, observationCollection) => {
        if (err) return console.error(err);
        if (observationCollection.length == 0) {
            res.statusCode = 404;
            res.statusMessage = 'Observation with given ID not found.';
        } else {
            res.statusMessage = 'Ok';
        }
        res.send(observationCollection);
    });
});

/**
 * @api {get} /api/read/:id Get Observation by unique ID.
 * @apiName ReadObservationById
 * @apiGroup Observation
 * @apiDescription Get observation with ID from parameter.
 *
 * @apiParam {id} unique ID of observation
 *
 * @apiError ObservationsNotFound 404 Observation with given ID not found.
 */
app.get('/api/read/:id', function(req, res) {
    const id = req.params.id;
    Observation.findById(id, (err, observation) => {
        if (err) return console.error(err);
        if (observationCollection.length == 0) {
            res.statusCode = 404;
            res.statusMessage = 'Observation with given ID not found.';
        } else {
            res.statusMessage = 'Ok';
        }
        res.send(observationCollection);
    });
});


/**
 * @api {get} /api/read/:property/:value Observations with filter on one atribute.
 * @apiName ReadObservationWithFilter
 * @apiGroup Observation
 * @apiDescription Get observations where specified attribute contains specified string.
 *
 * @apiParam {property} name of attribute to be filtered
 * @apiParam {value} value that attribute {property} is supposed to contain
 *
 * @apiError ObservationsNotFound  No observations with applied filter were found.
 */
app.get('/api/read/:property/:value', (req, res) => {
    const property = req.params.property;
    const value = req.params.value;
    //console.log(`GET read ${property} ${value}`);
    Observation.where(property.toLowerCase(), {
        $regex: '.*' + value + '.*'
    }).exec((err, observationCollection) => {
        if (err) return console.error(err);
        if (observationCollection.length == 0) {
            res.statusCode = 404;
            res.statusMessage = 'No observations with applied filter were found.';
        } else {
            res.statusMessage = 'Ok';
        }
        res.send(observationCollection);
    });
});

/**
 * @api {get} /api/read/:category/:title/:details Observations with filter on category, title and details.
 * @apiName ReadObservationExtendedFilter
 * @apiGroup Observation
 * @apiDescription Get observations with applied filter according to following. 
 * Each parameter specifies value which attributes category, title and details  have to contain.
 * For not aplying filter, put '-' instead. 
 * 
 * @apiExample {curl} Example usage - will find all observation:
 *  -  whose category contains "Another" and details contain "Helsinki"
 *  - there's no filter for title
 *     curl -i http://localhost:3000/api/read/Another/-/Helsinki/
 *
 *
 * @apiError ObservationsNotFound  No observations with applied filter were found.
 */
app.get('/api/read/:category/:title/:details', (req, res) => {
    const category = (req.params.category != '-') ? req.params.category : '';
    const title = (req.params.title != '-') ? req.params.title : '';
    const details = (req.params.details != '-') ? req.params.details : '';

    Observation.
    where('category', {
        $regex: '.*' + category + '.*'
    }).where('title', {
        $regex: '.*' + title + '.*'
    }).where('details', {
        $regex: '.*' + details + '.*'
    }).exec((err, observationCollection) => {
        if (err) return console.error(err);
        if (observationCollection.length == 0) {
            res.statusCode = 404;
            res.statusMessage = 'Observation with given ID not found.';
        } else {
            res.statusMessage = 'Ok';
        }
        res.send(observationCollection);
    });
});

/**
 * @api {delete} /api/delete/:observation Delete single observation with unique ID.
 * @apiName DeleteObservation
 * @apiGroup Observation
 * @apiDescription Delete observation with ID from parameter.
 *
 */
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

/**
 * @api {patch} /api/update Update observation with unique ID.
 * @apiName CreateObservation
 * @apiGroup Observation
 * @apiDescription Update observation with unique ID from specified in PATCH req body. 
 *  Optionally ransforms image to thumbnail image and 768x720 image, saves then in image directory.
 *  Should contain:
 *      - category
 *      - title
 *      - locationX, locationY
 *      - file: image (optional)
 * 
 */
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

/**
 * @api {get} /api/read Get collection of observations categories.
 * @apiName ReadObservation
 * @apiGroup Observation
 * @apiDescription Get only "category" fields from observations. 
 *
 * @apiError CategoriesNotFound 404 No categories found.
 */
app.get('/api/categories/read', (req, res) => {
    // console.log("getting categories ");
    Observation.find().select('category').exec()
        .then((categories) => {
            if (categories.length == 0) {
                res.statusCode = 404;
                res.statusMessage = 'Observation with given ID not found.';
            } else {
                res.statusMessage = 'Ok';
            }
            res.send(categories);
        }).catch((err) => {
            res.json(err);
        });
});

app.listen(3000);