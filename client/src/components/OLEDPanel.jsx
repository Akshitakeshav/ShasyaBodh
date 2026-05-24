import React, { useState, useEffect } from 'react';
import { formatHHMMSS } from '../utils/formatTime';

/**
 * OLEDPanel Component simulating a physical hardware OLED monitor.
 * Displays green phosphor characters, CRT scanlines, and screen glows.
 */
export default function OLEDPanel({ sensorData, systemStatus }) {
  const [activeTab, setActiveTab] = useState('crop'); // 'crop', 'flood', 'soil'
  const [typedContent, setTypedContent] = useState([]);
  const [typingIndex, setTypingIndex] = useState(0);

  // Formulate the line data based on the active tab and live sensor telemetry
  const getTabLines = () => {
    const { crop, disease, confidence, ph, temp, humidity, waterLevel, status } = sensorData;

    switch (activeTab) {
      case 'crop':
        const fillBlocks = Math.round((confidence / 100) * 10);
        const progressStr = '■'.repeat(fillBlocks) + '░'.repeat(10 - fillBlocks);
        return [
          "SHASYA BODH v1.0",
          "─────────────────",
          "STATUS: SCANNING",
          `CROP  : ${crop.toUpperCase()}`,
          `DISEASE: ${disease.toUpperCase()}`,
          `CONF  : ${confidence.toFixed(1)}%`,
          "ACTION: SPRAY NOW",
          "─────────────────",
          `pH: ${ph.toFixed(1)}  TEMP:${Math.round(temp)}C`,
          `[${progressStr}] ${Math.round(confidence)}%`
        ];

      case 'flood':
        const floodLimit = 25.0;
        const floodStatus = waterLevel > 20.0 ? "WARNING" : "SAFE";
        return [
          "FLOOD MONITOR",
          "─────────────────",
          `WATER LVL: ${waterLevel.toFixed(1)} cm`,
          `STATUS   : ${floodStatus}`,
          `THRESHOLD: ${floodLimit.toFixed(1)} cm`,
          "SENSOR   : ACTIVE",
          `LAST CHK : ${formatHHMMSS(sensorData.timestamp)}`,
          `ALERT    : ${waterLevel > 20.0 ? "ON" : "OFF"}`
        ];

      case 'soil':
        let soilRating = "GOOD";
        const moisture = Math.round(sensorData.humidity - 4); // Simulated soil moisture derived from telemetry
        if (moisture < 50) soilRating = "DRY";
        else if (moisture > 85) soilRating = "SOGGY";
        return [
          "SOIL ANALYSIS",
          "─────────────────",
          `pH VALUE : ${ph.toFixed(1)}`,
          `MOISTURE : ${moisture}%`,
          "NITROGEN : HIGH",
          `TEMP     : ${temp.toFixed(1)}C`,
          `HUMIDITY : ${humidity}%`,
          `RATING   : ${soilRating}`
        ];

      default:
        return [];
    }
  };

  const lines = getTabLines();

  // Run typewriter effect whenever tab changes or sensor data ticks
  useEffect(() => {
    setTypingIndex(0);
    setTypedContent([]);
  }, [activeTab, sensorData.timestamp]);

  useEffect(() => {
    if (typingIndex < lines.length) {
      const timer = setTimeout(() => {
        setTypedContent(prev => [...prev, lines[typingIndex]]);
        setTypingIndex(prev => prev + 1);
      }, 75); // Type out each line sequentially
      return () => clearTimeout(timer);
    }
  }, [typingIndex, lines]);

  // Calculations for Flood meter progress bar (safety 25cm limit)
  const waterPercent = Math.min(100, Math.max(0, (sensorData.waterLevel / 25.0) * 100));
  const isFloodWarning = sensorData.waterLevel > 20.0;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* 3 Physical Toggle Buttons */}
      <div className="grid grid-cols-3 gap-2 bg-agCard border border-agPrimary/25 p-1 rounded-xl shadow-agCard">
        {[
          { id: 'crop', label: '🌿 Crop', color: 'hover:text-agPrimary hover:border-agPrimary/40' },
          { id: 'flood', label: '🌊 Flood', color: 'hover:text-blue-400 hover:border-blue-400/40' },
          { id: 'soil', label: '🌡️ Soil', color: 'hover:text-agAmber hover:border-agAmber/40' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 text-xs font-bold rounded-lg border transition-all ${
              activeTab === tab.id
                ? 'bg-agPrimary/10 border-agPrimary/70 text-agOled'
                : 'bg-transparent border-transparent text-gray-400 ' + tab.color
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Simulated Hardware OLED Screen Card */}
      <div className="flex-1 bg-gradient-to-b from-[#111811] to-[#050705] border border-agPrimary/30 rounded-xl p-4 shadow-agCard flex flex-col justify-between">
        
        {/* Outer OLED screen bezel */}
        <div className="bg-black rounded-lg p-4 border-4 border-[#1a241a] shadow-inner crt-scanlines oled-screen-glow relative overflow-hidden flex flex-col justify-between h-[320px]">
          
          {/* Glass glare effect overlays */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.04] pointer-events-none z-10"></div>
          
          {/* Green Glow Text Body */}
          <div className="font-mono text-xs text-agOled select-none leading-relaxed flex-1 flex flex-col justify-start">
            {typedContent.map((line, idx) => {
              // Special visual blinking alert for flood warning
              if (activeTab === 'flood' && line.includes('STATUS   : WARNING')) {
                return (
                  <div key={idx} className="flex gap-2">
                    <span>STATUS   :</span>
                    <span className="text-agRed font-extrabold warning-flash">[WARNING]</span>
                  </div>
                );
              }
              if (activeTab === 'flood' && line.includes('ALERT    : ON')) {
                return (
                  <div key={idx} className="flex gap-2">
                    <span>ALERT    :</span>
                    <span className="text-agRed font-extrabold warning-flash">ACTIVE!</span>
                  </div>
                );
              }
              return <div key={idx}>{line}</div>;
            })}
            
            {/* Blinking Cursor at bottom of typed contents */}
            {typingIndex >= lines.length && (
              <div className="blinking-cursor inline-block w-2"></div>
            )}
          </div>

          {/* Visual Widgets built inside OLED area */}
          {activeTab === 'flood' && typingIndex >= lines.length && (
            <div className="mt-3 font-mono text-[10px] text-agOled relative z-20">
              <div className="flex justify-between mb-1">
                <span>0cm</span>
                <span>SAFETY LIMIT (25cm)</span>
              </div>
              <div className="w-full bg-[#111811] border border-agOled/30 rounded h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${isFloodWarning ? 'bg-agRed warning-flash' : 'bg-agOled'}`}
                  style={{ width: `${waterPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-end mt-0.5 text-[8px] opacity-75">
                Current Level: {waterPercent.toFixed(0)}% safety capacity
              </div>
            </div>
          )}

          {activeTab === 'soil' && typingIndex >= lines.length && (
            <div className="mt-4 font-mono text-[9px] text-agOled grid grid-cols-2 gap-2 opacity-95">
              <div className="border border-agOled/25 rounded p-1 bg-black/50">
                🌱 MOISTURE: {Math.round(sensorData.humidity - 4)}%
              </div>
              <div className="border border-agOled/25 rounded p-1 bg-black/50">
                🧬 pH: {sensorData.ph.toFixed(1)}
              </div>
            </div>
          )}

        </div>

        {/* Outer label stamp on bezel */}
        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mt-3 select-none">
          <span>OLED DISPLAY I2C</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-agPrimary/80 animate-pulse"></span>
            ACTIVE STATE
          </span>
        </div>

      </div>
    </div>
  );
}
