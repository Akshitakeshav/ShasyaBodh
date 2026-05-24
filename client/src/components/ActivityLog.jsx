import React from 'react';
import { Terminal, Scroll, Play, RefreshCcw } from 'lucide-react';

/**
 * ActivityLog Component. Renders the auto-scrolling recent activity events
 * in a premium dark command console layout.
 */
export default function ActivityLog({ activities, onClearLogs }) {
  
  // Custom badge styling based on badge type
  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'ALERT':
        return 'bg-agRed/10 border-agRed/30 text-agRed font-extrabold';
      case 'WARN':
        return 'bg-agAmber/10 border-agAmber/30 text-agAmber font-bold';
      case 'INFO':
      default:
        return 'bg-agPrimary/10 border-agPrimary/25 text-agPrimary';
    }
  };

  return (
    <div className="ag-card-glow p-4 rounded-xl border border-agPrimary/25 shadow-agCard relative overflow-hidden group">
      
      {/* Glossy hacker console gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-agPrimary/[0.01] to-transparent pointer-events-none z-10"></div>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 border-b border-agPrimary/15 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-agPrimary" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              📋 Recent Activity Log
            </h3>
            <p className="text-[10px] text-gray-400">Real-time system diagnostics and telemetry audit trail</p>
          </div>
        </div>

        {/* Console Actions */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 bg-agBg/85 border border-agPrimary/10 px-2 py-1 rounded font-mono text-gray-400 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-agPrimary animate-ping"></span>
            LISTENING
          </span>
          <button 
            onClick={onClearLogs}
            className="bg-transparent border border-agPrimary/25 hover:border-agPrimary/60 active:bg-agPrimary/5 py-1 px-2.5 rounded font-bold text-gray-300 transition-colors"
          >
            Clear Console
          </button>
        </div>
      </div>

      {/* Event list terminal viewport */}
      <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 rounded-lg font-mono relative z-20">
        
        {activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500 font-sans">
            No events registered. Console is listening for ESP32 telemetry...
          </div>
        ) : (
          activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-start sm:items-center justify-between gap-3 p-2 bg-agBg/50 hover:bg-agBg border border-agPrimary/5 hover:border-agPrimary/15 rounded-lg text-xs leading-relaxed transition-all group/item"
            >
              <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                
                {/* Time Tag */}
                <span className="text-[10px] text-agPrimary/60 font-semibold bg-agBg border border-agPrimary/10 px-1.5 py-0.5 rounded flex-shrink-0 select-none">
                  {activity.timestamp}
                </span>

                {/* Log Icon */}
                <span className="text-sm flex-shrink-0 select-none filter drop-shadow">
                  {activity.icon}
                </span>

                {/* Message Body */}
                <span className="text-gray-300 truncate font-mono tracking-tight pr-2">
                  {activity.message}
                </span>

              </div>

              {/* Status Badge */}
              <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 border rounded-md flex-shrink-0 select-none font-sans font-bold ${getBadgeStyle(activity.badge)}`}>
                {activity.badge}
              </span>

            </div>
          ))
        )}
      </div>

      {/* Terminal Footer Info */}
      <div className="mt-3 flex justify-between items-center text-[8px] text-gray-600 select-none font-mono">
        <span>BAUD RATE: 115200</span>
        <span>AUDIT TRAIL SECURE</span>
      </div>

    </div>
  );
}
