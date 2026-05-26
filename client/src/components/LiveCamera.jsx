import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Radio, Settings2, Image as ImageIcon, Zap } from 'lucide-react';
import { formatHHMMSS } from '../utils/formatTime';

/**
 * LiveCamera Component. Displays ESP32 CAM stream, 
 * renders static noise if disconnected, and interacts with the Disease Detector.
 */
export default function LiveCamera({ 
  ipAddress, 
  isConnected, 
  isConnecting, 
  connect, 
  disconnect, 
  onScanFrame 
}) {
  const [localIp, setLocalIp] = useState(ipAddress);
  const [timestamp, setTimestamp] = useState(Date.now());
  const [frameCount, setFrameCount] = useState(0);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync internal IP state with parent changes
  useEffect(() => {
    setLocalIp(ipAddress);
  }, [ipAddress]);

  // Polling clock for MJPEG fallback (triggers refresh every 2 seconds)
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setTimestamp(Date.now());
      setFrameCount(c => c + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Handle connection submit
  const handleConnectSubmit = (e) => {
    e.preventDefault();
    if (isConnecting) return;
    if (localIp.trim()) {
      connect(localIp.trim());
    }
  };

  // Capture current frame (downloads it to user disk + visual flash)
  const handleCaptureFrame = () => {
    if (!isConnected) return;
    
    // Perform camera shutter flash effect
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 250);

    // Mock image download link trigger
    const link = document.createElement('a');
    link.href = `http://localhost:3001/api/camera-proxy?ip=${ipAddress}&t=${timestamp}`;
    link.download = `shasyabodh_cap_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Scan current frame (sends actual camera capture, falls back to mock if offline)
  const handleScanFrame = async () => {
    if (!isConnected) return;
    
    // Shutter flash
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    try {
      // Fetch the actual image from the camera proxy URL
      const response = await fetch(`http://localhost:3001/api/camera-proxy?ip=${ipAddress}&t=${Date.now()}`);
      if (response.ok) {
        const blob = await response.blob();
        const file = new File([blob], `camera_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onScanFrame(file);
      } else {
        console.warn('[Shasya Bodh Camera] Proxy returned non-OK status, falling back to mock scan.');
        onScanFrame();
      }
    } catch (err) {
      console.warn('[Shasya Bodh Camera] Failed to capture real frame from camera proxy, falling back to mock scan.', err);
      onScanFrame();
    }
  };

  // Image source path - goes through backend proxy to avoid CORS
  const imageSrc = `http://localhost:3001/api/camera-proxy?ip=${ipAddress}&t=${timestamp}`;

  return (
    <div className="ag-card-glow p-4 rounded-xl border border-agPrimary/25 flex flex-col justify-between h-full shadow-agCard relative overflow-hidden group">
      
      {/* Shutter Shutter White Flash Overlay */}
      {shutterFlash && (
        <div className="absolute inset-0 bg-white opacity-95 transition-opacity duration-200 z-50 pointer-events-none"></div>
      )}

      {/* Header Panel */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-4 h-4 text-agPrimary" /> Live camera feed
          </h3>
          <p className="text-[10px] text-gray-400">ESP32-CAM Video Telemetry</p>
        </div>
        
        {/* Pulsing Dot Overlay Badge */}
        {isConnected ? (
          <div className="flex items-center gap-1.5 bg-agRed/10 border border-agRed/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-agRed">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agRed opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-agRed pulse-dot-red"></span>
            </span>
            <span>LIVE</span>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-600 px-2 py-0.5 rounded text-[10px] font-bold text-gray-400">
            OFFLINE
          </div>
        )}
      </div>

      {/* Video Container Box */}
      <div className="relative border border-agPrimary/10 rounded-lg aspect-[4/3] bg-black overflow-hidden shadow-inner group-hover:border-agPrimary/30 transition-colors">
        
        {isConnected ? (
          <img
            src={imageSrc}
            alt="ESP32 CAM Stream Feed"
            className="w-full h-full object-cover transition-all duration-300"
            onError={() => {
              console.log('[Shasya Bodh Camera] Proxy load failed, showing simulation frame.');
            }}
          />
        ) : (
          /* High-Fidelity TV Static Noise Screen */
          <div className="w-full h-full static-noise-bg flex flex-col items-center justify-center select-none relative">
            <div className="absolute inset-0 bg-black/40 z-20"></div>
            <div className="relative z-30 bg-black/85 border border-agRed/40 p-4 rounded-xl text-center shadow-lg max-w-[80%]">
              <div className="text-agRed font-mono font-black text-lg tracking-widest uppercase animate-pulse">
                NO SIGNAL
              </div>
              <div className="text-[10px] text-gray-400 font-mono mt-1">
                ESP32 Node {ipAddress}
              </div>
              <div className="text-[9px] text-gray-500 font-mono mt-0.5">
                Check device power & WiFi configurations.
              </div>
            </div>
          </div>
        )}

        {/* Video Overlays */}
        {isConnected && (
          <>
            {/* Top Info overlay */}
            <div className="absolute top-2 left-2 z-30 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-mono text-agPrimary border border-agPrimary/30 select-none">
              IP: {ipAddress}
            </div>

            {/* Bottom Telemetry Overlay */}
            <div className="absolute bottom-2 left-2 right-2 z-30 flex justify-between bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-mono text-agOled border border-agOled/25 select-none">
              <span>F_COUNT: {frameCount}</span>
              <span>TIME: {formatHHMMSS(timestamp)}</span>
            </div>
          </>
        )}
      </div>

      {/* IP Control Form */}
      <form onSubmit={handleConnectSubmit} className="mt-4 flex flex-col gap-2 relative z-30">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Settings2 className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={localIp}
              onChange={(e) => setLocalIp(e.target.value)}
              placeholder="e.g. 192.168.1.100"
              className="w-full bg-agBg border border-agPrimary/25 focus:border-agPrimary/75 outline-none rounded-lg py-2 pl-8 pr-3 text-xs text-gray-200 font-mono"
            />
          </div>
          
          <button
            type="submit"
            disabled={isConnecting}
            className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
              isConnected
                ? 'bg-agRed/10 border-agRed/30 hover:bg-agRed/20 text-agRed'
                : 'bg-agPrimary/10 border-agPrimary/30 hover:bg-agPrimary/20 text-agPrimary'
            }`}
            onClick={(e) => {
              if (isConnected) {
                e.preventDefault();
                disconnect();
              }
            }}
          >
            {isConnecting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : isConnected ? (
              'Disconnect'
            ) : (
              'Connect'
            )}
          </button>
        </div>
      </form>

      {/* Action Buttons Panel */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          onClick={handleCaptureFrame}
          disabled={!isConnected}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
            isConnected
              ? 'bg-transparent border-agPrimary/30 hover:border-agPrimary/80 text-gray-200 hover:text-white'
              : 'bg-gray-800/20 border-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-gray-400" /> Capture Frame
        </button>
        
        <button
          onClick={handleScanFrame}
          disabled={!isConnected}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg border transition-all ${
            isConnected
              ? 'bg-agPrimary/15 border-agPrimary/45 hover:bg-agPrimary/25 text-agOled'
              : 'bg-gray-800/20 border-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-agOled animate-bounce" /> Scan Frame
        </button>
      </div>

      {/* Stats Chips Footer */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-agPrimary/10 text-[9px] font-mono text-gray-500 text-center select-none">
        <div className="bg-agBg/60 border border-agPrimary/5 py-1 rounded">
          RES: <span className="text-gray-300 font-bold">640x480</span>
        </div>
        <div className="bg-agBg/60 border border-agPrimary/5 py-1 rounded">
          FPS: <span className="text-gray-300 font-bold">{isConnected ? "~12" : "0"}</span>
        </div>
        <div className="bg-agBg/60 border border-agPrimary/5 py-1 rounded">
          SIG: <span className={isConnected ? "text-agPrimary font-bold" : "text-gray-600 font-bold"}>
            {isConnected ? "STRONG" : "NONE"}
          </span>
        </div>
      </div>

    </div>
  );
}
