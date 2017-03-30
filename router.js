'use strict';
const express = require('express');
const router = express.Router();


router.get('/observations', (req, res) => {
    console.log('router /surveillances');
    model.Surveillance.find().limit(10).sort({
        date: -1
    }).exec().then((surveillances) => {
        console.log(surveillances);
        res.json(surveillances);
    }).catch((err) => {
        console.log(err);
    });
});
const uploadImage = upload.single('image');
apiRouter.post('/addSurveillance', (req, res) => {
    console.log('router /addSurveillance');
    uploadImage(req, res, (err) => {
        if (err) {
            // An error occurred when uploading
            return console.log('An error occurred when uploading');
        }
        // Everything went fine
        const surveillance = req.body.surveillance;
        const image = req.file;
        const createThumbnail = new Promise((resolve, reject) => {
            const destination = `/uploads/320x300-${image.filename}`;
            sharp(image.path)
                .resize(320, 300)
                .background('white')
                .embed()
                .jpeg({
                    'quality': 60,
                })
                .toFile('public' + destination)
                .then(() => {
                    resolve(destination);
                }).catch((err) => {
                    reject(err);
                });
        });
        const createImage = new Promise((resolve, reject) => {
            const destination = `/uploads/768x720-${image.filename}`;
            console.log(image);
            sharp(image.path)
                .resize(768, 720)
                .background('white')
                .embed()
                .jpeg({
                    'quality': 60,
                })
                .toFile('public' + destination)
                .then(() => {
                    resolve(destination);
                }).catch((err) => {
                    reject(err);
                });
        });
        Promise.all([createThumbnail, createImage]).then((destinations) => {
            const thumbnailUrl = destinations[0];
            const imageUrl = destinations[1];
            const originalImageUrl = image.destination + image.filename;
            const newSurveillance = {
                id: 12,
                time: new Date(),
                category: surveillance.category,
                title: surveillance.title,
                details: surveillance.description,
                coordinates: JSON.parse(surveillance.location),
                thumbnail: thumbnailUrl,
                image: imageUrl,
                original: originalImageUrl,
            };
            console.log(newSurveillance);
            model.Surveillance.create(newSurveillance).then((surveillance) => {
                console.log(surveillance);
            });
        });
    });
});