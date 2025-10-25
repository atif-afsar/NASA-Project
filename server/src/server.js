const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const { loadPlanetsData } = require('./models/planets.model');
const  connectToDatabase  = require('./db/db');
const PORT = process.env.PORT || 8000;
async function startServer() {
  await connectToDatabase();
  await loadPlanetsData();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
}
startServer();

