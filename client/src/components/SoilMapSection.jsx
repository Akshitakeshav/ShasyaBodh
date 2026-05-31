import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { feature } from 'topojson-client';
import { Thermometer, Droplets, MapPin, Activity, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const INDIA_GEO_URL = '/india-states.json';

const STRAW_COLOR = '#faf4dd';
const EARTH_COLOR = '#584c33';

const interpolateColor = (color1, color2, factor) => {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const STATE_MAP_CONFIGS = {
  maharashtra: { key: 'state.maharashtra', center: [76.2, 19.3], scale: 3500 },
  punjab:      { key: 'state.punjab',      center: [75.4, 30.9], scale: 7500 },
  rajasthan:   { key: 'state.rajasthan',   center: [73.4, 26.3], scale: 3600 },
  gujarat:     { key: 'state.gujarat',     center: [71.5, 22.3], scale: 3600 },
  uttarpradesh:{ key: 'state.uttarpradesh',center: [80.5, 26.8], scale: 3200 }
};

// Maps the st_nm property in GeoJSON to our state keys
const STATE_NAME_MAP = {
  maharashtra:   ['maharashtra'],
  punjab:        ['punjab'],
  rajasthan:     ['rajasthan'],
  gujarat:       ['gujarat'],
  uttarpradesh:  ['uttar pradesh', 'uttarpradesh']
};

// FIX 1: Define the missing getNormalizedStateKey helper
const getNormalizedStateKey = (stName) => {
  const normalized = stName.toLowerCase().trim();
  for (const [key, aliases] of Object.entries(STATE_NAME_MAP)) {
    if (aliases.includes(normalized)) return key;
  }
  return null;
};

const STATE_INSIGHTS = {
  maharashtra: {
    hot:   { district: 'Jalgaon',   val: '38.8°C', desc: 'Arid local weather triggers secondary drip systems.' },
    moist: { district: 'Ratnagiri', val: '78.5%',  desc: 'Coastal humidity provides excellent root moisture.' },
    npk:   { district: 'Nashik',    val: '88 Index',desc: 'Nourished vineyards demonstrate premium organic indices.' }
  },
  punjab: {
    hot:   { district: 'Bathinda',  val: '36.2°C', desc: 'Arid zones trigger localized foliage misting alarms.' },
    moist: { district: 'Pathankot', val: '72.0%',  desc: 'Himalayan foothills naturally elevate root hydration.' },
    npk:   { district: 'Ludhiana',  val: '96 Index',desc: 'Fertile crop belt showcases superior phosphate ratings.' }
  },
  rajasthan: {
    hot:   { district: 'Barmer',  val: '44.5°C', desc: 'Severe desert heat spike detected; activate solar screens.' },
    moist: { district: 'Udaipur', val: '48.0%',  desc: 'Lake basin micro-climate retains steady soil hydration.' },
    npk:   { district: 'Jaipur',  val: '76 Index',desc: 'Agri-suburbs maintain robust potassium replenishment.' }
  },
  gujarat: {
    hot:   { district: 'Kutch',  val: '41.2°C', desc: 'Salt-marsh edges experience high land evapotranspiration.' },
    moist: { district: 'Valsad', val: '75.0%',  desc: 'Dense fruit orchards hold steady soil moisture ratios.' },
    npk:   { district: 'Anand',  val: '90 Index',desc: 'Agri-dairy hub shows optimized organic fertilizer index.' }
  },
  uttarpradesh: {
    hot:   { district: 'Agra',      val: '39.5°C', desc: 'Dry wind patterns elevate local soil surface temperatures.' },
    moist: { district: 'Gorakhpur', val: '74.0%',  desc: 'Humid plains preserve long-term soil moisture reserves.' },
    npk:   { district: 'Varanasi',  val: '92 Index',desc: 'Gangetic alluvial plains provide high potassium ratings.' }
  }
};

const getDistrictValue = (districtName, stateKey, metric) => {
  let hash = 0;
  const name = districtName || '';
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  if (metric === 'temp') {
    const base = stateKey === 'rajasthan' ? 34.0 : stateKey === 'punjab' ? 24.0 : 28.0;
    return Math.round((base + (hash % 10)) * 10) / 10;
  } else if (metric === 'moisture') {
    const base = stateKey === 'rajasthan' ? 28 : stateKey === 'punjab' ? 52 : 44;
    return Math.round(base + (hash % 25));
  }
};

const SoilMapSection = () => {
  // FIX 2: Add the missing useLanguage hook call to get `t`
  const { t } = useLanguage();

  // FIX 3: Add the missing activeStateKey state declaration
  const [activeStateKey, setActiveStateKey] = useState('maharashtra');
  const [selectedMetric, setSelectedMetric] = useState('temp');
  const [tooltipData, setTooltipData] = useState(null);

  const metricConfigs = {
    temp: {
      label: t('map.tab_temp'),
      unit: '°C',
      min: 15,
      max: 45,
      sensorLabel: 'Thermometer Probe',
      colorScale: { min: STRAW_COLOR, max: EARTH_COLOR }
    },
    moisture: {
      label: t('map.tab_moist'),
      unit: '%',
      min: 25,
      max: 85,
      sensorLabel: 'Capacitive Soil Probe',
      colorScale: { min: STRAW_COLOR, max: EARTH_COLOR }
    }
  };

  const currentConf = metricConfigs[selectedMetric];
  const activeStateConfig = STATE_MAP_CONFIGS[activeStateKey];
  const activeInsights = STATE_INSIGHTS[activeStateKey];

  const getDistrictMetricValue = (districtName) => {
    return getDistrictValue(districtName, activeStateKey, selectedMetric);
  };

  const getDistrictColor = (districtName) => {
    const val = getDistrictMetricValue(districtName);
    const factor = (val - currentConf.min) / (currentConf.max - currentConf.min);
    const normalizedFactor = Math.min(Math.max(factor, 0), 1);
    return interpolateColor(currentConf.colorScale.min, currentConf.colorScale.max, normalizedFactor);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  };

  return (
    <motion.section
      id="soil-map"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={sectionVariants}
      className="py-20 border-t border-earth/20 bg-straw text-earth overflow-hidden relative"
    >
      {/* SECTION HEADER */}
      <motion.div variants={itemVariants} className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <span className="font-mono text-xs font-bold tracking-widest text-earth/65 uppercase bg-earth/10 border border-earth/25 px-3.5 py-1.5 rounded-full inline-block mb-4">
          {t('map.badge')}
        </span>
        <h2 className="text-4xl sm:text-5xl font-serifDisplay font-bold text-earth leading-tight mb-4">
          {t('map.title')}
        </h2>
        <p className="text-base sm:text-lg text-earth/80 max-w-3xl mx-auto font-medium leading-relaxed">
          {t('map.subtitle')}
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* LEFT COLUMN: SENSOR SHOWCASE */}
        <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col gap-6 w-full">
          <div className="w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-earth/20 flex items-center justify-center shadow-xl relative group bg-[#fdfbf7]">
            <img
              src="/soil-moisture-sensor.jpeg"
              alt="Capacitive Soil Moisture Sensor v1.2"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-earth/70 via-earth/10 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300 pointer-events-none" />

            <div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-widest bg-earth/80 text-straw border border-straw/20 px-3 py-1.5 rounded-full shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>{t('map.active_node')}</span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-straw pointer-events-none">
              <span className="font-mono text-[9px] tracking-widest uppercase text-straw/70 block mb-1">
                // SENSOR SPECIFICATIONS
              </span>
              <h3 className="text-xl font-bold uppercase tracking-tight">
                Capacitive Soil Sensor v1.2
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-start items-center">
            <div className="bg-earth text-straw text-xs font-mono py-1.5 px-4 rounded-full flex items-center gap-2 shadow-sm border border-earth/10 hover:bg-earth/95 transition-colors cursor-default">
              <span>{t('map.temp_pill')}</span>
            </div>
            <div className="bg-earth text-straw text-xs font-mono py-1.5 px-4 rounded-full flex items-center gap-2 shadow-sm border border-earth/10 hover:bg-earth/95 transition-colors cursor-default">
              <span>{t('map.moisture_pill')}</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: DEVICE SPECS */}
        <motion.div variants={itemVariants} className="lg:col-span-7 w-full flex flex-col justify-between h-full bg-[#fdfbf7] p-8 rounded-3xl border border-earth/20 shadow-xl">
          <div>
            <h3 className="text-2xl font-extrabold uppercase font-sans tracking-wide text-earth mb-6 pb-3 border-b border-earth/10 flex items-center gap-2">
              <Activity className="w-5 h-5 text-earth/80 animate-pulse" />
              {t('map.measures_heading')}
            </h3>

            <div className="space-y-6">
              {[
                { icon: Thermometer, nameKey: 'map.param_temp', descKey: 'map.param_temp_desc', liveVal: '34.2°C', pct: 68 },
                { icon: Droplets,    nameKey: 'map.param_moist', descKey: 'map.param_moist_desc', liveVal: '62%',   pct: 62 }
              ].map((param, idx) => {
                const ParamIcon = param.icon;
                return (
                  <div key={idx} className="flex flex-col gap-2 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-earth/10 text-earth flex items-center justify-center shadow-inner group-hover:bg-earth group-hover:text-straw transition-colors duration-300">
                          <ParamIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="block text-xs font-mono font-black tracking-widest text-earth uppercase">
                            {t(param.nameKey)}
                          </strong>
                          <span className="text-xs text-earth/70 font-medium">
                            {t(param.descKey)}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold bg-earth text-straw px-2.5 py-1 rounded-md shrink-0 border border-earth/20 shadow-sm">
                        {param.liveVal}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-earth/10 rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${param.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: idx * 0.1 }}
                        className="h-full bg-earth rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* INTERACTIVE INDIA CHOROPLETH MAP */}
      <div className="max-w-7xl mx-auto px-6 mt-16 flex flex-col items-center">

        <motion.div variants={itemVariants} className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-earth/70">
              {t('map.select_state_lbl')}
            </span>
            <div className="relative inline-block">
              <select
                value={activeStateKey}
                onChange={(e) => setActiveStateKey(e.target.value)}
                className="appearance-none bg-[#fdfbf7] text-earth font-mono text-xs font-black uppercase tracking-wider py-2.5 pl-5 pr-10 rounded-full border border-earth/25 focus:outline-none cursor-pointer hover:border-earth/40 hover:bg-[#fffefe] transition-all shadow-sm"
              >
                {Object.keys(STATE_MAP_CONFIGS).map((key) => (
                  <option key={key} value={key} className="bg-straw text-earth uppercase font-mono">
                    {t(STATE_MAP_CONFIGS[key].key)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-earth">
                <ChevronDown className="w-4 h-4 text-earth/60" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 bg-earth/5 p-1 rounded-full border border-earth/15">
            {Object.keys(metricConfigs).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`px-5 py-2 rounded-full text-[11px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedMetric === key
                    ? 'bg-earth text-straw shadow-md scale-102 border border-earth'
                    : 'bg-transparent text-earth/80 hover:text-earth hover:bg-earth/5'
                }`}
              >
                {metricConfigs[key].label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full max-w-3xl aspect-[4/5] sm:aspect-square md:aspect-video rounded-3xl border border-earth/20 bg-[#fdfbf7] shadow-xl p-4 sm:p-8 flex items-center justify-center relative overflow-hidden group"
        >
          <div className="w-full h-full max-h-[550px] relative">
            <ComposableMap
              key={activeStateKey}
              projection="geoMercator"
              projectionConfig={{
                scale: activeStateConfig.scale,
                center: activeStateConfig.center
              }}
              className="w-full h-full"
            >
              <Geographies
                geography={INDIA_GEO_URL}
                parseGeographies={(data) => {
                  if (data && data.objects) {
                    return feature(data, data.objects.districts).features;
                  }
                  return data;
                }}
              >
                {({ geographies }) => {
                  const filteredGeos = geographies.filter((geo) => {
                    const stName = geo.properties.st_nm || '';
                    return getNormalizedStateKey(stName) === activeStateKey;
                  });

                  return filteredGeos.map((geo) => {
                    const districtName = geo.properties.district || geo.properties.name || geo.id || 'Unknown';
                    const fill = getDistrictColor(districtName);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={(e) => {
                          const val = getDistrictMetricValue(districtName);
                          setTooltipData({
                            district: districtName,
                            value: `${val}${currentConf.unit}`,
                            sensor: currentConf.sensorLabel,
                            x: e.clientX,
                            y: e.clientY
                          });
                        }}
                        onMouseMove={(e) => {
                          if (tooltipData) {
                            setTooltipData((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
                          }
                        }}
                        onMouseLeave={() => setTooltipData(null)}
                        style={{
                          default: {
                            fill: fill,
                            stroke: '#584c33',
                            strokeWidth: 0.8,
                            outline: 'none',
                            transition: 'all 200ms ease'
                          },
                          hover: {
                            fill: '#d5c496',
                            stroke: '#584c33',
                            strokeWidth: 1.5,
                            outline: 'none',
                            cursor: 'pointer',
                            filter: 'drop-shadow(0px 2px 4px rgba(88, 76, 51, 0.3))'
                          },
                          pressed: {
                            fill: '#584c33',
                            stroke: '#584c33',
                            strokeWidth: 1.5,
                            outline: 'none'
                          }
                        }}
                      />
                    );
                  });
                }}
              </Geographies>
            </ComposableMap>

            <AnimatePresence>
              {tooltipData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed pointer-events-none z-50 bg-earth text-straw p-4 rounded-2xl shadow-2xl border border-straw/20 font-sans max-w-xs"
                  style={{
                    left: tooltipData.x + 15,
                    top: tooltipData.y - 75
                  }}
                >
                  <span className="font-mono text-[9px] text-straw/60 uppercase tracking-widest block mb-1">
                    // DISTRICT TELEMETRY
                  </span>
                  <h4 className="text-sm font-extrabold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-straw/85" />
                    {tooltipData.district}
                  </h4>
                  <div className="text-base font-black border-t border-straw/25 pt-1.5 mt-1 flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-straw/80">{currentConf.label}:</span>
                    <span className="text-sm font-mono text-[#f5e7b8]">{tooltipData.value}</span>
                  </div>
                  <div className="text-[10px] font-mono text-straw/75 mt-2 bg-straw/10 py-1 px-2 rounded flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#f5e7b8] animate-pulse" />
                    <span>{t('map.dominant_sensor')}: {tooltipData.sensor}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div variants={itemVariants} className="w-full max-w-xl mt-8 flex flex-col gap-2">
          <div
            className="h-4 w-full rounded-full border border-earth/25 shadow-inner"
            style={{
              background: `linear-gradient(to right, ${currentConf.colorScale.min}, ${currentConf.colorScale.max})`
            }}
          />
          <div className="flex justify-between items-center font-mono text-[10px] font-bold text-earth/80 px-1 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <span>{t('map.legend_low')}</span>
              <span>({currentConf.min}{currentConf.unit})</span>
            </span>
            <span className="flex items-center gap-1">
              <span>{t('map.legend_high')}</span>
              <span>({currentConf.max}{currentConf.unit})</span>
            </span>
          </div>
        </motion.div>

        {/* Insight Cards */}
        <motion.div variants={itemVariants} className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">

          <div className="bg-[#fdfbf7] p-6 rounded-2xl border border-earth/15 hover:border-earth/25 transition-all shadow-md group">
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shadow-inner group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-earth/50 block">
                  {t('map.insight_hot')}
                </span>
                <strong className="text-base font-extrabold uppercase font-sans text-earth tracking-wide">
                  {activeInsights.hot.district}
                </strong>
              </div>
            </div>
            <p className="text-xs text-earth/75 leading-relaxed font-medium mb-1">
              {activeInsights.hot.desc}
            </p>
            <div className="font-mono text-sm font-black text-earth border-t border-earth/15 pt-2 mt-2 flex justify-between">
              <span>LIVE READING:</span>
              <span className="text-red-600">{activeInsights.hot.val}</span>
            </div>
          </div>

          <div className="bg-[#fdfbf7] p-6 rounded-2xl border border-earth/15 hover:border-earth/25 transition-all shadow-md group">
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-earth/50 block">
                  {t('map.insight_moist')}
                </span>
                <strong className="text-base font-extrabold uppercase font-sans text-earth tracking-wide">
                  {activeInsights.moist.district}
                </strong>
              </div>
            </div>
            <p className="text-xs text-earth/75 leading-relaxed font-medium mb-1">
              {activeInsights.moist.desc}
            </p>
            <div className="font-mono text-sm font-black text-earth border-t border-earth/15 pt-2 mt-2 flex justify-between">
              <span>LIVE READING:</span>
              <span className="text-blue-600">{activeInsights.moist.val}</span>
            </div>
          </div>

        </motion.div>
      </div>
    </motion.section>
  );
};

export default SoilMapSection;