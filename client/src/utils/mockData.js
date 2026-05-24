import { formatHHMMSS } from './formatTime';

// Initial 8 seed activity logs
export const getInitialActivities = () => {
  const now = Date.now();
  return [
    {
      id: "seed-1",
      timestamp: formatHHMMSS(now - 12000),
      icon: "🌿",
      message: "Leaf scan completed. Target: TOMATO. Diagnosis: HEALTHY.",
      badge: "INFO" // green
    },
    {
      id: "seed-2",
      timestamp: formatHHMMSS(now - 45000),
      icon: "⚠️",
      message: "Soil Moisture levels dropped to 48% in Zone B. Irrigation highly recommended.",
      badge: "WARN" // amber
    },
    {
      id: "seed-3",
      timestamp: formatHHMMSS(now - 180000),
      icon: "📷",
      message: "ESP32-CAM stream initialized successfully. Current resolution 640x480.",
      badge: "INFO" // green
    },
    {
      id: "seed-4",
      timestamp: formatHHMMSS(now - 300000),
      icon: "🌊",
      message: "Water Level Threshold Check: 12 cm. Below 25 cm safety limit. Status: SAFE.",
      badge: "INFO" // green
    },
    {
      id: "seed-5",
      timestamp: formatHHMMSS(now - 600000),
      icon: "⚠️",
      message: "CRITICAL: Temperature spike detected (34.2°C). Activating misting systems.",
      badge: "ALERT" // red
    },
    {
      id: "seed-6",
      timestamp: formatHHMMSS(now - 900000),
      icon: "🌿",
      message: "Leaf Scan completed. Target: TOMATO. Diagnosis: LEAF BLIGHT (94% Conf).",
      badge: "WARN" // amber
    },
    {
      id: "seed-7",
      timestamp: formatHHMMSS(now - 1200000),
      icon: "🌊",
      message: "Precipitation forecasting updated. Moderate rain expected in 3 hours.",
      badge: "INFO" // green
    },
    {
      id: "seed-8",
      timestamp: formatHHMMSS(now - 1500000),
      icon: "🌿",
      message: "IoT base telemetry station Shasya Bodh online. System initialized.",
      badge: "INFO" // green
    }
  ];
};

// Array of random events to feed into the 15-second timer
const randomEvents = [
  {
    icon: "🌿",
    message: "Leaf scanning completed. Crop: CABBAGE. Diagnosis: BLACK ROT. Action: Spray Fungicide.",
    badge: "WARN"
  },
  {
    icon: "🌊",
    message: "Flood level check. Level: 14.2 cm. Threshold: 25.0 cm. Status: SAFE.",
    badge: "INFO"
  },
  {
    icon: "⚠️",
    message: "ESP32 telemetry warns: Battery charge at 15%. Switching to solar conservation mode.",
    badge: "WARN"
  },
  {
    icon: "🌿",
    message: "AI leaf inference processed. Crop: POTATO. Diagnosis: LATE BLIGHT. Action: Apply Mancozeb.",
    badge: "ALERT"
  },
  {
    icon: "📷",
    message: "ESP32-CAM successfully refreshed MJPEG buffer. Connected signal: Strong.",
    badge: "INFO"
  },
  {
    icon: "⚠️",
    message: "Soil pH levels shifted: 6.4 -> 6.1 (Slightly Acidic). Monitor calcium feeds.",
    badge: "INFO"
  },
  {
    icon: "🌊",
    message: "CRITICAL ALERT: Flood detection level reached 21.4 cm! Exceeding warning boundary.",
    badge: "ALERT"
  },
  {
    icon: "🌿",
    message: "Automated scan finished. Target: EGGPLANT. Diagnosis: HEALTHY (98.6% Conf).",
    badge: "INFO"
  },
  {
    icon: "⚠️",
    message: "Moisture sensor recalibrated in Sector 4. Level adjusted to 68.2%.",
    badge: "INFO"
  },
  {
    icon: "🌿",
    message: "Leaf scan completed. Target: TOMATO. Diagnosis: EARLY BLIGHT (94.2% Conf).",
    badge: "WARN"
  }
];

export const generateRandomActivity = () => {
  const index = Math.floor(Math.random() * randomEvents.length);
  const eventTemplate = randomEvents[index];
  return {
    id: `rand-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    timestamp: formatHHMMSS(new Date()),
    ...eventTemplate
  };
};
