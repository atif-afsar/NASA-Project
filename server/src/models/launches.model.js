const axios = require('axios');
const launchesDatabase = require('../models/launches.mongo');
const planetsMongo = require('./planets.mongo');

// Get latest flight number from database
async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase
    .findOne()
    .sort('-flightNumber');
  return latestLaunch ? latestLaunch.flightNumber : 100;
}

// Default launch (used to initialize collection)
const launch = {
  flightNumber: 100, //flight_number
  mission: 'Kepler Exploration X', //name
  rocket: 'Explorer IS1',
  launchDate: new Date('December 27, 2030'),
  target: 'Kepler-442 b',
  customers: ['ZTM', 'NASA'],
  upcoming: true,
  success: true, 
};

// 🟢 Save launch to MongoDB (insert or update existing)
async function saveLaunch(launch) {
  const planet = await planetsMongo.findOne({ keplerName: launch.target });  

  if (!planet) {
    throw new Error('No matching planet found');
  }
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
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';
async function loadLaunchesData(){
  console.log('Downloading Launch Data ');
  const response = await axios.post(SPACEX_API_URL, {
    
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  })
  const launchesDocs= response.data.docs
  for(const launchDoc of launchesDocs){
    const payloads = launchDoc['payloads']
    const customers = payloads.flatMap((payload) => {
      return payload['customers']
    })
    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    }
    console.log(`Launch: ${launch.flightNumber} ${launch.mission}`)
    // await saveLaunch(launch)
  }
}

// 🟢 Get all launches (clean output)
async function getAllLaunchesFromDb() {
  // ✅ Remove internal Mongo fields before sending to frontend
  return await launchesDatabase.find({}, { __v: 0, _id: 0 });
}

// 🟢 Add new launch
async function addNewLaunchFromDb(launch) {
  const latestFlightNumber = await getLatestFlightNumber();
  
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
    flightNumber: latestFlightNumber + 1,
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
  loadLaunchesData,
  getAllLaunchesFromDb,
  addNewLaunchFromDb,
  saveLaunch,
  initializeDefaultLaunch, // ✅ optional helper
};
