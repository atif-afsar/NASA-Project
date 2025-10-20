const {launches, getAllLaunchesFromDb, addNewLaunchFromDb} = require('../models/launches.model');

function existsLaunchWithId(launchId) {
    return launches.has(launchId);
}

function getAllLaunches(req, res) {

   return res.status(200).json(getAllLaunchesFromDb());
}

function addNewLaunch(req, res) {
  const launch = req.body;

  // 🧩 Validate required fields first
  if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
    return res.status(400).json({
      error: 'Missing required launch property',
    });
  }

  // 🗓️ Parse and validate date
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: 'Invalid launch date',
    });
  }

  // ✅ Save to database / model
  addNewLaunchFromDb(launch);

  // 🚀 Send success response
  return res.status(201).json(launch);
}

function abortLaunch(req, res) {
    const launchId = Number(req.params.id);

    if (!existsLaunchWithId(launchId)) {
        return res.status(404).json({
            error: 'Launch not found',
        });
    }

    const aborted = abortLaunchById(launchId);
   return res.status(200).json(aborted);
}

function abortLaunchById(launchId) {
    const aborted = launches.get(launchId);
    aborted.upcoming = false;
    aborted.success = false;
    return aborted;
}

module.exports = {
    getAllLaunches,
    addNewLaunch,
    existsLaunchWithId,
    abortLaunch,
};