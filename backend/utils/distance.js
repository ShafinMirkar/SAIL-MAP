const { ROUTE_DISTANCES } = require("./constants");

// Returns nautical mile distance for a port pair, with a generic fallback estimate
function getDistance(originPort, destinationPort) {
  const key = `${originPort}-${destinationPort}`;
  if (ROUTE_DISTANCES[key]) return ROUTE_DISTANCES[key];
  return 5000; // fallback average deep-sea distance if pair not in reference table
}

module.exports = { getDistance };
