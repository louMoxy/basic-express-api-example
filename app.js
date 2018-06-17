const express = require('express');
const app = express();
const jsonParser = require('body-parser').json;
const routes = require('./routes');
const logger = require('morgan');

app.use(logger('dev'));
app.use(jsonParser());


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/qa');

const db = mongoose.connection;

db.on('error', err => {
    console.error(`connection error: ${err}`);
})

db.once('open', () => {
    console.log('db connection success!');
});

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if(req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Methods', 'PUT,POST,DELETE')
        return res.status(200).json({});
    }
    next();
})

app.use('/questions',routes);

// catch 404's
app.use((req, res, next) => {
    const err = new Error('Not found');
    err.status = 404;
    next(err);
})

app.use((req, res, next) => {
    next();
});

// Error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    })
})

const port = process.env.port || 3000;

app.listen(port, function() {
    console.log(`Express server is running on port ${port}`);
});