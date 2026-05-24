import React from 'react';
import logo from '../assets/logo.svg';
import { formatHHMMSS } from '../utils/formatTime';
import { Settings, Cpu, RefreshCw } from 'lucide-react';

/**
 * Navbar component for the Shasya Bodh dashboard.
 * Houses branding, active sync states, and triggers for IP configuration.
 */
export default function Navbar({ isConnected, isConnecting, lastSynced, ipAddress, onOpenModal }) {
  return (
    <nav className="border-b border-agPrimary/20 bg-agCard/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Branding & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-agBg border border-agPrimary/30 rounded-lg p-1.5 shadow-agCard relative overflow-hidden group">
            <div className="absolute inset-0 bg-agPrimary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <img src={logo} alt="Shasya Bodh Logo" className="w-full h-full relative z-10 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Shasya Bodh</span>
              <span className="text-xs bg-agPrimary/10 border border-agPrimary/30 text-agPrimary px-2 py-0.5 rounded-full font-semibold">
                IoT Panel
              </span>
            </div>
            <p className="text-xs text-agPrimary/75 font-medium tracking-wide">शस्य बोध • Smart Agro Tech</p>
          </div>
        </div>

        {/* ESP32 Camera Telemetry Sync & Status */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          
          {/* Last Sync Indicator */}
          <div className="flex items-center gap-2 bg-agBg/85 border border-agPrimary/10 rounded-lg px-3 py-1.5 text-xs text-gray-400">
            <RefreshCw className="w-3.5 h-3.5 text-agPrimary animate-spin" style={{ animationDuration: '6s' }} />
            <span>Last Synced:</span>
            <span className="font-mono text-agPrimary font-semibold">
              {formatHHMMSS(lastSynced)}
            </span>
          </div>

          {/* Connection Dot Widget */}
          <button 
            onClick={onOpenModal}
            className="flex items-center gap-2 bg-agBg border border-agPrimary/20 rounded-lg px-3 py-1.5 hover:border-agPrimary/50 active:bg-agPrimary/5 transition-all text-xs font-semibold"
            title="Configure ESP32 Connection"
          >
            <div className="relative flex h-2.5 w-2.5">
              {isConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agPrimary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-agPrimary pulse-dot-green"></span>
                </>
              ) : isConnecting ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agAmber opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-agAmber"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-600"></span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline text-gray-300">ESP32-CAM:</span>
              <span className={isConnected ? "text-agPrimary font-bold" : isConnecting ? "text-agAmber font-semibold animate-pulse" : "text-gray-500 font-semibold"}>
                {isConnected ? `CONNECTED (${ipAddress})` : isConnecting ? "CONNECTING..." : "OFFLINE"}
              </span>
            </div>
            <Settings className="w-3.5 h-3.5 text-agPrimary ml-1" />
          </button>
          
        </div>

      </div>
    </nav>
  );
}
