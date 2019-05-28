/*
*  Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
*  See LICENSE in the source repository root for complete license information.
*/
require('dotenv').config()

var express = require('express');
var app = express();
var morgan = require('morgan');
var path = require('path');
var request = require('request');

var authenticate = require('./auth.ts');

// Initialize variables.
var port = 30662; // process.env.PORT || 30662;

// Configure morgan module to log all requests.
app.use(morgan('dev'));

// Set the front-end folder to serve public assets.
app.use(express.static('dist'))

// Set up our one route to the index.html file.
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});

app.get('/proxyKeys', function(req, res) {
    request(req.query.keyUrl).pipe(res);
});

app.post('/checkRequest', function(req, res) {
    authenticate(req).then((status) => res.send(status));
});

// Start the server.
app.listen(port);
console.log('Listening on port ' + port + '...');
