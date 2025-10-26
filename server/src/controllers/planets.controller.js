// controllers/planets.controller.js
const { getAllPlanets } = require('../models/planets.model');

async function httpGetAllPlanets(req, res) {
  try {
    const planets = await getAllPlanets(); // ✅ call the function
    res.status(200).json(planets); // send clean JSON to frontend
  } catch (err) {
    console.error('❌ Could not get planets:', err);
    res.status(500).json({ error: 'Failed to fetch planets' });
  }
}

module.exports = {
  getAllPlanets: httpGetAllPlanets, // match the router import
};
