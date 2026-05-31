import { formatHHMMSS } from './formatTime';

// Initial 8 seed activity logs
export const getInitialActivities = () => {
  const now = Date.now();
  return [
    {
      id: "seed-1",
      timestamp: formatHHMMSS(now - 12000),
      icon: "🌿",
      message: { key: "log.seed_1" },
      badge: "INFO" // green
    },
    {
      id: "seed-2",
      timestamp: formatHHMMSS(now - 45000),
      icon: "⚠️",
      message: { key: "log.seed_2" },
      badge: "WARN" // amber
    },
    {
      id: "seed-3",
      timestamp: formatHHMMSS(now - 180000),
      icon: "📷",
      message: { key: "log.seed_3" },
      badge: "INFO" // green
    },
    {
      id: "seed-4",
      timestamp: formatHHMMSS(now - 300000),
      icon: "🌊",
      message: { key: "log.seed_4" },
      badge: "INFO" // green
    },
    {
      id: "seed-5",
      timestamp: formatHHMMSS(now - 600000),
      icon: "⚠️",
      message: { key: "log.seed_5" },
      badge: "ALERT" // red
    },
    {
      id: "seed-6",
      timestamp: formatHHMMSS(now - 900000),
      icon: "🌿",
      message: { key: "log.seed_6" },
      badge: "WARN" // amber
    },
    {
      id: "seed-7",
      timestamp: formatHHMMSS(now - 1200000),
      icon: "🌊",
      message: { key: "log.seed_7" },
      badge: "INFO" // green
    },
    {
      id: "seed-8",
      timestamp: formatHHMMSS(now - 1500000),
      icon: "🌿",
      message: { key: "log.seed_8" },
      badge: "INFO" // green
    }
  ];
};

// Array of random events to feed into the 15-second timer
const randomEvents = [
  {
    icon: "🌿",
    message: { key: "log.rand_1" },
    badge: "WARN"
  },
  {
    icon: "🌊",
    message: { key: "log.rand_2" },
    badge: "INFO"
  },
  {
    icon: "⚠️",
    message: { key: "log.rand_3" },
    badge: "WARN"
  },
  {
    icon: "🌿",
    message: { key: "log.rand_4" },
    badge: "ALERT"
  },
  {
    icon: "📷",
    message: { key: "log.rand_5" },
    badge: "INFO"
  },
  {
    icon: "⚠️",
    message: { key: "log.rand_6" },
    badge: "INFO"
  },
  {
    icon: "🌊",
    message: { key: "log.rand_7" },
    badge: "ALERT"
  },
  {
    icon: "🌿",
    message: { key: "log.rand_8" },
    badge: "INFO"
  },
  {
    icon: "⚠️",
    message: { key: "log.rand_9" },
    badge: "INFO"
  },
  {
    icon: "🌿",
    message: { key: "log.rand_10" },
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
