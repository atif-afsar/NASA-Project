const axios = require("axios");
const launchesDatabase = require("../models/launches.mongo");
const planetsMongo = require("./planets.mongo");

// 🧩 Get latest flight number from database
async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  return latestLaunch ? latestLaunch.flightNumber : 100;
}

// Default launch (used to initialize collection)
const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customers: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};

// 🟢 Save launch to MongoDB
async function saveLaunch(launch) {
  
  try {
    await launchesDatabase.updateOne(
      { flightNumber: launch.flightNumber },
      { $set: launch },
      { upsert: true }
    );
  } catch (err) {
    console.error(`❌ Could not save launch ${launch.flightNumber}:`, err);
  }
}

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  console.log("Downloading Launch Data...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        { path: "rocket", select: { name: 1 } },
        { path: "payloads", select: { customers: 1 } },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchesDocs = response.data.docs;
  for (const launchDoc of launchesDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => payload["customers"]);

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };
    console.log(`Launch: ${launch.flightNumber} ${launch.mission}`);

    await saveLaunch(launch);
  }
}

// 🟢 Helper functions (move outside)
async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function getAllLaunchesFromDb(skip, limit) {
  return await launchesDatabase.find({}, { __v: 0, _id: 0 })
  .sort({ flightNumber: 1 })
  .skip(skip)
  .limit(limit);
}

async function addNewLaunchFromDb(launch) {
  const latestFlightNumber = await getLatestFlightNumber();
  const launchDate = new Date(launch.launchDate);

  if (isNaN(launchDate)) {
    throw new Error("Invalid launch date");
  }

  const newLaunch = {
    ...launch,
    upcoming: true,
    customers: ["ZTM", "Mastery", "NASA"],
    success: true,
    flightNumber: latestFlightNumber + 1,
    launchDate,
  };

  await saveLaunch(newLaunch);
  return newLaunch;
}

async function initializeDefaultLaunch() {
  const count = await launchesDatabase.countDocuments();
  if (count === 0) {
    await saveLaunch(launch);
    console.log("✅ Default launch added to MongoDB");
  }
}

// 🟢 Main loader
async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Launch data already loaded");
  } else {
    await populateLaunches();
  }
}

// ✅ EXPORT everything from root level
module.exports = {
  loadLaunchesData,
  getAllLaunchesFromDb,
  addNewLaunchFromDb,
  saveLaunch,
  initializeDefaultLaunch,
};
