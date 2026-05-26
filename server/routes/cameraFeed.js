import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';

const router = express.Router();

// Define __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Ensure temp directory exists for uploads
const tempDir = path.join(projectRoot, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer in-memory storage to keep disk clean
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/analyse-image
router.post('/analyse-image', upload.single('image'), (req, res) => {
  // Check if image file was uploaded
  if (!req.file) {
    console.log('[Shasya Bodh Backend] Analyse requested but no file uploaded.');
    return res.status(400).json({ error: 'No image file uploaded.' });
  }

  console.log(`[Shasya Bodh Backend] Analyzing uploaded leaf image: ${req.file.originalname} (${req.file.size} bytes)`);

  const tempFilePath = path.join(tempDir, `${Date.now()}-${req.file.originalname}`);

  // Write file buffer to temp folder
  fs.writeFile(tempFilePath, req.file.buffer, (err) => {
    if (err) {
      console.error('[Shasya Bodh Backend] Failed to write temp file:', err);
      return res.status(500).json({ error: 'Failed to save image file on server.' });
    }

    const pythonExe = path.join(projectRoot, 'venv', 'Scripts', 'python.exe');
    const scriptPath = path.join(projectRoot, 'model', 'predict.py');

    // Run prediction script
    execFile(pythonExe, [scriptPath, tempFilePath], (execErr, stdout, stderr) => {
      // Clean up the temp image file
      fs.unlink(tempFilePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('[Shasya Bodh Backend] Failed to delete temp file:', unlinkErr);
        }
      });

      if (execErr) {
        console.error('[Shasya Bodh Backend] Model execution failed:', execErr);
        console.error('Stderr:', stderr);
        return res.status(500).json({ error: 'Inference script execution failed.', details: stderr });
      }

      try {
        const result = JSON.parse(stdout);
        console.log('[Shasya Bodh Backend] Inference result:', result.crop, '-', result.disease, `(${result.confidence}%)`);
        return res.json(result);
      } catch (parseErr) {
        console.error('[Shasya Bodh Backend] Failed to parse script output:', parseErr);
        console.error('Raw stdout:', stdout);
        return res.status(500).json({ error: 'Failed to parse script prediction response.', details: stdout });
      }
    });
  });
});

// GET /api/camera-proxy
router.get('/camera-proxy', async (req, res) => {
  const ip = req.query.ip || '192.168.1.100';
  const url = `http://${ip}/capture?t=${Date.now()}`;

  try {
    // 2-second timeout to check if ESP32 is online
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`ESP32-CAM status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    // Graceful proxy failure
    res.status(504).json({
      error: 'ESP32 CAM Offline',
      message: `Failed to connect to ESP32 CAM at http://${ip}/capture.`,
      details: error.message
    });
  }
});

export default router;

