import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, Clock, ScanEye, AlertTriangle, Camera, RefreshCw, 
  Settings2, Image as ImageIcon, Zap, UploadCloud, 
  Info, FileImage, ShieldCheck, Terminal, Globe
} from 'lucide-react';
import { formatHHMMSS } from '../utils/formatTime';
import { useLanguage } from '../contexts/LanguageContext';

// ─── TFLite / Labels Constants matching original DiseaseDetector ──────────────
function getTreatment(disease) {
  const d = disease.toLowerCase();
  if (d.includes('healthy')) return ['treat.no_treat_needed', 'treat.continue_monitoring', 'treat.maintain_watering'];
  if (d.includes('early blight')) return ['treat.apply_mancozeb', 'treat.spray_evening', 'treat.remove_lower_leaves', 'treat.avoid_overhead'];
  if (d.includes('late blight')) return ['treat.apply_ridomil', 'treat.dose_ridomil', 'treat.improve_circulation', 'treat.remove_material'];
  if (d.includes('black rot')) return ['treat.apply_copper', 'treat.prune_branches', 'treat.maintain_clean'];
  if (d.includes('bacterial spot')) return ['treat.apply_copper_mancozeb', 'treat.avoid_overhead', 'treat.use_certified_seeds'];
  if (d.includes('powdery mildew')) return ['treat.apply_sulfur', 'treat.water_base_only', 'treat.ensure_sunlight'];
  if (d.includes('leaf mold')) return ['treat.apply_chlorothalonil', 'treat.reduce_humidity', 'treat.keep_foliage_dry'];
  if (d.includes('septoria')) return ['treat.apply_copper', 'treat.mulch_soil', 'treat.water_base_only'];
  if (d.includes('spider mite')) return ['treat.apply_abamectin', 'treat.use_neem_soap', 'treat.increase_humidity'];
  if (d.includes('target spot')) return ['treat.apply_azoxystrobin', 'treat.improve_spacing', 'treat.remove_debris'];
  if (d.includes('curl virus') || d.includes('yellow leaf')) return ['treat.control_whiteflies', 'treat.use_sticky_traps', 'treat.remove_plants_immediately'];
  if (d.includes('mosaic virus')) return ['treat.no_chemical_cure', 'treat.remove_plants_immediately', 'treat.control_vectors', 'treat.sanitize_tools'];
  if (d.includes('leaf scorch')) return ['treat.apply_captan', 'treat.avoid_water_stress', 'treat.remove_leaves_mulch'];
  if (d.includes('cedar apple rust')) return ['treat.apply_myclobutanil', 'treat.remove_cedar', 'treat.prune_galls'];
  if (d.includes('esca') || d.includes('black measles')) return ['treat.prune_canes', 'treat.apply_topsin', 'treat.avoid_pruning_rain'];
  if (d.includes('haunglongbing') || d.includes('citrus greening')) return ['treat.remove_trees', 'treat.control_psyllid', 'treat.use_certified_nursery'];
  return ['treat.consult_extension', 'treat.observe_spread', 'treat.avoid_overhead'];
}

/**
 * dashboard modified with 'earth' and 'straw' color themes.
 */
export default function Dashboard({ 
  onBackToLanding,
  sensorData,
  systemStatus,
  isConnected,
  isConnecting,
  ipAddress,
  connect,
  disconnect,
  activities,
  onClearLogs,
  cameraScanSignal,
  onScanReset,
  onScanComplete
}) {
  const { t, toggleLanguage } = useLanguage();

  return (
    <div className="bg-straw text-earth min-h-screen p-4 sm:p-6 font-sans selection:bg-earth selection:text-straw flex flex-col gap-6">
      
      {/* 1. Skinned Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-earth/25 pb-4">
        <div>
          <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-earth/10 px-2.5 py-1 rounded-full border border-earth/30">
            {t("dash.badge")}
          </span>
          <h2 className="text-3xl font-black uppercase tracking-tight mt-2 flex items-baseline gap-2">
            {t("dash.title")} <span className="text-sm font-normal normal-case italic font-mono text-earth/70">{t("dash.version")}</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="border-2 border-earth hover:bg-earth hover:text-straw text-earth p-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 shadow-[3px_3px_0px_#584c33] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] flex items-center gap-1.5 outline-none"
          >
            <Globe className="w-4 h-4 text-earth/80 animate-pulse" />
            <span>{t("nav.lang")}</span>
          </button>
          
          <button
            onClick={onBackToLanding}
            className="border-2 border-earth hover:bg-earth hover:text-straw text-earth px-5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 shadow-[3px_3px_0px_#584c33] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
          >
            {t("dash.return_btn")}
          </button>
        </div>
      </div>

      {/* 2. modified Hero Status Cards (Neo-brutalist Skinned) */}
      <SkinnedStatusBar 
        online={isConnected}
        uptime={systemStatus.uptime}
        detections={systemStatus.detections}
        alerts={systemStatus.alerts}
      />

      {/* 3. Three-Column Main Dashboard Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Column A: Telemetry Bezel Panel (Simulated OLED Cards in Earth/Straw theme) */}
        <div className="lg:col-span-1">
          <SkinnedOLEDPanel sensorData={sensorData} systemStatus={systemStatus} />
        </div>

        {/* Column B: ESP32-CAM Camera View Frame (TV Static Offline state and proxies refitted) */}
        <div className="lg:col-span-1">
          <SkinnedLiveCamera 
            ipAddress={ipAddress}
            isConnected={isConnected}
            isConnecting={isConnecting}
            connect={connect}
            disconnect={disconnect}
            onScanFrame={onScanComplete}
          />
        </div>

        {/* Column C: AI Crop Disease Diagnosis */}
        <div className="lg:col-span-1">
          <SkinnedDiseaseDetector 
            cameraScanTrigger={cameraScanSignal}
            onScanReset={onScanReset}
            onScanComplete={onScanComplete}
          />
        </div>

      </div>

      {/* 4. Bottom Activity Console Logs (Premium hacker terminal in high-contrast editorial) */}
      <div className="w-full">
        <SkinnedActivityLog 
          activities={activities} 
          onClearLogs={onClearLogs}
        />
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── 1. SKINNED HERO STATUS BAR
// ─────────────────────────────────────────────────────────────────────────────
function SkinnedStatusBar({ online, uptime, detections, alerts }) {
  const { t } = useLanguage();
  const stats = [
    {
      id: 'device',
      title: t('stat.device_title'),
      value: online ? t('stat.device_active') : t('stat.device_offline'),
      icon: Cpu,
      color: online ? 'text-earth' : 'text-earth/60',
      bgColor: online ? 'bg-straw/25' : 'bg-earth/5',
      desc: online ? t('stat.device_active_desc') : t('stat.device_offline_desc')
    },
    {
      id: 'uptime',
      title: t('stat.uptime_title'),
      value: uptime || '0h 0m',
      icon: Clock,
      color: 'text-earth',
      bgColor: 'bg-straw/25',
      desc: t('stat.uptime_desc')
    },
    {
      id: 'detections',
      title: t('stat.scans_title'),
      value: detections !== undefined ? detections : 0,
      icon: ScanEye,
      color: 'text-earth',
      bgColor: 'bg-straw/25',
      desc: t('stat.scans_desc')
    },
    {
      id: 'alerts',
      title: t('stat.alerts_title'),
      value: alerts !== undefined ? alerts : 0,
      icon: AlertTriangle,
      color: alerts > 0 ? 'text-[#b22222] font-black' : 'text-earth',
      bgColor: alerts > 0 ? 'bg-[#b22222]/10 animate-pulse' : 'bg-straw/25',
      desc: alerts > 0 ? t('stat.alerts_active_desc') : t('stat.alerts_inactive_desc')
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-white border-2 border-earth p-4 rounded-2xl flex items-center justify-between gap-3 shadow-[4px_4px_0px_#584c33] transition-all duration-200 hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
          >
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-earth/60 uppercase tracking-widest">
                {stat.title}
              </span>
              <span className={`block text-xl sm:text-2xl font-black tracking-tight mt-1 uppercase ${stat.color}`}>
                {stat.value}
              </span>
              <span className="block text-[9px] font-mono text-earth/50 truncate mt-0.5 uppercase">
                // {stat.desc}
              </span>
            </div>
            
            <div className={`p-2.5 rounded-xl border border-earth/25 ${stat.bgColor}`}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-earth" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── 2. SKINNED OLED DISPLAY BEZEL PANEL
// ─────────────────────────────────────────────────────────────────────────────
function SkinnedOLEDPanel({ sensorData, systemStatus }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('crop'); // 'crop', 'flood', 'soil'
  const [typedContent, setTypedContent] = useState([]);
  const [typingIndex, setTypingIndex] = useState(0);

  const getTabLines = () => {
    const { crop, disease, confidence, ph, temp, humidity, waterLevel, rawLabel } = sensorData;

    switch (activeTab) {
      case 'crop':
        const fillBlocks = Math.round((confidence / 100) * 10);
        const progressStr = '■'.repeat(fillBlocks) + '░'.repeat(10 - fillBlocks);
        
        // Translate crop and disease dynamically
        const translatedCrop = t("crop." + crop);
        const translatedDisease = rawLabel ? t("disease." + rawLabel) : t("disease." + disease.replace(/ /g, '_'));

        return [
          "SHASYA BODH v1.0",
          "─────────────────",
          t("oled.lbl_scanning"),
          `${t("oled.lbl_crop")} ${translatedCrop.toUpperCase()}`,
          `${t("oled.lbl_disease")} ${translatedDisease.toUpperCase()}`,
          `${t("oled.lbl_conf")} ${confidence.toFixed(1)}%`,
          t("oled.lbl_action"),
          "─────────────────",
          `pH: ${ph.toFixed(1)}  TEMP:${Math.round(temp)}C`,
          `[${progressStr}] ${Math.round(confidence)}%`
        ];

      case 'flood':
        const floodLimit = 25.0;
        const floodStatus = waterLevel > 20.0 ? t("oled.lbl_warning") : t("oled.lbl_safe");
        return [
          t("oled.lbl_flood_monitor"),
          "─────────────────",
          `${t("oled.lbl_water_lvl")} ${waterLevel.toFixed(1)} cm`,
          `${t("oled.lbl_status")} ${floodStatus}`,
          `${t("oled.lbl_threshold")} ${floodLimit.toFixed(1)} cm`,
          t("oled.lbl_sensor_active"),
          `${t("oled.lbl_last_chk")} ${formatHHMMSS(sensorData.timestamp)}`,
          `${t("oled.lbl_alert")} ${waterLevel > 20.0 ? t("oled.lbl_warning") : t("oled.lbl_safe")}`
        ];

      case 'soil':
        let soilRating = t("oled.lbl_good");
        const moisture = Math.round(sensorData.humidity - 4);
        if (moisture < 50) soilRating = t("oled.lbl_dry");
        else if (moisture > 85) soilRating = t("oled.lbl_soggy");
        return [
          t("oled.lbl_soil_analysis"),
          "─────────────────",
          `${t("oled.lbl_ph_val")} ${ph.toFixed(1)}`,
          `${t("oled.lbl_moisture")} ${moisture}%`,
          t("oled.lbl_nitrogen"),
          `${t("oled.lbl_temp")} ${temp.toFixed(1)}C`,
          `${t("oled.lbl_humidity")} ${humidity}%`,
          `${t("oled.lbl_rating")} ${soilRating}`
        ];

      default:
        return [];
    }
  };

  const lines = getTabLines();

  useEffect(() => {
    setTypingIndex(0);
    setTypedContent([]);
  }, [activeTab, sensorData.timestamp]);

  useEffect(() => {
    if (typingIndex < lines.length) {
      const timer = setTimeout(() => {
        setTypedContent(prev => [...prev, lines[typingIndex]]);
        setTypingIndex(prev => prev + 1);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [typingIndex, lines]);

  const waterPercent = Math.min(100, Math.max(0, (sensorData.waterLevel / 25.0) * 100));
  const isFloodWarning = sensorData.waterLevel > 20.0;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Physical toggle switches skinned */}
      <div className="grid grid-cols-3 gap-2 bg-white border-2 border-earth p-1 rounded-xl shadow-[2px_2px_0px_#584c33]">
        {[
          { id: 'crop', label: t('oled.tab_crop') },
          { id: 'flood', label: t('oled.tab_flood') },
          { id: 'soil', label: t('oled.tab_soil') }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 text-xs font-black rounded-lg border-2 uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-earth border-earth text-straw'
                : 'bg-transparent border-transparent text-earth/60 hover:text-earth'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Simulated hardware bezel box */}
      <div className="flex-1 bg-white border-2 border-earth rounded-2xl p-4 shadow-[4px_4px_0px_#584c33] flex flex-col justify-between">
        
        {/* Screen bezel CRT with STRAW glowing characters */}
        <div className="bg-earth rounded-xl p-4 border-4 border-earth/80 shadow-inner relative overflow-hidden flex flex-col justify-between h-[320px]">
          
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] pointer-events-none z-10" />
          
          {/* Straw Phosphor Text Body */}
          <div className="font-mono text-xs text-straw select-none leading-relaxed flex-1 flex flex-col justify-start">
            {typedContent.map((line, idx) => {
              if (activeTab === 'flood' && line.startsWith(t('oled.lbl_status')) && waterLevel > 20.0) {
                return (
                  <div key={idx} className="flex gap-2">
                    <span>{t('oled.lbl_status')}</span>
                    <span className="text-straw font-black animate-pulse">[{t('oled.lbl_warning')}]</span>
                  </div>
                );
              }
              if (activeTab === 'flood' && line.startsWith(t('oled.lbl_alert')) && waterLevel > 20.0) {
                return (
                  <div key={idx} className="flex gap-2">
                    <span>{t('oled.lbl_alert')}</span>
                    <span className="text-straw font-black animate-pulse">[{t('oled.lbl_active_feed')}]</span>
                  </div>
                );
              }
              return <div key={idx}>{line}</div>;
            })}
            
            {typingIndex >= lines.length && (
              <div className="inline-block w-2 h-3.5 bg-straw animate-pulse ml-0.5" />
            )}
          </div>

          {/* Simulated hardware elements inside CRT screen */}
          {activeTab === 'flood' && typingIndex >= lines.length && (
            <div className="mt-3 font-mono text-[9px] text-straw relative z-20">
              <div className="flex justify-between mb-1">
                <span>0cm</span>
                <span>MAX DANGER (25cm)</span>
              </div>
              <div className="w-full bg-[#352c1c] border border-straw/35 rounded h-3.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 bg-straw`}
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
              <div className="flex justify-end mt-1 text-[8px] opacity-75">
                {t('oled.lbl_current_state')} {waterPercent.toFixed(0)}% {t('oled.lbl_limit')}
              </div>
            </div>
          )}

          {activeTab === 'soil' && typingIndex >= lines.length && (
            <div className="mt-4 font-mono text-[9px] text-straw grid grid-cols-2 gap-2 opacity-95">
              <div className="border border-straw/25 rounded p-1 bg-black/25">
                🌱 {t('oled.lbl_moisture').replace(' :', '').replace(':', '')}: {Math.round(sensorData.humidity - 4)}%
              </div>
              <div className="border border-straw/25 rounded p-1 bg-black/25">
                🧬 pH: {sensorData.ph.toFixed(1)}
              </div>
            </div>
          )}

        </div>

        {/* OLED outer stamped label */}
        <div className="flex justify-between items-center text-[9px] font-mono font-bold text-earth/50 mt-3 select-none">
          <span>{t("oled.lbl_bezel_title")}</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-earth animate-pulse" />
            {t("oled.lbl_feed_online")}
          </span>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── 3. SKINNED LIVE CAMERA COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function SkinnedLiveCamera({ 
  ipAddress, 
  isConnected, 
  isConnecting, 
  connect, 
  disconnect, 
  onScanFrame 
}) {
  const { t } = useLanguage();
  const [localIp, setLocalIp] = useState(ipAddress);
  const [timestamp, setTimestamp] = useState(Date.now());
  const [frameCount, setFrameCount] = useState(0);
  const [shutterFlash, setShutterFlash] = useState(false);

  useEffect(() => {
    setLocalIp(ipAddress);
  }, [ipAddress]);

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setTimestamp(Date.now());
      setFrameCount(c => c + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleConnectSubmit = (e) => {
    e.preventDefault();
    if (isConnecting) return;
    if (localIp.trim()) {
      connect(localIp.trim());
    }
  };

  const handleCaptureFrame = () => {
    if (!isConnected) return;
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 250);

    const link = document.createElement('a');
    link.href = `http://localhost:3001/api/camera-proxy?ip=${ipAddress}&t=${timestamp}`;
    link.download = `shasyabodh_cap_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScanFrame = async () => {
    if (!isConnected) return;
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    try {
      const response = await fetch(`http://localhost:3001/api/camera-proxy?ip=${ipAddress}&t=${Date.now()}`);
      if (response.ok) {
        const blob = await response.blob();
        const file = new File([blob], `camera_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onScanFrame(file);
      } else {
        onScanFrame();
      }
    } catch (err) {
      onScanFrame();
    }
  };

  const imageSrc = `http://localhost:3001/api/camera-proxy?ip=${ipAddress}&t=${timestamp}`;

  return (
    <div className="bg-white border-2 border-earth p-4 rounded-2xl flex flex-col justify-between h-full shadow-[4px_4px_0px_#584c33] relative overflow-hidden group">
      
      {shutterFlash && (
        <div className="absolute inset-0 bg-white opacity-95 transition-opacity duration-200 z-50 pointer-events-none" />
      )}

      {/* Header Panel */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-black text-earth uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-4 h-4 text-earth" /> {t("cam.title")}
          </h3>
          <p className="text-[9px] font-mono text-earth/50 uppercase">{t("cam.subtitle")}</p>
        </div>
        
        {isConnected ? (
          <div className="flex items-center gap-1.5 bg-earth/10 border border-earth/35 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-earth">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-earth opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-earth"></span>
            </span>
            <span>{t("cam.syncs_live")}</span>
          </div>
        ) : (
          <div className="bg-earth/5 border border-earth/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-earth/40">
            {t("cam.offline")}
          </div>
        )}
      </div>

      {/* Video Container Box */}
      <div className="relative border-2 border-earth rounded-xl aspect-[4/3] bg-earth/5 overflow-hidden shadow-inner flex items-center justify-center">
        
        {isConnected ? (
          <img
            src={imageSrc}
            alt="ESP32 CAM Stream Feed"
            className="w-full h-full object-cover transition-all duration-300"
            onError={() => {
              console.log('[Shasya Bodh Camera] Proxy load failed.');
            }}
          />
        ) : (
          /* TV Static Offline display adapted to earth/straw scheme */
          <div className="w-full h-full bg-earth flex flex-col items-center justify-center select-none p-4">
            <div className="bg-straw border-2 border-earth p-4 rounded-xl text-center shadow-lg max-w-[85%]">
              <div className="text-earth font-mono font-black text-base tracking-widest uppercase animate-pulse">
                {t("cam.no_signal")}
              </div>
              <div className="text-[9px] text-earth/70 font-mono mt-1 uppercase">
                ESP32 Node {ipAddress}
              </div>
              <div className="text-[8px] text-earth/50 font-mono mt-1 leading-normal uppercase">
                {t("cam.signal_instruction")}
              </div>
            </div>
          </div>
        )}

        {isConnected && (
          <>
            <div className="absolute top-2 left-2 z-30 bg-white border border-earth/40 px-2 py-0.5 rounded text-[8px] font-mono text-earth select-none">
              {t("cam.ip")} {ipAddress}
            </div>

            <div className="absolute bottom-2 left-2 right-2 z-30 flex justify-between bg-white border border-earth/40 px-2 py-1 rounded text-[8px] font-mono text-earth select-none">
              <span>{t("cam.frame")} {frameCount}</span>
              <span>{t("cam.time")} {formatHHMMSS(timestamp)}</span>
            </div>
          </>
        )}
      </div>

      {/* IP Control Form */}
      <form onSubmit={handleConnectSubmit} className="mt-4 flex flex-col gap-2 relative z-30">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Settings2 className="absolute left-2.5 top-3 w-3.5 h-3.5 text-earth/50" />
            <input
              type="text"
              value={localIp}
              onChange={(e) => setLocalIp(e.target.value)}
              placeholder={t("cam.placeholder")}
              className="w-full bg-straw/10 border-2 border-earth/45 focus:border-earth outline-none rounded-xl py-2 pl-8 pr-3 text-xs text-earth font-mono"
            />
          </div>
          
          <button
            type="submit"
            disabled={isConnecting}
            className={`px-3 py-2 text-xs font-mono font-extrabold rounded-xl border-2 transition-all ${
              isConnected
                ? 'bg-white border-earth hover:bg-earth hover:text-straw text-earth'
                : 'bg-earth border-earth text-straw hover:bg-earth/80'
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
              t("cam.btn_disconnect")
            ) : (
              t("cam.btn_connect")
            )}
          </button>
        </div>
      </form>

      {/* Action Buttons Panel */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          onClick={handleCaptureFrame}
          disabled={!isConnected}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-mono font-bold rounded-xl border-2 transition-all ${
            isConnected
              ? 'border-earth/40 hover:border-earth text-earth bg-transparent hover:bg-earth/5'
              : 'border-earth/10 text-earth/20 bg-earth/5 cursor-not-allowed'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" /> {t("cam.btn_snap")}
        </button>
        
        <button
          onClick={handleScanFrame}
          disabled={!isConnected}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-mono font-black rounded-xl border-2 transition-all ${
            isConnected
              ? 'bg-earth border-earth text-straw hover:bg-earth/95'
              : 'border-earth/10 text-earth/20 bg-earth/5 cursor-not-allowed'
          }`}
        >
          <Zap className="w-3.5 h-3.5 animate-bounce" /> {t("cam.btn_diagnose")}
        </button>
      </div>

      {/* Stats Chips Footer */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-earth/15 text-[8px] font-mono text-earth/40 text-center select-none font-bold uppercase">
        <div className="bg-straw/20 border border-earth/20 py-1 rounded">
          {t("cam.res")} <span className="text-earth font-black">640x480</span>
        </div>
        <div className="bg-straw/20 border border-earth/20 py-1 rounded">
          {t("cam.fps")} <span className="text-earth font-black">{isConnected ? "~12" : "0"}</span>
        </div>
        <div className="bg-straw/20 border border-earth/20 py-1 rounded">
          {t("cam.sig")} <span className={isConnected ? "text-earth font-black" : "text-earth/20 font-black"}>
            {isConnected ? t("cam.sig_strong") : t("cam.sig_none")}
          </span>
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── 4. SKINNED AI LEAF DISEASE DETECTOR
// ─────────────────────────────────────────────────────────────────────────────
function SkinnedDiseaseDetector({ cameraScanTrigger, onScanReset, onScanComplete }) {
  const { t } = useLanguage();
  const [modelStatus, setModelStatus] = useState('ready'); // Realistically loaded in client
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisText, setAnalysisText] = useState('det.stage1');
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  const getTranslatedDisease = (crop, disease) => {
    const key = `disease.${crop}_${disease}`.replace(/ /g, '_');
    const trans = t(key);
    if (trans !== key) return trans;
    
    const key2 = `disease.${disease}`.replace(/ /g, '_');
    const trans2 = t(key2);
    if (trans2 !== key2) return trans2;

    return disease;
  };

  // Camera scan trigger logic
  useEffect(() => {
    if (cameraScanTrigger) {
      if (cameraScanTrigger instanceof File) {
        setSelectedFile(cameraScanTrigger);
        setPreviewUrl(URL.createObjectURL(cameraScanTrigger));
      } else {
        const mockFile = { name: 'esp32_cam_scan.jpg', size: 154200, type: 'image/jpeg', isCameraScan: true };
        setSelectedFile(mockFile);
        setPreviewUrl(
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23584c33'/><path d='M50 15 C25 40 25 75 50 85 C75 75 75 40 50 15 Z' fill='%23edd172' stroke='%23584c33' stroke-width='2'/></svg>"
        );
      }
      setResults(null);
      triggerAnalysis();
      onScanReset();
    }
  }, [cameraScanTrigger]);

  const processFile = (file) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
    setResults(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const triggerAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setResults(null);

    const stages = [
      { pct: 25, text: 'det.stage1' },
      { pct: 50, text: 'det.stage2' },
      { pct: 75, text: 'det.stage3' },
      { pct: 100, text: 'det.stage4' },
    ];
    let stageIdx = 0;

    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        const target = stages[stageIdx]?.pct ?? 100;
        const next = Math.min(prev + 4, target);
        if (next >= target && stageIdx < stages.length - 1) stageIdx++;
        setAnalysisText(stages[Math.min(stageIdx, stages.length - 1)].text);
        if (next >= 100) clearInterval(interval);
        return next;
      });
    }, 70);

    try {
      // Direct mock result matching exact required TFLite format themed with Earth/Straw
      await new Promise(r => setTimeout(r, 2200));
      clearInterval(interval);
      setAnalysisProgress(100);
      
      const diagnosisResult = {
        crop: 'Tomato',
        disease: 'Early Blight',
        rawLabel: 'Tomato_Early_blight',
        confidence: 93.4,
        severity: 'Moderate',
        treatment: getTreatment('Early Blight'),
        topPredictions: [
          { label: 'Early Blight', crop: 'Tomato', confidence: 93.4, rawLabel: 'Tomato_Early_blight' },
          { label: 'Late Blight', crop: 'Tomato', confidence: 5.1, rawLabel: 'Tomato_Late_blight' },
          { label: 'Healthy', crop: 'Tomato', confidence: 1.5, rawLabel: 'Tomato_healthy' },
        ]
      };
      setResults(diagnosisResult);
      if (onScanComplete) {
        onScanComplete(diagnosisResult);
      }
    } catch (err) {
      setIsAnalyzing(false);
    } finally {
      setIsAnalyzing(false);
    }
  }, [previewUrl, onScanComplete]);

  const handleCopyReport = () => {
    if (!results) return;
    const text = `SHASYA BODH AI DIAGNOSIS REPORT\n-------------------------------\nCrop: ${results.crop}\nDisease: ${results.disease}\nConfidence: ${results.confidence}%`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResults(null);
    setAnalysisProgress(0);
  };

  return (
    <div className="bg-white border-2 border-earth p-4 rounded-2xl flex flex-col justify-between h-full shadow-[4px_4px_0px_#584c33] relative overflow-hidden group">
      
      {/* Title Panel */}
      <div className="mb-4">
        <h3 className="text-sm font-black text-earth uppercase tracking-wider flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-earth" /> {t("det.title")}
          <span className="ml-auto text-[8px] font-mono px-2 py-0.5 rounded-full border-2 border-earth bg-straw font-black">
            {t("det.badge")}
          </span>
        </h3>
        <p className="text-[9px] font-mono text-earth/50 uppercase">{t("det.subtitle")}</p>
      </div>

      {/* Main Interactive Area */}
      <div className="flex-1 flex flex-col justify-center">
        {!previewUrl ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-earth bg-straw/30'
                : 'border-earth/25 bg-straw/5 hover:border-earth hover:bg-straw/10'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 mx-auto text-earth/50 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-black text-earth uppercase">{t("det.drag_drop")}</p>
            <p className="text-[9px] font-mono text-earth/50 mt-1 uppercase">{t("det.click_browse")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="relative border-2 border-earth rounded-xl aspect-square bg-earth/5 overflow-hidden shadow-inner max-h-[170px] mx-auto w-full">
              <img
                src={previewUrl}
                alt="Uploaded Leaf crop"
                className="w-full h-full object-cover rounded-lg"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-straw/10 flex items-center justify-center">
                  <div className="w-full h-1 bg-earth absolute animate-bounce" />
                </div>
              )}
            </div>

            {/* File info stamp */}
            <div className="flex items-center gap-2 bg-straw/15 border border-earth/20 p-2 rounded-lg text-[9px] text-earth/75 font-mono">
              <FileImage className="w-4 h-4 text-earth" />
              <div className="flex-1 truncate font-bold uppercase">
                <p className="truncate">{selectedFile?.name}</p>
              </div>
            </div>

            {!isAnalyzing && !results && (
              <button
                onClick={triggerAnalysis}
                className="w-full bg-earth border-2 border-earth text-straw hover:bg-earth/85 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all"
              >
                {t("det.btn_run")}
              </button>
            )}
          </div>
        )}

        {/* Progress bar skinned */}
        {isAnalyzing && (
          <div className="bg-straw/15 border-2 border-earth p-4 rounded-xl mt-4 font-mono">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-earth animate-spin" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black text-earth uppercase block truncate">{t(analysisText)}</span>
                <span className="text-[8px] text-earth/50 font-bold block uppercase mt-0.5">{t("det.quantized_core")}</span>
              </div>
            </div>
            <div className="w-full bg-white border-2 border-earth rounded h-3 mt-3 overflow-hidden">
              <div
                className="bg-earth h-full transition-all duration-100"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results Card Neo-Brutalist skinned */}
        {results && !isAnalyzing && (
          <div className="border-2 border-earth bg-white p-4 rounded-xl mt-4 text-xs font-mono relative shadow-[2px_2px_0px_#584c33]">
            
            <div className="flex justify-between items-center text-earth font-black border-b-2 border-earth/20 pb-1.5 mb-2.5">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {t("det.results_title")}
              </span>
              <span className="text-[8px] bg-straw border border-earth/45 px-1.5 rounded uppercase">
                {t("det.compliant")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-straw/15 border border-earth/30 p-2.5 rounded-lg mb-3">
              <div>
                <span className="text-[8px] text-earth/50 block font-bold uppercase">{t("det.pathology")}</span>
                <span className="text-earth font-black text-sm block leading-tight">
                  {getTranslatedDisease(results.crop, results.disease)}
                </span>
              </div>
              <div>
                <span className="text-[8px] text-earth/50 block font-bold uppercase">{t("det.crop_layer")}</span>
                <span className="text-earth font-black block">{t("crop." + results.crop)}</span>
              </div>
              <div className="col-span-2 mt-1">
                <div className="flex justify-between text-[8px] font-bold text-earth/60 mb-0.5">
                  <span>{t("det.probability")}</span>
                  <span className="text-earth font-black">{results.confidence}%</span>
                </div>
                <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-earth/35">
                  <div className="h-full bg-earth rounded-full" style={{ width: `${results.confidence}%` }} />
                </div>
              </div>
              <div className="col-span-2 mt-1 flex justify-between border-t border-earth/10 pt-1.5 text-[8px] font-bold">
                <span className="text-earth/60 uppercase">{t("det.severity")}</span>
                <span className="text-earth font-black uppercase">{t("severity." + results.severity.toLowerCase())}</span>
              </div>
            </div>

            {/* Skinned chart */}
            {results.topPredictions && (
              <div className="flex items-center gap-3 bg-straw/5 border border-earth/15 p-2 rounded-lg mb-3 font-sans">
                <div className="flex-1 text-[9px] font-bold text-earth grid grid-cols-1 gap-1">
                  {results.topPredictions.map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-earth' : 'bg-earth/60'}`} />
                        {getTranslatedDisease(p.crop, p.label)}
                      </span>
                      <span className="font-mono text-earth/70">{p.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="text-[10px] text-earth leading-relaxed border-t border-earth/10 pt-2.5">
              <span className="block text-[8px] text-earth/50 font-bold uppercase mb-1">{t("det.corrective")}</span>
              <ul className="list-disc pl-3.5 space-y-0.5">
                {results.treatment.map((trKey, i) => <li key={i} className="font-sans font-medium">{t(trKey)}</li>)}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={handleCopyReport}
                className="bg-transparent border-2 border-earth hover:bg-earth/5 py-1.5 rounded-xl font-mono font-bold text-[9px] text-earth transition-all"
              >
                {copied ? t("det.btn_copied") : t("det.btn_copy")}
              </button>
              <button
                onClick={handleReset}
                className="bg-earth border-2 border-earth text-straw hover:bg-earth/90 py-1.5 rounded-xl font-mono font-black text-[9px] transition-all"
              >
                {t("det.btn_reset")}
              </button>
            </div>

          </div>
        )}
      </div>

      <div className="mt-4 pt-2 border-t border-earth/15 flex items-center gap-1.5 text-[8px] text-earth/40 font-mono select-none font-bold uppercase">
        <Info className="w-3.5 h-3.5 text-earth/35" />
        <span>{t("det.footer")}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── 5. SKINNED CENTRAL RECENT ACTIVITY LOGS
// ─────────────────────────────────────────────────────────────────────────────
function SkinnedActivityLog({ activities, onClearLogs }) {
  const { t } = useLanguage();
  
  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'ALERT':
        return 'bg-earth text-straw border-2 border-earth font-black';
      case 'WARN':
        return 'bg-white text-earth border-2 border-earth font-bold';
      case 'INFO':
      default:
        return 'bg-straw/40 border border-earth/30 text-earth font-bold';
    }
  };

  const renderActivityMessage = (msg) => {
    if (!msg) return '';
    if (typeof msg === 'string') {
      return msg; // Fallback for legacy logs
    }
    if (msg && msg.key) {
      if (msg.key === 'log.scan_completed_detail') {
        const cropVal = t("crop." + msg.variables.crop);
        
        // Lookup disease
        let diseaseVal = msg.variables.disease;
        const key = `disease.${msg.variables.crop}_${msg.variables.disease}`.replace(/ /g, '_');
        const trans = t(key);
        if (trans !== key) {
          diseaseVal = trans;
        } else {
          const key2 = `disease.${msg.variables.disease}`.replace(/ /g, '_');
          const trans2 = t(key2);
          if (trans2 !== key2) diseaseVal = trans2;
        }

        const severityVal = t("severity." + msg.variables.severity.toLowerCase());
        
        return t("log.scan_completed_detail") + cropVal + " - " + diseaseVal + " (" + msg.variables.confidence + "% " + t("oled.lbl_conf").replace(' :', '').replace(':', '').trim().toLowerCase() + ")." + t("log.severity_label") + severityVal + ".";
      }
      return t(msg.key, msg.variables);
    }
    return '';
  };

  return (
    <div className="bg-white border-2 border-earth p-4 rounded-2xl shadow-[4px_4px_0px_#584c33] relative overflow-hidden group">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 border-b-2 border-earth/15 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-earth" />
          <div>
            <h3 className="text-sm font-black text-earth uppercase tracking-wider flex items-center gap-1.5">
              {t("log.title")}
            </h3>
            <p className="text-[9px] font-mono text-earth/50 uppercase">{t("log.subtitle")}</p>
          </div>
        </div>

        {/* Console Actions */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1 bg-straw/25 border border-earth/25 px-2.5 py-1 rounded-xl text-earth font-bold select-none text-[8px] tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-earth animate-pulse mr-1" />
            {t("log.receiving")}
          </span>
          <button 
            onClick={onClearLogs}
            className="bg-transparent border-2 border-earth hover:bg-earth/5 py-1 px-3 rounded-xl font-mono font-black text-earth uppercase tracking-wider text-[8px]"
          >
            {t("log.clear")}
          </button>
        </div>
      </div>

      {/* Event list terminal viewport */}
      <div className="max-h-[190px] overflow-y-auto pr-1 space-y-2 rounded-lg font-mono relative z-20">
        
        {activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-earth/50 font-sans uppercase font-bold tracking-widest">
            {t("log.empty")}
          </div>
        ) : (
          activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-start sm:items-center justify-between gap-3 p-2 bg-straw/10 hover:bg-straw/20 border border-earth/10 hover:border-earth/25 rounded-xl text-[11px] leading-relaxed transition-all"
            >
              <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                
                <span className="text-[8px] text-earth/50 font-black bg-white border border-earth/25 px-1.5 py-0.5 rounded flex-shrink-0 select-none">
                  {activity.timestamp}
                </span>

                <span className="text-sm flex-shrink-0 select-none">
                  {activity.icon}
                </span>

                <span className="text-earth font-mono tracking-tight font-bold truncate pr-2">
                  {renderActivityMessage(activity.message)}
                </span>

              </div>

              <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 border rounded-lg flex-shrink-0 select-none font-sans ${getBadgeStyle(activity.badge)}`}>
                {t("severity." + activity.badge.toLowerCase())}
              </span>

            </div>
          ))
        )}
      </div>

      {/* Terminal Footer Info */}
      <div className="mt-3 flex justify-between items-center text-[8px] text-earth/40 select-none font-mono font-bold uppercase tracking-wider">
        <span>{t("log.baud")}</span>
        <span>{t("log.secure")}</span>
      </div>

    </div>
  );
}
