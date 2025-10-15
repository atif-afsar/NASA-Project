const {planets} = require('../models/planets.model');
function getAllPlanets(req, res) {
  // Logic to retrieve all planets
  res.status(200).json(planets);
}

module.exports = {
  getAllPlanets,
};
