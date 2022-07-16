'use strict'
const express = require('express');
const countries = require('./routes/countries');

const app = express();

app.use('/api/countries', countries);
app.listen(3000)

module.exports = app;