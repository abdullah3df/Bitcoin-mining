import React from 'react';
import { CoreTelemetry, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { formatHashRate } from '../services/bitcoinCrypto';
import { 
  Cpu, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CoreHeatmapProps {
  cores: CoreTelemetry[];
  maxThreads: number;
  activeThreads: number;
  overallTemp: number;
  lang: Language;
  onToggleCore?: (coreIndex: number) => void;
  defaultExpanded?: boolean;
}

export const CoreHeatmap: React.FC<CoreHeatmapProps> = ({
  cores,
  maxThreads,
  activeThreads,
  overallTemp,
  lang,
  onToggleCore,
  defaultExpanded = false
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultExpanded);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar';

  return (
    <div 
      className="bg-[#0b0e17]/90 border border-white/10 rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Clickable Header / Toggle Banner */}
      <button
        id="toggle-core-heatmap-accordion-btn"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2 text-start hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white font-cairo">
                {t.coreHeatmapTitle}
              </h4>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.2 rounded font-mono">
                {activeThreads} / {maxThreads} {lang === 'ar' ? 'أنوية' : 'cores'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-tajawal mt-0.5">
              {t.coreHeatmapSubtitle}
            </p>
          </div>
        </div>

        {/* Right Legend & Accordion Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400" dir="ltr">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-tajawal">&lt;55°C</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-300 font-tajawal">55-70°C</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-slate-300 font-tajawal">&gt;70°C</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#141824] border border-white/10 text-cyan-400 text-xs font-tajawal font-bold hover:border-cyan-500/40 transition-all">
            <span>{isOpen ? t.hideCoreHeatmap : t.showCoreHeatmap}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>
      </button>

      {/* Accordion Expandable Grid */}
      {isOpen && (
        <div className="p-3.5 sm:p-4 pt-0 space-y-3 border-t border-white/10 mt-1">
          {/* Cores Grid Matrix */}
          <div className={`grid gap-2 pt-2 ${
            maxThreads <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 
            maxThreads <= 8 ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8' : 
            'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'
          }`}>
            {cores.map((core) => {
              const isActive = core.active;
              
              // Thermal color tiering
              let tempBadgeColor = 'text-slate-500 bg-slate-800/40 border-white/5';
              let tempGlow = 'border-white/5 bg-[#121520]/60';
              let barBg = 'bg-slate-700';

              if (isActive) {
                if (core.temperatureC > 70) {
                  tempBadgeColor = 'text-rose-400 bg-rose-500/15 border-rose-500/30';
                  tempGlow = 'border-rose-500/40 bg-gradient-to-b from-[#1a1219] to-[#121520] shadow-[0_0_15px_rgba(244,63,94,0.15)]';
                  barBg = 'bg-gradient-to-r from-amber-500 to-rose-500';
                } else if (core.temperatureC > 55) {
                  tempBadgeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
                  tempGlow = 'border-amber-500/40 bg-gradient-to-b from-[#1a1712] to-[#121520] shadow-[0_0_15px_rgba(245,158,11,0.1)]';
                  barBg = 'bg-gradient-to-r from-emerald-400 to-amber-400';
                } else {
                  tempBadgeColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
                  tempGlow = 'border-emerald-500/30 bg-gradient-to-b from-[#121a17] to-[#121520] shadow-[0_0_15px_rgba(16,185,129,0.1)]';
                  barBg = 'bg-gradient-to-r from-teal-400 to-emerald-400';
                }
              }

              return (
                <div
                  key={core.id}
                  onClick={() => onToggleCore?.(core.id)}
                  className={`p-2.5 rounded-xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden group cursor-pointer ${tempGlow}`}
                >
                  {/* Header inside core cell */}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isActive ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-slate-600'
                      }`} />
                      <span className="font-bold text-white text-xs">
                        C{core.id}
                      </span>
                    </div>
                    <span className={`text-[9px] px-1 py-0.2 rounded border font-mono ${tempBadgeColor}`}>
                      {isActive ? `${core.temperatureC}°C` : 'OFF'}
                    </span>
                  </div>

                  {/* Middle: Load and Hashrate */}
                  <div className="my-2 space-y-1 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-tajawal">{t.coreLoad}:</span>
                      <span className={`font-bold ${isActive ? 'text-white' : 'text-slate-600'}`} dir="ltr">
                        {isActive ? `${core.load}%` : '0%'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-tajawal">{t.coreHashrate}:</span>
                      <span className={`font-bold ${isActive ? 'text-amber-400' : 'text-slate-600'}`} dir="ltr">
                        {isActive ? formatHashRate(core.hashRate) : '0 H/s'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Progress / Load Bar */}
                  <div className="w-full bg-[#0a0d14] h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                      style={{ width: `${isActive ? Math.max(8, core.load) : 0}%` }}
                    />
                  </div>

                  {/* Subtle hover pulse */}
                  {isActive && (
                    <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-400/5 rounded-full blur-md pointer-events-none group-hover:bg-cyan-400/15 transition-all" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
