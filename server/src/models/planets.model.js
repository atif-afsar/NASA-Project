const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const planets = require("./planets.mongo");

// 🟢 Function to check whether a planet is habitable
function isHabitablePlanet(planet) {
  // ✅ Convert values from string → number before comparing
  const insol = Number(planet["koi_insol"]);
  const prad = Number(planet["koi_prad"]);

  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    insol > 0.36 &&
    insol < 1.11 &&
    prad < 1.6
  );
}

// 🟢 Load data from kepler_data.csv into MongoDB
function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "src", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#", // Ignore comment lines in CSV
          columns: true, // Use headers as object keys
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          // ✅ Await here ensures proper async flow and avoids race conditions
          await savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.error("❌ Error reading CSV file:", err);
        reject(err);
      })
      .on("end", async () => {
        // ✅ Fetch all planets once file is completely parsed
        const all = await getAllPlanets();

        // ✅ Filter out any undefined entries for safety
        const planetNames = all
          .map((p) => p.keplerName)
          .filter((name) => !!name);

        console.log(planetNames);
        console.log(`${planetNames.length} habitable planets found!`);
        resolve();
      });
  });
}

// 🟢 Fetch all planets (clean output, hides internal Mongo fields)
async function getAllPlanets() {
  return await planets.find({}, { _id: 0, __v: 0 });
}

// 🟢 Save planet to MongoDB (insert or update existing)
async function savePlanet(planet) {
  try {
    // ✅ Skip invalid entries (no kepler_name)
    if (!planet.kepler_name || planet.kepler_name.trim() === "") return;

    await planets.updateOne(
      { keplerName: planet.kepler_name }, // find by planet name
      {
        // ✅ Use $set to avoid overwriting entire doc
        $set: {
          keplerName: planet.kepler_name,
          koi_disposition: planet.koi_disposition,
          koi_insol: Number(planet.koi_insol),
          koi_prad: Number(planet.koi_prad),
        },
      },
      { upsert: true } // create if doesn't exist
    );
  } catch (err) {
    console.error(`❌ Could not save planet ${planet.kepler_name}:`, err);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
  savePlanet,
};
