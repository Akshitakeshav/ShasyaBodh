import React from 'react';
import { Cpu, Clock, ScanEye, AlertTriangle } from 'lucide-react';

/**
 * Hero Status Bar displaying high-level system telemetry cards.
 */
export default function StatusBar({ online, uptime, detections, alerts }) {
  const stats = [
    {
      id: 'device',
      title: 'Device Status',
      value: online ? 'ONLINE' : 'OFFLINE',
      icon: Cpu,
      color: online ? 'text-agPrimary' : 'text-gray-500',
      bgColor: online ? 'bg-agPrimary/10' : 'bg-gray-500/10',
      borderColor: online ? 'border-agPrimary/25' : 'border-gray-500/25',
      desc: 'ESP32 IoT Node Active'
    },
    {
      id: 'uptime',
      title: 'System Uptime',
      value: uptime || '0h 0m',
      icon: Clock,
      color: 'text-agPrimary',
      bgColor: 'bg-agPrimary/10',
      borderColor: 'border-agPrimary/25',
      desc: 'Time since bootstrap'
    },
    {
      id: 'detections',
      title: 'Scans Today',
      value: detections !== undefined ? detections : 0,
      icon: ScanEye,
      color: 'text-agAmber',
      bgColor: 'bg-agAmber/10',
      borderColor: 'border-agAmber/25',
      desc: 'Disease detections processed'
    },
    {
      id: 'alerts',
      title: 'Active Alerts',
      value: alerts !== undefined ? alerts : 0,
      icon: AlertTriangle,
      color: alerts > 0 ? 'text-agRed animate-pulse' : 'text-agPrimary',
      bgColor: alerts > 0 ? 'bg-agRed/10' : 'bg-agPrimary/10',
      borderColor: alerts > 0 ? 'border-agRed/30' : 'border-agPrimary/25',
      desc: alerts > 0 ? 'Urgent notifications' : 'All parameters normal'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className={`ag-card-glow p-4 rounded-xl flex items-center justify-between gap-3 border ${stat.borderColor}`}
          >
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {stat.title}
              </span>
              <span className={`block text-xl sm:text-2xl font-bold tracking-tight mt-1 font-sans ${stat.color}`}>
                {stat.value}
              </span>
              <span className="block text-[10px] text-gray-500 truncate mt-0.5">
                {stat.desc}
              </span>
            </div>
            
            <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
