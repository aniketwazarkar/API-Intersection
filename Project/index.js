const express = require('express');
const turf = require('@turf/turf');

const app = express();
const port = 3000;

// Middleware to parse JSON in request body
app.use(express.json());

// Dummy authentication check middleware
const authMiddleware = (req, res, next) => {
  const authToken = req.header('Authorization');
  if (authToken !== 'your-auth-token') {
    console.error('Unauthorized request');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Logging middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// API endpoint for finding line intersections
app.post('/intersections', authMiddleware, (req, res) => {
  // Parse the request body
  const { linestring } = req.body;

  // Check if the linestring is valid
  if (!linestring || linestring.type !== 'LineString' || !Array.isArray(linestring.coordinates)) {
    console.error('Invalid linestring');
    return res.status(400).json({ error: 'Invalid linestring' });
  }

  // Sample set of 50 randomly spread lines
  const lines = [
    {
      id: 'L01',
      start: [-74.006, 40.712],
      end: [-74.001, 40.712],
    },
    // ... add the remaining 49 lines
  ];

  // Convert the linestring to a Turf.js feature
  const linestringFeature = turf.lineString(linestring.coordinates);

  // Find intersecting lines
  const intersectingLines = lines.filter((line) => {
    const lineFeature = turf.lineString([line.start, line.end]);
    return turf.booleanIntersects(lineFeature, linestringFeature);
  });

  if (intersectingLines.length === 0) {
    // No intersections
    return res.json([]);
  } else {
    // Intersections found
    return res.json(intersectingLines);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
