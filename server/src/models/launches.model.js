const launches = new Map();

 let latestFlightNumber = 100;

const launch = {
    flightNumber: 100, // flight_number
    mission: 'Kepler Exploration X', // name
    rocket: 'Explorer IS1', // rocket.name
    launchDate: new Date('December 27, 2030'), // date_local
    target: 'Kepler-442 b', 
    customers: ['ZTM', 'NASA'], // payload.customers for each payload
    upcoming: true, // upcoming
    success: true, // success
}

launches.set(launch.flightNumber, launch);

const getAllLaunchesFromDb = () => Array.from(launches.values());

function addNewLaunchFromDb(launch) {
    latestFlightNumber++;
    Object.assign(launch, {
        upcoming: true,
        customers: ['ZTM', 'Mastery', 'NASA'],
        success: true,
        flightNumber: latestFlightNumber,
    });

    // Save the launch to the Map
    launches.set(launch.flightNumber, launch);
}

module.exports = {
    launches,
    getAllLaunchesFromDb,
    addNewLaunchFromDb,
};