'use strict';
const mongoose = require('mongoose');

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

module.exports = {
    observation,
    Observation,
};

/*
const silence = new Observation({
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

fluffy.save(function (err, fluffy) {
    if (err) return console.error(err);
    fluffy.speak();
});

Kitten.find(function (err, kittensy) {
    if (err) return console.error(err);
    console.log(kittensy);
});
*/