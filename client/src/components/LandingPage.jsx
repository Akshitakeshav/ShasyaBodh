import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Cpu, ShieldAlert, DollarSign, Clock, WifiOff, Droplets } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SoilMapSection from './SoilMapSection';

export default function LandingPage({ onEnterDashboard }) {
  const { t, toggleLanguage } = useLanguage();

  const renderUnderlinedText = (text) => {
    if (!text) return '';
    const parts = text.split(/(\[.*?\])/);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span key={index} className="underline decoration-earth/40 decoration-2 underline-offset-4 font-bold">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  const renderStrongText = (text) => {
    if (!text) return '';
    const parts = text.split(/(\[.*?\])/);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <strong key={index} className="font-extrabold text-earth">
            {part.slice(1, -1)}
          </strong>
        );
      }
      return part;
    });
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
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

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.div
      id="home"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-straw text-earth min-h-screen font-sans selection:bg-earth selection:text-straw flex flex-col justify-between overflow-x-hidden relative"
    >
      {/* 1. Header Navigation Bar */}
      <motion.header
        variants={itemVariants}
        className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10 border-b border-earth/20"
      >
        {/* Left Branding */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-earth rounded-xl flex items-center justify-center text-straw shadow-md group-hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-dashed border-straw/30 rounded-xl"
            />
            {/* Custom SVG Geometric Logo similar to the image's logo */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-straw stroke-[2]">
              <path d="M12 2L19 9L12 16L5 9L12 2Z" />
              <circle cx="12" cy="9" r="2" className="fill-straw" />
              <path d="M5 9H19" strokeDasharray="2 2" />
              <path d="M12 2V16" strokeDasharray="2 2" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight font-sans uppercase">ShasyaBodh (शस्य बोध)</span>
            <span className="text-[10px] block font-mono font-bold tracking-widest text-earth/60 -mt-1">MITTI KI AWAAZ, AB APNE HAATH</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
          {["home", "about", "features", "contact"].map((key) => (
            <a
              key={key}
              href={`#${key}`}
              onClick={(e) => {
                e.preventDefault();
                handleScroll(key);
              }}
              className="relative py-1 group overflow-hidden"
            >
              <span className="relative z-10 transition-colors group-hover:text-earth/70">{t(`nav.${key}`)}</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-earth origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </a>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-5">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 cursor-pointer font-mono font-bold text-xs uppercase hover:opacity-80 transition-opacity bg-transparent border-none text-earth outline-none"
          >
            <Globe className="w-4 h-4 text-earth/80 animate-pulse" />
            <span>{t("nav.lang")}</span>
          </button>
        </div>
      </motion.header>

      {/* 2. Main Landing Canvas */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-10">
        
        {/* Upper Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 lg:pt-10">
          {/* Left sub-column: Description */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-4 flex flex-col justify-end lg:h-full lg:pb-6"
          >
            <div className="w-2 h-2 bg-earth rounded-full mb-6 animate-ping" />
            <p className="text-base sm:text-lg leading-relaxed text-earth/95 font-medium max-w-sm">
              {renderUnderlinedText(t("hero.desc"))}
            </p>
          </motion.div>

          {/* Right sub-column: Title Header */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-8 flex flex-col items-start lg:items-end text-left lg:text-right"
          >
            <span className="bg-earth/10 border border-earth/25 text-earth font-mono text-[10px] font-extrabold uppercase px-3 py-1 rounded-full mb-4 tracking-widest">
              {t("hero.subtitle")}
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight uppercase max-w-3xl">
              {t("hero.title1")} <br />
              <span className="italic font-light text-earth/85">{t("hero.title2")}</span>
            </h1>
          </motion.div>
        </div>

        {/* Lower Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-4">
          
          {/* Left Split: Solid Earth Rectangular Card */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-4 bg-earth text-straw rounded-3xl p-8 sm:p-10 flex flex-col justify-between items-start gap-12 relative overflow-hidden shadow-2xl group min-h-[350px]"
          >
            {/* Background organic shape */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-straw/5 rounded-full blur-2xl group-hover:bg-straw/10 transition-all duration-700" />
            <div className="w-full flex justify-between items-start z-10">
              <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-straw/60">
                {t("hero.telemetry")}
              </span>
              <Cpu className="w-5 h-5 text-straw/60 animate-bounce" />
            </div>

            <div className="z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-[1.1] uppercase tracking-tight mb-6">
                {t("hero.card_title")}
              </h2>
              <button
                onClick={onEnterDashboard}
                className="inline-flex items-center gap-2 group/btn cursor-pointer"
              >
                <span className="font-mono text-xs font-black uppercase tracking-widest border-b-2 border-straw pb-0.5 group-hover/btn:pr-2 transition-all">
                  {t("hero.learn_more")}
                </span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </motion.div>

          {/* Right Split: Crop Field Background Image with Overlaid Glassmorphic Pods */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-8 rounded-3xl overflow-hidden relative min-h-[400px] lg:min-h-full border-4 border-earth/25 shadow-2xl flex items-center justify-center"
          >
            {/* Background Crop Field Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 ease-out hover:scale-105"
              style={{ backgroundImage: `url('/crop_field_bg.png')` }}
            />
            {/* Overlay Gradient Screen */}
            <div className="absolute inset-0 bg-gradient-to-t from-earth/45 via-transparent to-earth/10" />

            {/* Content Overlay Grid representing crop circles layout */}
            <div className="absolute inset-0 p-6 sm:p-10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-6 z-10">
              
              {/* Left Pod: Moisture Circle */}
              

              {/* Center Node Canister */}
              

              {/* Right Pod: Heat Peaks Circle */}
              
            </div>
          </motion.div>

        </div>

        {/* Repositioned Dashboard CTA Button */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center my-10"
        >
          <motion.button
            onClick={onEnterDashboard}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(88, 76, 51, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-earth text-straw font-mono font-black text-sm uppercase tracking-widest py-4 px-12 rounded-full shadow-2xl flex items-center gap-3 group transition-all duration-300"
          >
            <span>{t("hero.activate_btn")}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
          </motion.button>
        </motion.div>

        {/* STEP 2: OUR DEVICE SECTION */}
        <motion.section
          id="about"
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20 border-t border-earth/20"
        >
          {/* Left Column: Text Content */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl sm:text-5xl font-bold font-serifDisplay text-earth mb-6">
              {t("device.title")}
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-earth/90 font-medium mb-8">
              {renderStrongText(t("device.desc"))}
            </p>
            <ul className="space-y-4">
              {[1, 2, 3, 4].map((num) => (
                <li key={num} className="flex items-start gap-3">
                  <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-earth shrink-0" />
                  <div>
                    <strong className="block text-sm uppercase tracking-wider text-earth font-sans">
                      {t(`device.feat${num}_title`)}
                    </strong>
                    <span className="text-sm text-earth/85">
                      {t(`device.feat${num}_desc`)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Device Image */}
          <div className="w-full h-96 rounded-3xl overflow-hidden border-2 border-earth/20 flex items-center justify-center shadow-xl relative group">
            <img
              src="/shasyabodh_device.jpeg"
              alt="ShasyaBodh IoT Device Node"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-straw">
              <div>
                <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-straw/70 block mb-1">
                  {t("device.badge")}
                </span>
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  {t("device.node_title")}
                </h3>
              </div>
              <div className="flex items-center gap-1 font-mono text-[8px] bg-straw/20 border border-straw/35 px-2.5 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-straw animate-ping" />
                <span>{t("device.specs")}</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* STEP 2.5: HOW DOES IT WORK? SECTION */}
        <motion.section
          id="features"
          variants={itemVariants}
          className="py-20 border-t border-earth/20"
        >
          <div className="mb-12">
            <span className="font-mono text-xs font-bold tracking-widest text-earth/65 uppercase block mb-3">
              {t("workflow.badge")}
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold font-serifDisplay text-earth">
              {t("workflow.title")}
            </h2>
          </div>

          {/* Workflow Timeline Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch mb-12">
            {[1, 2, 3, 4].map((num) => {
              return (
                <div key={num} className="flex flex-col justify-between p-6 bg-earth/5 border border-earth/10 rounded-2xl relative overflow-hidden group hover:bg-earth/10 transition-colors duration-300">
                  <div className="absolute top-0 right-0 p-3 bg-earth/10 rounded-bl-xl font-mono text-[9px] font-bold text-earth/70">
                    {t(`workflow.step${num}_time`)}
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold tracking-wider text-earth/60 uppercase block mb-4">
                      {t(`workflow.step${num}_phase`)}
                    </span>
                    <h3 className="text-lg font-bold text-earth leading-snug mb-3">
                      {t(`workflow.step${num}_title`)}
                    </h3>
                  </div>
                  <p className="text-sm text-earth/80 leading-relaxed font-medium mt-auto">
                    {t(`workflow.step${num}_desc`)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Interactive Real-Life Callout Box */}
          
        </motion.section>

        {/* STEP 3: WHY SHASYABODH SECTION (REDESIGNED ROW-WISE LIST) */}
        <motion.section
          variants={itemVariants}
          className="py-20 border-t border-earth/20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold font-serifDisplay text-earth mb-12">
            {t("why.title")}
          </h2>
          <div className="flex flex-col gap-6">
            {[
              { badge: "01", key: "why.feat1_title", descKey: "why.feat1_desc", icon: ShieldAlert },
              { badge: "02", key: "why.feat2_title", descKey: "why.feat2_desc", icon: DollarSign },
              { badge: "03", key: "why.feat3_title", descKey: "why.feat3_desc", icon: Clock },
              { badge: "04", key: "why.feat4_title", descKey: "why.feat4_desc", icon: Droplets },
              { badge: "05", key: "why.feat5_title", descKey: "why.feat5_desc", icon: WifiOff }
            ].map((row, idx) => {
              const RowIcon = row.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row items-start gap-6 p-6 bg-[#fdfbf7] rounded-2xl border border-earth/10 hover:border-earth/20 hover:bg-[#fffefe] transition-all duration-300"
                >
                  {/* Circular Badge / Icon */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-earth text-straw flex items-center justify-center font-mono font-bold text-sm shadow-md">
                      <RowIcon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-earth/40 block md:hidden">
                      {row.badge}
                    </span>
                  </div>

                  {/* Title and description */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs font-bold text-earth/40 hidden md:block">
                        {row.badge}
                      </span>
                      <h3 className="text-lg font-extrabold uppercase tracking-widest text-earth font-sans">
                        {t(row.key)}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-earth/80 font-medium">
                      {t(row.descKey)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* STEP 3.5: SOIL INTELLIGENCE MAP SECTION */}
        <SoilMapSection />

      </main>

      {/* STEP 4: FOOTER INTEGRATION */}
      <motion.footer
        id="contact"
        variants={itemVariants}
        className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-earth/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-xs font-mono font-bold tracking-widest text-earth/70"
      >
        <div className="flex flex-col gap-2">
          <span className="uppercase text-earth">{t("footer.copyright")}</span>
          <span className="text-[10px] text-earth/55 uppercase font-mono">{t("footer.checked")}</span>
        </div>
        <div className="flex gap-6">
          <a href="#terms" className="hover:text-earth transition-colors uppercase">{t("footer.terms")}</a>
          <a href="#privacy" className="hover:text-earth transition-colors uppercase">{t("footer.privacy")}</a>
        </div>
      </motion.footer>
    </motion.div>
  );
}
