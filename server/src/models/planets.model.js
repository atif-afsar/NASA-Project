const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const Planet = require("./planets.mongo"); // your Mongoose model

// ✅ Check if a planet is habitable
function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

// 🟢 Save or update planet in MongoDB
async function savePlanet(planet) {
  try {
    if (!planet.kepler_name) return; // skip invalid rows

    await Planet.updateOne(
      { keplerName: planet.kepler_name }, // unique filter
      { 
        $set: { 
          keplerName: planet.kepler_name,
          koi_disposition: planet.koi_disposition,
          koi_insol: planet.koi_insol,
          koi_prad: planet.koi_prad
        } 
      },
      { upsert: true } // insert if not exists
    );
  } catch (err) {
    console.error(`❌ Could not save planet ${planet.kepler_name}:`, err);
  }
}

// 🟢 Get all planets from database
async function getAllPlanets() {
  return await Planet.find({}, { _id: 0, __v: 0 });
}

// 🟢 Load planets from CSV and save to MongoDB
function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    const savePromises = [];

    fs.createReadStream(
      path.join(__dirname, "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", (data) => {
        if (isHabitablePlanet(data)) {
        
          savePromises.push(savePlanet(data)); // store promise
        }
      })
      .on("error", (err) => reject(err))
      .on("end", async () => {
        await Promise.all(savePromises); // wait for all saves to complete
        const all = await getAllPlanets();
        console.log(`✅ ${all.length} habitable planets saved to MongoDB`);
        resolve();
      });
  });
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
  savePlanet,
};
