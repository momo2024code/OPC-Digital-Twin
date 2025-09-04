const express = require('express');
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Open-Meteo API URLs
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const HISTORICAL_URL = "https://archive-api.open-meteo.com/v1/archive";

// Cache configuration
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute cache for real-time, 1 hour for historical

// Real-time weather data from Open-Meteo
app.get('/api/realtime', async (req, res) => {
  const { latitude, longitude } = req.query;
  
  // Default to Berlin coordinates if not provided
  const lat = latitude || "52.52";
  const lon = longitude || "13.41";
  const cacheKey = `realtime:${lat},${lon}`;
  
  try {
    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return res.json(cached.data);
      }
    }

    // Fetch from Open-Meteo
    const response = await axios.get(FORECAST_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current: "temperature_2m,relative_humidity_2m",
        hourly: "temperature_2m"
      }
    });

    const currentData = response.data.current;
    
    const result = {
      timestamp: new Date().toISOString(),
      temperature: currentData.temperature_2m,
      humidity: currentData.relative_humidity_2m,
      units: response.data.current_units
    };

    // Cache the result
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: result
    });

    res.json(result);
  } catch (error) {
    console.error("Open-Meteo Error:", error);
    res.status(500).json({
      error: "Failed to fetch real-time data",
      details: error.message
    });
  }
});

// Historical weather data from Open-Meteo
app.get("/api/historical", async (req, res) => {
  const { latitude, longitude, start_date, end_date } = req.query;
  
  // Validate parameters
  if (!start_date || !end_date) {
    return res.status(400).json({ 
      error: "Missing required parameters: start_date, end_date" 
    });
  }

  // Default coordinates
  const lat = latitude || "52.52";
  const lon = longitude || "13.41";
  const cacheKey = `historical:${lat},${lon},${start_date},${end_date}`;
  
  try {
    // Check cache first
    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey));
    }

    // Fetch from Open-Meteo
    const response = await axios.get(HISTORICAL_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        start_date,
        end_date,
        hourly: "temperature_2m,relative_humidity_2m"
      }
    });

    const result = {
      data: response.data.hourly,
      units: response.data.hourly_units
    };

    // Cache for 1 hour
    cache.set(cacheKey, result);
    setTimeout(() => cache.delete(cacheKey), 3600000);

    res.json(result);
  } catch (error) {
    console.error("Open-Meteo Error:", error);
    res.status(500).json({ 
      error: "Failed to fetch historical data",
      details: error.message 
    });
  }
});

// Combined endpoint
app.get("/api/combined", async (req, res) => {
  try {
    const [realtime, historical] = await Promise.all([
      axios.get(`http://localhost:${port}/api/realtime`, { params: req.query }),
      axios.get(`http://localhost:${port}/api/historical`, { params: req.query })
    ]);

    res.json({
      realtime: realtime.data,
      historical: historical.data
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch combined data",
      details: error.message 
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "operational",
    timestamp: new Date().toISOString(),
    services: {
      realtime: "Open-Meteo",
      historical: "Open-Meteo"
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Backend running at http://localhost:${port}`);
  console.log(`Endpoints:
  - GET /api/realtime   : Real-time weather data
  - GET /api/historical : Historical weather data
  - GET /api/combined   : Combined real-time and historical
  - GET /api/health     : Health check`);
});