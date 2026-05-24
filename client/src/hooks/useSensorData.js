import { useState, useEffect, useCallback } from 'react';

const DEFAULT_SENSOR = {
  crop: "Tomato",
  disease: "Early Blight",
  confidence: 94.2,
  ph: 6.4,
  temp: 28.4,
  humidity: 72,
  waterLevel: 12,
  status: "safe",
  timestamp: Date.now()
};

const DEFAULT_STATUS = {
  online: true,
  uptime: "2h 34m",
  detections: 47,
  alerts: 2
};

/**
 * Custom hook to handle real-time sensor polling and system status updates.
 * Includes a premium client-side backup simulation if the backend is unreachable.
 */
export const useSensorData = (pollingIntervalMs = 5000) => {
  const [sensorData, setSensorData] = useState(DEFAULT_SENSOR);
  const [systemStatus, setSystemStatus] = useState(DEFAULT_STATUS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(Date.now());

  const fetchData = useCallback(async () => {
    try {
      const baseUrl = 'http://localhost:3001';
      
      const [sensorRes, statusRes] = await Promise.all([
        fetch(`${baseUrl}/api/sensor-data`),
        fetch(`${baseUrl}/api/status`)
      ]);

      if (!sensorRes.ok || !statusRes.ok) {
        throw new Error('Server returned error status');
      }

      const sensorJson = await sensorRes.json();
      const statusJson = await statusRes.json();

      setSensorData(sensorJson);
      setSystemStatus(statusJson);
      setError(null);
      setLastSynced(Date.now());
    } catch (err) {
      console.warn('[Shasya Bodh Client] Backend server unreachable. Simulating telemetry drift.');
      setError(err.message);

      // Perform direct local state simulation so the app is always functional
      setSensorData(prev => {
        const drift = (Math.random() * 10 - 5) / 100; // ±5%
        let ph = prev.ph * (1 + drift);
        let temp = prev.temp * (1 + drift);
        let humidity = prev.humidity * (1 + drift);
        let waterLevel = prev.waterLevel * (1 + drift);

        // Clamps
        ph = Math.max(4.5, Math.min(8.5, ph));
        temp = Math.max(15, Math.min(45, temp));
        humidity = Math.max(30, Math.min(95, humidity));
        waterLevel = Math.max(2, Math.min(24.5, waterLevel));

        // Occasional spike in water level to demonstrate warning trigger
        if (Math.random() < 0.08) {
          waterLevel = 20.5 + Math.random() * 3.8;
        }

        const isWarning = waterLevel > 20.0;

        return {
          ...prev,
          ph: parseFloat(ph.toFixed(1)),
          temp: parseFloat(temp.toFixed(1)),
          humidity: Math.round(humidity),
          waterLevel: parseFloat(waterLevel.toFixed(1)),
          confidence: parseFloat((90.0 + Math.random() * 8.5).toFixed(1)),
          status: isWarning ? "warning" : "safe",
          timestamp: Date.now()
        };
      });

      setSystemStatus(prev => {
        const hasWarning = sensorData.waterLevel > 20.0;
        return {
          ...prev,
          detections: prev.detections + (Math.random() < 0.25 ? 1 : 0),
          alerts: hasWarning ? 3 : 2
        };
      });

      setLastSynced(Date.now());
    } finally {
      setLoading(false);
    }
  }, [sensorData.waterLevel]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, pollingIntervalMs);
    return () => clearInterval(interval);
  }, [fetchData, pollingIntervalMs]);

  return {
    sensorData,
    systemStatus,
    loading,
    error,
    lastSynced,
    refetch: fetchData
  };
};
