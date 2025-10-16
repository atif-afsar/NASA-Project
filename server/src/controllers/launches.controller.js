const {launches, getAllLaunchesFromDb, addNewLaunchFromDb} = require('../models/launches.model');

function getAllLaunches(req, res) {

   return res.status(200).json(getAllLaunchesFromDb());
}

function addNewLaunch(req, res) {
    const launch = req.body;

    launch.launchDate = new Date(launch.launchDate);

    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: 'Invalid launch date',
        });
    }

    addNewLaunchFromDb(launch);
     res.status(201).json(launch);

    if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.destination) {
        return res.status(400).json({
            error: 'Missing required launch property',
        });
    }
}

module.exports = {
    getAllLaunches,
    addNewLaunch,
};