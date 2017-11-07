var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var api = require('./routes/api');

var app = express();
mongoose.connect('mongodb://localhost/document_manager');

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    next();
});

// view engine setup

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

app.use('/api', api);
app.use('/get_file/:filename', function (req, res) {
    let filename = req.params.filename;
    let file = __dirname + '/files/' + filename;
    res.download(file); // Set disposition and send it.
});

app.use('/view_file/:filename', function (req, res) {
    let filename = req.params.filename;
    let file = __dirname + '/files/' + filename;
    res.sendFile(file);
});

module.exports = app;