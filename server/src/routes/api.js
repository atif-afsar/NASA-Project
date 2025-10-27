const express = require("express");
const launchesRouter = require("./launches.route");
const planetsRouter = require("./planets.route");

const api = express.Router();

api.use("/planets", planetsRouter);
api.use("/launches", launchesRouter);

module.exports = api;
