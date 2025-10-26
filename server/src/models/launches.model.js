const launchesDatabase = require('../models/launches.mongo');

// Keep track of latest flight number
let latestFlightNumber = 100;

// Default launch (used to initialize collection)
const launch = {
  flightNumber: 100,
  mission: 'Kepler Exploration X',
  rocket: 'Explorer IS1',
  launchDate: new Date('December 27, 2030'),
  target: 'Kepler-442 b',
  customers: ['ZTM', 'NASA'],
  upcoming: true,
  success: true,
};

// 🟢 Save launch to MongoDB (insert or update existing)
async function saveLaunch(launch) {
  try {
    // ✅ Using $set ensures only specific fields are updated, not the entire doc
    await launchesDatabase.updateOne(
      { flightNumber: launch.flightNumber },
      { $set: launch },
      { upsert: true }
    );
  } catch (err) {
    console.error(`❌ Could not save launch ${launch.flightNumber}:`, err);
  }
}

// 🟢 Get all launches (clean output)
async function getAllLaunchesFromDb() {
  // ✅ Remove internal Mongo fields before sending to frontend
  return await launchesDatabase.find({}, { __v: 0, _id: 0 });
}

// 🟢 Add new launch
async function addNewLaunchFromDb(launch) {
  latestFlightNumber++;

  // ✅ Ensure launch date is converted to a real Date object
  const launchDate = new Date(launch.launchDate);
  if (isNaN(launchDate)) {
    throw new Error('Invalid launch date');
  }

  const newLaunch = {
    ...launch,
    upcoming: true,
    customers: ['ZTM', 'Mastery', 'NASA'],
    success: true,
    flightNumber: latestFlightNumber,
    launchDate, // ✅ ensure correct date type
  };

  await saveLaunch(newLaunch);
  return newLaunch; // ✅ return for confirmation or API response
}

// 🟢 Initialize default launch if database is empty
async function initializeDefaultLaunch() {
  const count = await launchesDatabase.countDocuments();
  if (count === 0) {
    await saveLaunch(launch);
    console.log('✅ Default launch added to MongoDB');
  }
}

module.exports = {
  getAllLaunchesFromDb,
  addNewLaunchFromDb,
  saveLaunch,
  initializeDefaultLaunch, // ✅ optional helper
};
