'user strict';

const express = require('express');
const app = express();
const router = require('./router');
const multer = require('multer');
const sharp = require('sharp');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const users = require('./model/users');
const dbImport = require('./model/db');
const imageUtils = require('./model/images');
const fs = require('fs');
const https = require('https');
const http = require('http');

const upload = multer({
    dest: 'public/images/',
});

const sslkey = fs.readFileSync('ssl-key.pem');
const sslcert = fs.readFileSync('ssl-cert.pem')

const options = {
    key: sslkey,
    cert: sslcert,
};

app.use(express.static('public'));

const mongoose = require('mongoose');
mongoose.connect(dbImport.url);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
    function(username, password, cb) {
        console.log(username);
        console.log(password);
        users.findByUsername(username, function(err, user) {
            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false);
            }
            if (user.password != password) {
                return cb(null, false);
            }
            return cb(null, user);
        });
    }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    users.findById(id, function(err, user) {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    });
});

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({
    extended: true
}));
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

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

db.once('open', function() {
    console.log('Connected to MongoDB');

    https.createServer(options, app).listen(3000);
    console.log(`HTTPS Listening on port 3000 `);

    http.createServer((req, res) => {
        res.writeHead(301, {
            'Location': 'https://localhost:3000' + req.url
        });
        res.end();
    }).listen(8000);
    console.log(`HTTP Listening on port 8000 `);
});


app.get('/login',
    function(req, res) {
        //res.render('login', { user: req.user });
        res.sendFile(__dirname + '/public/login.html');
    });

app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        console.log(req);
        res.cookie('username', req.user.username);
        res.redirect('/');
    });

app.get('/logout',
    function(req, res) {
        res.cookie('username', '');
        req.logout();
        res.redirect('/');
    });

app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res) {
        res.render('profile', {
            user: req.user
        });
    });


app.get('/',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res) {
        res.sendFile(__dirname + '/views/index.html');
    });
app.get('/videochat',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res) {
        res.sendFile(__dirname + '/views/videochat.html');
    });

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