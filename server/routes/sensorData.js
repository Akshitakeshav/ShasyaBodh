import express from 'express';

const router = express.Router();

// Helper to apply ±5% random drift
const applyDrift = (value, min, max, decimals = 1) => {
  const percentChange = (Math.random() * 10 - 5) / 100; // -0.05 to +0.05
  let newValue = value * (1 + percentChange);
  
  // Clamp value
  if (min !== undefined && newValue < min) newValue = min;
  if (max !== undefined && newValue > max) newValue = max;
  
  return parseFloat(newValue.toFixed(decimals));
};

// Base sensor state
let baseSensorState = {
  ph: 6.4,
  temp: 28.4,
  humidity: 72.0,
  waterLevel: 12.0
};

// Start uptime tracking
const startTime = Date.now();

// GET /api/sensor-data
router.get('/sensor-data', (req, res) => {
  // Apply drift to simulate live sensor fluctuations
  baseSensorState.ph = applyDrift(baseSensorState.ph, 4.5, 8.5, 1);
  baseSensorState.temp = applyDrift(baseSensorState.temp, 20.0, 40.0, 1);
  baseSensorState.humidity = applyDrift(baseSensorState.humidity, 30.0, 95.0, 0);
  baseSensorState.waterLevel = applyDrift(baseSensorState.waterLevel, 5.0, 24.5, 1); // Stay just below 25 cm threshold mostly

  // 10% chance to spike water level above 20cm to trigger warning state for testing
  if (Math.random() < 0.1) {
    baseSensorState.waterLevel = parseFloat((20.5 + Math.random() * 4).toFixed(1));
  }

  const isWarning = baseSensorState.waterLevel > 20.0; // 80% of 25cm threshold

  res.json({
    crop: "Tomato",
    disease: "Early Blight",
    confidence: parseFloat((90.0 + Math.random() * 8).toFixed(1)),
    ph: baseSensorState.ph,
    temp: baseSensorState.temp,
    humidity: baseSensorState.humidity,
    waterLevel: baseSensorState.waterLevel,
    status: isWarning ? "warning" : "safe",
    timestamp: Date.now()
  });
});

// GET /api/status
router.get('/status', (req, res) => {
  // Calculate uptime
  const diffMs = Date.now() - startTime;
  const diffSecs = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSecs / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  
  // Format uptime string
  const uptimeStr = `${hours}h ${minutes}m`;

  res.json({
    online: true,
    uptime: uptimeStr,
    detections: 47 + Math.floor((Date.now() - startTime) / 60000), // Increments every minute
    alerts: baseSensorState.waterLevel > 20.0 ? 3 : 2
  });
});

export default router;
