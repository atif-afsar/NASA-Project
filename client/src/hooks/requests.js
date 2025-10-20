const API_URL = 'http://localhost:8000';
async function httpGetPlanets() {
  const response = await fetch(`${API_URL}/planets`);
  return await response.json();
}

async function httpGetLaunches() {
  const response = await fetch(`${API_URL}/launches`);
  const fetchedLaunches = await response.json();
  // Load launches, sort by flight number, and return as JSON.
  return fetchedLaunches.sort((a, b) => a.flightNumber - b.flightNumber); 
}

async function httpSubmitLaunch(launch) {
  try {
    const response = await fetch(`${API_URL}/launches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(launch),
    });

    const responseBody = await response.json();
    console.log("Launch submission result:", response);

    if (!response.ok) {
      throw new Error(responseBody.message);
    }

    // Preserve both ok flag and JSON body
    return { ok: response.ok, ...responseBody };
  } catch (e) {
    console.error('Launch submission failed:', e);
    return { ok: false };
  }
}




async function httpAbortLaunch(id) {
  return await fetch(`${API_URL}/launches/${id}`, {
    method: 'DELETE',
  });
  // Delete launch with given ID.
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};