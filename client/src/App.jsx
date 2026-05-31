import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

import { useSensorData } from './hooks/useSensorData';
import { useESP32Status } from './hooks/useESP32Status';
import { getInitialActivities, generateRandomActivity } from './utils/mockData';
import { formatHHMMSS } from './utils/formatTime';

/**
 * Root Dashboard Component for Shasya Bodh (शस्य बोध).
 * Handles global grid layouts, central activity logs, and IP configuration modals.
 */
export default function App() {
  // 1. Core Hooks for Real-Time Telemetry & Camera Connectivity
  const { sensorData, systemStatus } = useSensorData(5000);
  const { ipAddress, isConnected, isConnecting, connect, disconnect } = useESP32Status();

  // 2. Activity Log State Management
  const [activities, setActivities] = useState(() => getInitialActivities());

  // 3. Scan linkage between LiveCamera and DiseaseDetector
  const [cameraScanSignal, setCameraScanSignal] = useState(false);

  // 4. View routing state for components (initially shows Landing Page)
  const [currentView, setCurrentView] = useState('landing');

  // Insert a custom log entry helper
  const addLogEntry = useCallback((icon, message, badge) => {
    setActivities(prev => [
      {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: formatHHMMSS(new Date()),
        icon,
        message,
        badge
      },
      ...prev.slice(0, 19) // Limit to top 20 logs for extreme memory safety
    ]);
  }, []);

  // 4. Auto-append new mock activity every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = generateRandomActivity();
      setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Track connection adjustments and write them to the logs dynamically!
  useEffect(() => {
    if (isConnected) {
      addLogEntry("📷", { key: "log.connected_ip", variables: { ipAddress } }, "INFO");
    } else {
      addLogEntry("⚠️", { key: "log.disconnected" }, "WARN");
    }
  }, [isConnected, ipAddress, addLogEntry]);

  // Handle Scan triggers initiated from the camera card
  const handleCameraScanTrigger = (file) => {
    setCameraScanSignal(file || true);
    addLogEntry("🌿", { key: "log.scan_requested" }, "INFO");
  };

  // Log completed diagnosis scans to Activity Logs dynamically
  const handleScanComplete = useCallback((result) => {
    if (!result) return;
    addLogEntry(
      "🔬",
      {
        key: "log.scan_completed_detail",
        variables: {
          crop: result.crop,
          disease: result.disease,
          confidence: result.confidence,
          severity: result.severity
        }
      },
      result.severity === 'Severe' ? 'ALERT' : result.severity === 'Moderate' ? 'WARN' : 'INFO'
    );
  }, [addLogEntry]);

  const handleClearLogs = () => {
    setActivities([]);
    addLogEntry("📋", { key: "log.cleared" }, "INFO");
  };

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage onEnterDashboard={() => setCurrentView('dashboard')} />
      )}

      {currentView === 'dashboard' && (
        <Dashboard
          onBackToLanding={() => setCurrentView('landing')}
          sensorData={sensorData}
          systemStatus={systemStatus}
          isConnected={isConnected}
          isConnecting={isConnecting}
          ipAddress={ipAddress}
          connect={connect}
          disconnect={disconnect}
          activities={activities}
          onClearLogs={handleClearLogs}
          cameraScanSignal={cameraScanSignal}
          onScanReset={() => setCameraScanSignal(false)}
          onScanComplete={handleScanComplete}
        />
      )}
    </>
  );
}
