import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, CheckCircle2, RotateCw, Copy, Check, Info, FileImage, ShieldCheck } from 'lucide-react';

/**
 * DiseaseDetector Component. Simulates leaf disease AI analysis.
 * Integrates drag & drop, fake multi-stage loading, and clipboard copy.
 */
export default function DiseaseDetector({ cameraScanTrigger, onScanReset }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisText, setAnalysisText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef(null);

  // Monitor Scan commands sent from the ESP32 Camera Feed
  useEffect(() => {
    if (cameraScanTrigger) {
      // Mock leaf scan initiated from ESP32-CAM
      const mockCameraFile = {
        name: "esp32_cam_capture.jpg",
        size: 154200, // ~150KB
        type: "image/jpeg",
        isCameraScan: true
      };
      
      setSelectedFile(mockCameraFile);
      // Inline beautiful green leaf SVG mockup to represent camera capture
      setPreviewUrl("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23111811'/><path d='M50 15 C25 40 25 75 50 85 C75 75 75 40 50 15 Z' fill='%231b5e20' stroke='%2322C55E' stroke-width='2'/><path d='M50 15 V85 M50 35 L30 50 M50 50 L30 65 M50 45 L70 60 M50 60 L70 75' stroke='%234ade80' stroke-width='1.5'/><circle cx='50' cy='50' r='10' stroke='%23F59E0B' stroke-width='1' stroke-dasharray='2 2' fill='none'/></svg>");
      
      // Auto run analysis for snappy ESP32 experience!
      triggerAnalysis();
      onScanReset(); // Clear parent signal
    }
  }, [cameraScanTrigger]);

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Unsupported file format! Please upload image/jpeg, image/png, or image/webp.");
      return;
    }
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    setShowResults(false);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Fake Loading Cycle
  const triggerAnalysis = () => {
    if (!previewUrl) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setShowResults(false);

    const stages = [
      { max: 25, text: "Loading model parameters..." },
      { max: 50, text: "Preprocessing leaf image contours..." },
      { max: 75, text: "Running inference on convolutional layers..." },
      { max: 100, text: "Generating diagnostic reports..." }
    ];

    let currentStageIndex = 0;
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        const nextVal = prev + 4; // Increments progress
        
        // Match stage texts
        const activeStage = stages.find(s => nextVal <= s.max) || stages[stages.length - 1];
        setAnalysisText(activeStage.text);

        if (nextVal >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnalyzing(false);
            setShowResults(true);
          }, 300);
          return 100;
        }
        return nextVal;
      });
    }, 100); // Ticks progress every 100ms -> Total 2.5 seconds!
  };

  // Copy report to clipboard
  const handleCopyReport = () => {
    const reportText = `SHASYA BODH (शस्य बोध) DIAGNOSIS REPORT
--------------------------------------
Timestamp   : ${new Date().toLocaleString()}
Target Crop : Tomato
Disease     : Early Blight
Confidence  : 94.2%
Severity    : Moderate

TREATMENT RECOMMENDATIONS:
- Apply Mancozeb 75% WP
- Dose: 2g per litre of water
- Spray in evening
- Repeat after 7 days

OTHER PREDICTIONS:
- Late Blight (12%)
- Healthy (4%)
--------------------------------------
Static Demo System`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Reset detector state
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowResults(false);
    setAnalysisProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="ag-card-glow p-4 rounded-xl border border-agPrimary/25 flex flex-col justify-between h-full shadow-agCard relative overflow-hidden group">
      
      {/* Title Panel */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-agPrimary animate-pulse" /> 🔬 Leaf Disease Detector
        </h3>
        <p className="text-[10px] text-gray-400">Upload a leaf image for AI diagnosis</p>
      </div>

      {/* Main Interactive Box */}
      <div className="flex-1 flex flex-col justify-center">
        {!previewUrl ? (
          /* 1. Drag & Drop Upload Zone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-agPrimary bg-agPrimary/10' 
                : 'border-agPrimary/20 bg-agBg/40 hover:border-agPrimary/50 hover:bg-agBg/80'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 mx-auto text-agPrimary/60 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-gray-300">Drag & Drop leaf image here</p>
            <p className="text-[10px] text-gray-500 mt-1">or click to browse local files</p>
            <p className="text-[9px] text-gray-500 mt-2 bg-agCard border border-agPrimary/10 py-1 px-2 rounded inline-block">
              JPG, PNG, WEBP (Max 5MB)
            </p>
          </div>
        ) : (
          /* 2. Image Preview & Action Panel */
          <div className="flex flex-col gap-3">
            
            {/* Image crop box */}
            <div className="relative border border-agPrimary/20 rounded-lg aspect-square bg-black overflow-hidden shadow-md max-h-[220px] mx-auto w-full">
              <img
                src={previewUrl}
                alt="Leaf Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              
              {/* Radar Grid overlay during active analysis */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-agPrimary/5 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-agPrimary absolute animate-bounce" style={{ animationDuration: '2.5s' }}></div>
                  <div className="w-0.5 h-full bg-agPrimary absolute animate-bounce" style={{ animationDuration: '3.5s' }}></div>
                </div>
              )}
            </div>

            {/* Image description metadata */}
            <div className="flex items-center gap-2 bg-agBg/80 border border-agPrimary/15 p-2 rounded-lg text-[10px] text-gray-400 font-mono">
              <FileImage className="w-4 h-4 text-agPrimary" />
              <div className="flex-1 truncate">
                <p className="text-gray-300 font-bold truncate">{selectedFile?.name}</p>
                <p className="text-[9px] opacity-75">
                  {(selectedFile?.size / 1024).toFixed(1)} KB • {selectedFile?.type}
                </p>
              </div>
            </div>

            {/* Run Button */}
            {!isAnalyzing && !showResults && (
              <button
                onClick={triggerAnalysis}
                className="w-full bg-agPrimary border border-agPrimary/40 hover:bg-agPrimary/80 text-black py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                Analyse Leaf
              </button>
            )}
          </div>
        )}

        {/* 3. Fake Loading Progress Overlay */}
        {isAnalyzing && (
          <div className="bg-agBg border border-agPrimary/25 p-4 rounded-xl mt-4 font-mono shadow-md relative overflow-hidden">
            <div className="flex items-center gap-3">
              <RotateCw className="w-5 h-5 text-agPrimary animate-spin" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-agPrimary block truncate">{analysisText}</span>
                <span className="text-[9px] text-gray-500 mt-0.5 block">AI Model: TomatoLeafNet v2.1</span>
              </div>
            </div>
            
            {/* Loading progress bar */}
            <div className="w-full bg-agCard border border-agPrimary/10 rounded h-2.5 mt-3 overflow-hidden">
              <div 
                className="bg-agPrimary h-full transition-all duration-100" 
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-end text-[9px] text-gray-400 mt-1">
              Inference status: {analysisProgress}%
            </div>
          </div>
        )}

        {/* 4. Mock Diagnostic Results Card */}
        {showResults && (
          <div className="border-l-4 border-agPrimary bg-black/90 p-4 rounded-r-xl border border-y-agPrimary/25 border-r-agPrimary/25 mt-4 text-xs font-mono relative overflow-hidden shadow-lg">
            
            {/* Hologram header */}
            <div className="flex justify-between items-center text-agPrimary font-bold border-b border-agPrimary/20 pb-1.5 mb-2.5">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> DIAGNOSIS REPORT</span>
              <span className="text-[10px] opacity-75">ShasyaBodh AI</span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-agBg/85 border border-agPrimary/10 p-2 rounded-lg mb-3">
              <div>
                <span className="text-[9px] text-gray-500 block uppercase">🦠 Disease</span>
                <span className="text-agAmber font-black text-sm block">Early Blight</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block uppercase">🌿 Crop Target</span>
                <span className="text-white font-bold block">Tomato</span>
              </div>
              <div className="col-span-2 mt-1">
                <div className="flex justify-between text-[9px] text-gray-400 mb-0.5">
                  <span>📊 CONFIDENCE</span>
                  <span className="text-agPrimary font-bold">94.2%</span>
                </div>
                <div className="w-full bg-[#111811] h-1.5 rounded-full overflow-hidden border border-agPrimary/10">
                  <div className="h-full bg-agPrimary rounded-full" style={{ width: '94.2%' }}></div>
                </div>
              </div>
              <div className="col-span-2 mt-1 flex justify-between border-t border-agPrimary/5 pt-1.5 text-[9px]">
                <span className="text-gray-500">⚠️ SEVERITY:</span>
                <span className="text-agAmber font-bold">MODERATE</span>
              </div>
            </div>

            {/* SVG Probability Distribution Donut Chart */}
            <div className="flex items-center gap-3 bg-agBg/70 border border-agPrimary/10 p-2.5 rounded-lg mb-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#111811" strokeWidth="3.5" />
                  
                  {/* Segment 1: Early Blight (84%) */}
                  <circle 
                    cx="18" cy="18" r="15.915" 
                    fill="none" 
                    stroke="#F59E0B" 
                    strokeWidth="3.5" 
                    strokeDasharray="84 16" 
                    strokeDashoffset="0" 
                  />
                  
                  {/* Segment 2: Late Blight (12%) */}
                  <circle 
                    cx="18" cy="18" r="15.915" 
                    fill="none" 
                    stroke="#EF4444" 
                    strokeWidth="3.5" 
                    strokeDasharray="12 88" 
                    strokeDashoffset="-84" 
                  />
                  
                  {/* Segment 3: Healthy (4%) */}
                  <circle 
                    cx="18" cy="18" r="15.915" 
                    fill="none" 
                    stroke="#22C55E" 
                    strokeWidth="3.5" 
                    strokeDasharray="4 96" 
                    strokeDashoffset="-96" 
                  />
                </svg>
                {/* Center text overlay */}
                <div className="absolute inset-0 flex items-center justify-center text-[7px] text-gray-400 font-bold uppercase">
                  Top 3
                </div>
              </div>
              <div className="flex-1 text-[9px] grid grid-cols-1 gap-0.5 leading-tight font-sans">
                <div className="flex items-center justify-between text-gray-300">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-agAmber"></span> Early Blight</span>
                  <span className="font-mono font-bold">84%</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-agRed"></span> Late Blight</span>
                  <span className="font-mono font-bold">12%</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-agPrimary"></span> Healthy</span>
                  <span className="font-mono font-bold">4%</span>
                </div>
              </div>
            </div>

            {/* Prescriptions */}
            <div className="text-[10px] text-gray-300 leading-relaxed border-t border-agPrimary/10 pt-2.5">
              <span className="block text-[9px] text-gray-500 font-bold uppercase mb-1">🌿 TREATMENT RECOMMENDATIONS:</span>
              <ul className="list-disc pl-3.5 space-y-0.5">
                <li>Apply Mancozeb 75% WP</li>
                <li>Dose: 2g per litre of water</li>
                <li>Spray in evening</li>
                <li>Repeat after 7 days</li>
              </ul>
            </div>

            {/* Buttons Panel */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={handleCopyReport}
                className="bg-transparent border border-agPrimary/30 hover:border-agPrimary/80 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 text-[10px]"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-agPrimary" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-gray-400" /> Copy Report
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="bg-agPrimary/10 border border-agPrimary/30 hover:bg-agPrimary/25 text-agOled py-1.5 rounded-lg font-bold transition-all text-[10px]"
              >
                Reset Scanner
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Muted Disclaimer Stamp */}
      <div className="mt-4 pt-2 border-t border-agPrimary/10 flex items-center gap-1.5 text-[9px] text-gray-500 font-mono select-none">
        <Info className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <span>Static demo — live ML model integration pending</span>
      </div>

    </div>
  );
}
