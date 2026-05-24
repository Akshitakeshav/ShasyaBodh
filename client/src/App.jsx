import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatusBar from './components/StatusBar';
import OLEDPanel from './components/OLEDPanel';
import LiveCamera from './components/LiveCamera';
import DiseaseDetector from './components/DiseaseDetector';
import ActivityLog from './components/ActivityLog';

import { useSensorData } from './hooks/useSensorData';
import { useESP32Status } from './hooks/useESP32Status';
import { getInitialActivities, generateRandomActivity } from './utils/mockData';
import { formatHHMMSS } from './utils/formatTime';
import { Cpu, X, Wifi, AlertTriangle } from 'lucide-react';

/**
 * Root Dashboard Component for Shasya Bodh (शस्य बोध).
 * Handles global grid layouts, central activity logs, and IP configuration modals.
 */
export default function App() {
  // 1. Core Hooks for Real-Time Telemetry & Camera Connectivity
  const { sensorData, systemStatus, loading, lastSynced } = useSensorData(5000);
  const { ipAddress, isConnected, isConnecting, error: ipError, connect, disconnect } = useESP32Status();

  // 2. Activity Log State Management
  const [activities, setActivities] = useState(() => getInitialActivities());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIpInput, setModalIpInput] = useState(ipAddress);

  // 3. Scan linkage between LiveCamera and DiseaseDetector
  const [cameraScanSignal, setCameraScanSignal] = useState(false);

  // Sync modal IP input with global state changes
  useEffect(() => {
    setModalIpInput(ipAddress);
  }, [ipAddress]);

  // Insert a custom log entry helper
  const addLogEntry = useCallback((icon, message, badge) => {
    setActivities(prev => [
      {
        id: `log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
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
      addLogEntry("📷", `ESP32-CAM successfully connected at IP Address ${ipAddress}`, "INFO");
    } else {
      addLogEntry("⚠️", `ESP32-CAM disconnected. Hardware links deactivated.`, "WARN");
    }
  }, [isConnected, ipAddress, addLogEntry]);

  // Handle Scan triggers initiated from the camera card
  const handleCameraScanTrigger = () => {
    setCameraScanSignal(true);
    addLogEntry("🌿", `Leaf scan sequence requested from Live Video frame capture.`, "INFO");
  };

  // Submit new IP settings from modal
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (isConnecting) return;

    if (modalIpInput.trim()) {
      const success = await connect(modalIpInput.trim());
      if (success) {
        setIsModalOpen(false);
      }
    }
  };

  const handleClearLogs = () => {
    setActivities([]);
    addLogEntry("📋", "System console log cleared by user.", "INFO");
  };

  return (
    <div className="bg-agBg min-h-screen text-gray-100 flex flex-col justify-between font-sans selection:bg-agPrimary selection:text-black">
      
      {/* 1. Header Navigation Bar */}
      <Navbar 
        isConnected={isConnected} 
        isConnecting={isConnecting}
        lastSynced={lastSynced}
        ipAddress={ipAddress}
        onOpenModal={() => setIsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 flex flex-col gap-6">
        
        {/* 2. Hero Status Row */}
        <StatusBar 
          online={isConnected}
          uptime={systemStatus.uptime}
          detections={systemStatus.detections}
          alerts={systemStatus.alerts}
        />

        {/* 3. Three Column Component Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Column A: Simulated OLED Display Bezel */}
          <div className="lg:col-span-1">
            <OLEDPanel sensorData={sensorData} systemStatus={systemStatus} />
          </div>

          {/* Column B: Live Camera Telemetry */}
          <div className="lg:col-span-1">
            <LiveCamera 
              ipAddress={ipAddress}
              isConnected={isConnected}
              isConnecting={isConnecting}
              connect={connect}
              disconnect={disconnect}
              onScanFrame={handleCameraScanTrigger}
            />
          </div>

          {/* Column C: AI Leaf Disease Detector */}
          <div className="lg:col-span-1">
            <DiseaseDetector 
              cameraScanTrigger={cameraScanSignal}
              onScanReset={() => setCameraScanSignal(false)}
            />
          </div>

        </div>

        {/* 4. Bottom Activity Console */}
        <div className="w-full">
          <ActivityLog 
            activities={activities} 
            onClearLogs={handleClearLogs}
          />
        </div>

      </main>

      {/* 5. Floating ESP32 Status Button Widget (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 p-3 sm:px-4 sm:py-2.5 rounded-full shadow-lg border transition-all hover:scale-105 active:scale-95 ${
            isConnected
              ? 'bg-agCard border-agPrimary/30 text-agPrimary hover:border-agPrimary/75'
              : 'bg-[#1a0f0f] border-agRed/30 text-agRed hover:border-agRed/75'
          }`}
          title="Configure ESP32 Connection IP"
        >
          <span className="relative flex h-2.5 w-2.5">
            {isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agPrimary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-agPrimary"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-agRed"></span>
            )}
          </span>
          <Cpu className="w-4 h-4" />
          <span className="text-xs font-bold font-mono hidden sm:inline">
            {isConnected ? `ESP32: ${ipAddress}` : 'ESP32 DISCONNECTED'}
          </span>
        </button>
      </div>

      {/* 6. Premium Glassmorphic Configuration Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop blur backing */}
          <div 
            onClick={() => setIsModalOpen(false)} 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          ></div>
          
          {/* Dialog Card */}
          <div className="relative w-full max-w-md bg-agCard border border-agPrimary/30 rounded-2xl p-6 shadow-2xl z-10 animate-in fade-in zoom-in duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 rounded-lg hover:bg-agBg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 border-b border-agPrimary/10 pb-4 mb-4">
              <div className="p-2 bg-agPrimary/10 rounded-lg text-agPrimary border border-agPrimary/25">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  ESP32 IP CONFIGURATION
                </h3>
                <p className="text-[10px] text-gray-400">Configure remote telemetry link variables</p>
              </div>
            </div>

            {/* Config Form */}
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-mono">
                  Device Local IP Target
                </label>
                <input
                  type="text"
                  value={modalIpInput}
                  onChange={(e) => setModalIpInput(e.target.value)}
                  placeholder="e.g. 192.168.1.100"
                  className="w-full bg-agBg border border-agPrimary/25 focus:border-agPrimary/75 outline-none rounded-lg p-2.5 text-sm text-gray-200 font-mono"
                  autoFocus
                />
                
                {ipError && (
                  <div className="flex items-center gap-1.5 text-[10px] text-agRed mt-2 font-mono">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{ipError}</span>
                  </div>
                )}
              </div>

              {/* Status Display inside Modal */}
              <div className="bg-agBg/85 border border-agPrimary/10 p-3 rounded-lg flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Current Node Status:</span>
                <span className={isConnected ? "text-agPrimary font-bold" : "text-gray-500 font-semibold"}>
                  {isConnected ? "ACTIVE LINK" : "LINK OFFLINE"}
                </span>
              </div>

              {/* Actions panel */}
              <div className="flex gap-3 pt-2">
                
                {isConnected && (
                  <button
                    type="button"
                    onClick={() => {
                      disconnect();
                      setIsModalOpen(false);
                    }}
                    className="flex-1 bg-agRed/10 border border-agRed/30 hover:bg-agRed/20 text-agRed py-2 rounded-lg text-xs font-bold transition-all"
                  >
                    Disconnect Link
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="flex-grow bg-agPrimary border border-agPrimary/45 hover:bg-agPrimary/80 text-black py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Link Handshaking...
                    </>
                  ) : (
                    'Connect & Sync'
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Webapp footer */}
      <footer className="border-t border-agPrimary/10 bg-black/60 py-3 text-center text-[10px] text-gray-500 font-mono select-none">
        <span>© 2026 Shasya Bodh (शस्य बोध) IoT Dashboard — Advanced Agentic Agro Controls</span>
      </footer>

    </div>
  );
}
