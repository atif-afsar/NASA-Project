const { getAllLaunchesFromDb, addNewLaunchFromDb, saveLaunch } = require('../models/launches.model');
const launchesDatabase = require('../models/launches.mongo');

async function existsLaunchWithId(launchId) {
    return await launchesDatabase.findOne({ flightNumber: launchId });
}

async function getAllLaunches(req, res) {
    const launches = await getAllLaunchesFromDb();
    return res.status(200).json(launches);
}

async function addNewLaunch(req, res) {
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

  try {
    // ✅ Save to database / model
    const newLaunch = await addNewLaunchFromDb(launch);

    // 🚀 Send success response
    return res.status(201).json(newLaunch);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function abortLaunch(req, res) {
    const launchId = Number(req.params.id);

    const existingLaunch = await existsLaunchWithId(launchId);
    if (!existingLaunch) {
        return res.status(404).json({
            error: 'Launch not found',
        });
    }

    const aborted = await abortLaunchById(launchId);
    return res.status(200).json(aborted);
}

async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.findOneAndUpdate(
        { flightNumber: launchId },
        {
            upcoming: false,
            success: false
        },
        { new: true }
    );
    return aborted;
}

module.exports = {
    getAllLaunches,
    addNewLaunch,
    existsLaunchWithId,
    abortLaunch,
};