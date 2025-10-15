const app = require('./app');
const { loadPlanetsData } = require('./models/planets.model');
const PORT = process.env.PORT || 8000;
async function startServer() {
await loadPlanetsData();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
}
startServer();

