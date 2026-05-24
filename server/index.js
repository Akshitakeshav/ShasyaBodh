import express from 'express';
import cors from 'cors';
import sensorDataRouter from './routes/sensorData.js';
import cameraFeedRouter from './routes/cameraFeed.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for client running on port 5173
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Mounted Routes
app.use('/api', sensorDataRouter);
app.use('/api', cameraFeedRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: Date.now(),
    project: 'Shasya Bodh (शस्य बोध)'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🌾 SHASYA BODH (शस्य बोध) BACKEND INITIALIZED 🌾`);
  console.log(`📡 Express server listening on http://localhost:${PORT}`);
  console.log('====================================================');
});
