import React from 'react';
import { 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Maximize2, 
  Minimize2,
  RotateCw, 
  Terminal, 
  Sparkles, 
  Languages, 
  BrainCircuit, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Radio, 
  Layers
} from 'lucide-react';
import { MinerStats, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface HardwareFrameProps {
  children: React.ReactNode;
  stats: MinerStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleMining: () => void;
  onCycleMode: () => void;
  onOpenSettings: () => void;
  onToggleLogs: () => void;
  showLogs: boolean;
  onSimulateBlock: () => void;
  deviceViewMode: 'enclosure' | 'flat';
  onToggleDeviceView: () => void;
  lang: Language;
  onToggleLanguage: () => void;
  onToggleMiniMode: () => void;
}

export const HardwareFrame: React.FC<HardwareFrameProps> = ({
  children,
  stats,
  soundEnabled,
  onToggleSound,
  onToggleMining,
  onCycleMode,
  onOpenSettings,
  onToggleLogs,
  showLogs,
  onSimulateBlock,
  deviceViewMode,
  onToggleDeviceView,
  lang,
  onToggleLanguage,
  onToggleMiniMode
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar';

  return (
    <div className="w-full flex flex-col items-center" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Device View Mode & Hardware Quick Action Bar */}
      <div className="w-full max-w-[720px] flex items-center justify-between gap-2 px-1 sm:px-2 mb-3 text-xs font-mono">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#131722]/80 border border-white/10 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b] animate-pulse" />
            <span className="text-[#f59e0b] font-bold text-[11px] font-tajawal">
              {t.chassisView}
            </span>
          </div>

          <button
            id="toggle-enclosure-view-btn"
            onClick={onToggleDeviceView}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#12151f] hover:bg-[#1a1f2e] text-slate-300 border border-white/10 hover:border-amber-500/40 cursor-pointer text-[11px] font-bold transition-all shadow-sm font-tajawal whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{deviceViewMode === 'enclosure' ? t.fullEnclosure : t.compactDisplay}</span>
          </button>
        </div>

        {/* Right: Protocol Logs & Simulate Block Jackpot */}
        <div className="flex items-center gap-2">
          {/* Stratum Protocol Logs Toggle */}
          <button
            id="toggle-logs-top-btn"
            onClick={onToggleLogs}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold font-tajawal cursor-pointer transition-all shadow-sm whitespace-nowrap ${
              showLogs 
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.35)]' 
                : 'bg-[#12151f] hover:bg-[#1a1f2e] text-slate-300 border-white/10 hover:text-white'
            }`}
            title={t.logs}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden xs:inline">{t.logs}</span>
          </button>
        </div>
      </div>

      {deviceViewMode === 'enclosure' ? (
        /* High-End Precision Matte Anodized Chassis */
        <div 
          id="nerdminer-hardware-chassis"
          className="relative w-full max-w-[720px] bg-gradient-to-b from-[#151824] via-[#0d0f17] to-[#0a0b10] rounded-2xl p-4 sm:p-7 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.06),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all"
        >
          {/* Top Bezel: Screws & Precision Heat Exhaust Vents */}
          <div className="flex items-center justify-between mb-3.5 px-1.5">
            {/* Precision Hex Screw Left */}
            <div className="w-4 h-4 rounded-full bg-[#1e2230] border border-white/20 shadow-inner flex items-center justify-center">
              <div className="w-2.5 h-0.5 bg-slate-400 transform rotate-45" />
            </div>

            {/* Industrial CNC Vent Grid */}
            <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-black/60 border border-white/5 shadow-inner">
              <div className="w-2 h-1 bg-[#1a1f2e] rounded-sm" />
              <div className="w-6 h-1 bg-[#1a1f2e] rounded-sm" />
              <div className="w-10 h-1 bg-amber-500/40 rounded-sm animate-pulse" />
              <div className="w-6 h-1 bg-[#1a1f2e] rounded-sm" />
              <div className="w-2 h-1 bg-[#1a1f2e] rounded-sm" />
            </div>

            {/* Precision Hex Screw Right */}
            <div className="w-4 h-4 rounded-full bg-[#1e2230] border border-white/20 shadow-inner flex items-center justify-center">
              <div className="w-2.5 h-0.5 bg-slate-400 transform -rotate-30" />
            </div>
          </div>

          {/* TFT Screen Enclosure Slot with Gloss Optical Border */}
          <div className="relative p-2 sm:p-2.5 bg-[#050608] rounded-xl border border-white/15 shadow-[inset_0_4px_20px_rgba(0,0,0,0.95),0_0_15px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Gloss Highlight Glare Accent */}
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none z-10" />
            {children}
          </div>

          {/* Bottom Hardware Control Deck */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 px-1.5 font-mono">
            {/* Status Indicator & Model Stamp */}
            <div className="flex items-center gap-3">
              {/* Dynamic RGB Power LED */}
              <div className="flex items-center gap-2 bg-[#090b10] px-3 py-1.5 rounded-lg border border-white/10 shadow-inner">
                <div 
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    stats.isMining 
                      ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b,0_0_24px_#f59e0b]' 
                      : 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                  }`} 
                />
                <span className="text-[11px] text-slate-200 font-bold uppercase tracking-wider font-tajawal">
                  {stats.isMining ? t.hashing : t.idle}
                </span>
              </div>

              {/* Hardware Spec Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10131d] border border-white/5 text-[10px] text-slate-400 font-mono tracking-wider" dir="ltr">
                <span className="text-amber-400 font-bold">ESP32-S3</span>
                <span className="text-slate-600">•</span>
                <span>2.8" IPS TFT</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400">SHA-256d</span>
              </div>
            </div>

            {/* Tactile Hardware Push Buttons */}
            <div className="flex items-center gap-2">
              {/* MAIN START / PAUSE BUTTON */}
              <button
                id="hw-start-stop-btn"
                onClick={onToggleMining}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg font-tajawal ${
                  stats.isMining
                    ? 'bg-[#1a1f2c] hover:bg-[#252c3d] text-slate-200 border border-white/15 hover:border-amber-500/50'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                }`}
                title={stats.isMining ? t.stopMining : t.startMining}
              >
                {stats.isMining ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
                    <span>{t.stopMining}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t.startMining}</span>
                  </>
                )}
              </button>

              {/* CYCLE DISPLAY SCREEN */}
              <button
                id="hw-cycle-screen-btn"
                onClick={onCycleMode}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141824] hover:bg-[#1d2334] text-slate-200 font-bold text-xs uppercase border border-white/10 hover:border-cyan-500/40 active:scale-95 cursor-pointer transition-all shadow-sm font-tajawal"
                title={t.cycleScreen}
              >
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">{t.cycleScreen}</span>
              </button>

              {/* SOUND EFFECT TOGGLE */}
              <button
                id="hw-sound-toggle-btn"
                onClick={onToggleSound}
                className={`p-2 rounded-lg border active:scale-95 cursor-pointer transition-all ${
                  soundEnabled 
                    ? 'bg-[#151a27] text-amber-400 border-amber-500/40 hover:bg-[#1c2233] shadow-[0_0_12px_rgba(245,158,11,0.15)]' 
                    : 'bg-[#0b0d13] text-slate-600 border-white/5 hover:text-slate-400'
                }`}
                title={soundEnabled ? t.soundOn : t.soundOff}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* STRATUM PROTOCOL LOGS */}
              <button
                id="hw-logs-toggle-btn"
                onClick={onToggleLogs}
                className={`p-2 rounded-lg border active:scale-95 cursor-pointer transition-all ${
                  showLogs 
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                    : 'bg-[#141824] text-slate-400 border-white/10 hover:text-slate-200 hover:bg-[#1d2334]'
                }`}
                title={t.logs}
              >
                <Terminal className="w-4 h-4" />
              </button>

              {/* MINIMIZE MODE WIDGET */}
              <button
                id="hw-minimize-btn"
                onClick={onToggleMiniMode}
                className="p-2 rounded-lg bg-[#141824] hover:bg-[#1d2334] text-slate-300 border border-white/10 hover:border-amber-500/40 active:scale-95 cursor-pointer transition-all shadow-sm"
                title={t.miniMode}
              >
                <Minimize2 className="w-4 h-4 text-amber-400" />
              </button>

              {/* SETTINGS DIALOG */}
              <button
                id="hw-settings-btn"
                onClick={onOpenSettings}
                className="p-2 rounded-lg bg-[#141824] hover:bg-[#1d2334] text-slate-300 border border-white/10 hover:border-amber-500/40 active:scale-95 cursor-pointer transition-all shadow-sm"
                title={t.settings}
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Flat Minimalist Screen View */
        <div className="w-full max-w-[720px] bg-[#090b10] rounded-xl border border-white/15 p-2 shadow-2xl">
          {children}
        </div>
      )}
    </div>
  );
};
