const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const { loadPlanetsData } = require('./models/planets.model');
const  {connectToDatabase}  = require('./db/db');
const { initializeDefaultLaunch, loadLaunchesData } = require('./models/launches.model');
const PORT = process.env.PORT || 8000;
async function startServer() {
  await connectToDatabase(); // connect to MongoDB
  await loadPlanetsData();  
  await loadLaunchesData() // load & save all habitable planets
  await initializeDefaultLaunch(); // optional: save default launch

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
}
startServer();

