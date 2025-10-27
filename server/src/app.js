const express = require('express');
const cors = require('cors');
const planetsRouter = require('./routes/planets.route');
const launchesRouter = require('./routes/launches.route');

const path = require('path');
const morgan = require('morgan');

const api = require('./routes/api');

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
}))

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/v1', api);


app.use(morgan('combined'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});






module.exports = app;