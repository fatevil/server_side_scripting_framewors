'use strict';

const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
app.use(express.static('public'));


const sslkey = fs.readFileSync('ssl-key.pem');
const sslcert = fs.readFileSync('ssl-cert.pem')

const options = {
    key: sslkey,
    cert: sslcert,
};

const server = https.createServer(options, app).listen(8888);
console.log(`HTTPS Signaling server listening on port 8888 `);


// add this with other requires:
const config = require('getconfig');
const sockets = require('signal-master/sockets');

// add this to the end of file
sockets(server, config);