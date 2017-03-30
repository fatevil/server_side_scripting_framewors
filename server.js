const express = require('express');
const app = express();
const db = require('db');


app.use(express.static('public'));



app.listen(3000);
