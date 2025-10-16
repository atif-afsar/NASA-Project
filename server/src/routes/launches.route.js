const express = require('express');
const { launches } = require('../models/launches.model');
const { getAllLaunches } = require('../controllers/launches.controller');
const { addNewLaunch } = require('../controllers/launches.controller');

const launchesRouter = express.Router();

launchesRouter.get('/', getAllLaunches);
launchesRouter.post('/', addNewLaunch);

module.exports = launchesRouter;