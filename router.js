'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use(bodyParser.json());

app.post('/observations', function (req, res) {
    console.log(req.body.category);
    console.log(req.body.title);
});
