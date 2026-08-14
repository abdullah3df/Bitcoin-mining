import React from 'react';
import { MinerStats, NetworkData, PoolConfig, IntensityMode, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { formatDifficulty, formatHashRate } from '../services/bitcoinCrypto';
import { 
  Zap, 
  Cpu, 
  Trophy, 
  Flame, 
  Coins, 
  Server, 
  Gauge, 
  Info,
  Layers,
  Activity,
  Plus,
  Minus,
  Sparkles,
  Thermometer,
  ShieldCheck,
  Radio,
  Timer,
  BrainCircuit,
  Award
} from 'lucide-react';

interface MiningDashboardProps {
  stats: MinerStats;
  network: NetworkData;
  config: PoolConfig;
  onSetThreadCount: (count: number) => void;
  onSetIntensity: (mode: IntensityMode) => void;
  onToggleSmartAutoTune: () => void;
  maxThreads: number;
  onSimulateBlock: () => void;
  onResetStats: () => void;
  lang: Language;
}

export const MiningDashboard: React.FC<MiningDashboardProps> = ({
  stats,
  network,
  config,
  onSetThreadCount,
  onSetIntensity,
  onToggleSmartAutoTune,
  maxThreads,
  onSimulateBlock,
  onResetStats,
  lang
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar';

  const tempColor = stats.temperatureC > 70 ? 'text-rose-400' : stats.temperatureC > 55 ? 'text-amber-400' : 'text-emerald-400';
  const pingColor = stats.pingMs < 50 ? 'text-emerald-400' : stats.pingMs < 150 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="w-full max-w-[720px] mx-auto mt-4 space-y-3.5 font-mono text-slate-300" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Dynamic Thermal & Workload Intensity Control Panel */}
      <div className="bg-[#0e111a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-cairo">
                <span>{t.hardwareMultithreading}</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30 font-mono font-bold">
                  {stats.engineType}
                </span>
                {stats.smartAutoTune && (
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-md font-tajawal font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                    <BrainCircuit className="w-3 h-3 text-cyan-400" />
                    <span>{lang === 'ar' ? 'الضبط الذكي نشط' : 'Smart Active'}</span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-tajawal mt-0.5">
                {stats.activeThreads} {t.coresActive} {maxThreads} {lang === 'ar' ? 'أنوية معالج متوفرة' : 'cores'}
              </div>
            </div>
          </div>

          {/* Thread Count Adjuster */}
          <div className="flex items-center gap-1.5 bg-[#141824] p-1 rounded-xl border border-white/10 shadow-inner" dir="ltr">
            <button
              id="decrease-threads-btn"
              onClick={() => onSetThreadCount(Math.max(1, stats.activeThreads - 1))}
              disabled={stats.activeThreads <= 1}
              className="p-2 rounded-lg bg-[#1c2233] hover:bg-[#252d42] disabled:opacity-30 text-white border border-white/10 cursor-pointer active:scale-95 transition-all shadow-sm"
              title={lang === 'ar' ? 'تقليل أنوية المعالج' : 'Decrease Worker Cores'}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1 font-mono font-black text-sm text-amber-400 min-w-[4.5rem] text-center">
              {stats.activeThreads} {lang === 'ar' ? 'أنوية' : 'Cores'}
            </span>
            <button
              id="increase-threads-btn"
              onClick={() => onSetThreadCount(Math.min(maxThreads, stats.activeThreads + 1))}
              disabled={stats.activeThreads >= maxThreads}
              className="p-2 rounded-lg bg-[#1c2233] hover:bg-[#252d42] disabled:opacity-30 text-white border border-white/10 cursor-pointer active:scale-95 transition-all shadow-sm"
              title={lang === 'ar' ? 'زيادة أنوية المعالج' : 'Increase Worker Cores'}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3-Way Thermal & Duty-Cycle Intensity Switcher + Smart Auto-Tune */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-tajawal">{t.dutyCycle}</span>
            <div className="inline-flex rounded-xl border border-white/10 bg-[#141824] p-1 font-tajawal shadow-inner">
              <button
                id="eco-mode-btn"
                onClick={() => onSetIntensity('eco')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  stats.intensityMode === 'eco' && !stats.smartAutoTune
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.ecoMode}
              </button>
              <button
                id="balanced-mode-btn"
                onClick={() => onSetIntensity('balanced')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  stats.intensityMode === 'balanced' && !stats.smartAutoTune
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.balancedMode}
              </button>
              <button
                id="turbo-mode-btn"
                onClick={() => onSetIntensity('turbo')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  stats.intensityMode === 'turbo' && !stats.smartAutoTune
                    ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.turboMode}
              </button>
            </div>

            {/* Smart Auto-Tune Toggle */}
            <button
              id="toggle-smart-tune-btn"
              onClick={onToggleSmartAutoTune}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border cursor-pointer transition-all font-tajawal ${
                stats.smartAutoTune
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'bg-[#141824] text-slate-400 border-white/10 hover:text-cyan-400'
              }`}
              title={lang === 'ar' ? 'تفعيل وضع الضبط التلقائي الذكي لاستهلاك المعالج وحرارته' : 'Enable Smart Auto-Tuning Engine'}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>{t.smartAutoTune}</span>
            </button>
          </div>

          {/* Core Telemetry Indicators */}
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-[#141824] border border-white/10 px-3 py-1.5 rounded-xl shadow-sm">
              <Thermometer className={`w-3.5 h-3.5 ${tempColor}`} />
              <span className="text-slate-400 text-[10px] font-tajawal">{t.coreTemp}</span>
              <span className={`font-bold font-mono ${tempColor}`} dir="ltr">{stats.temperatureC}°C</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#141824] border border-white/10 px-3 py-1.5 rounded-xl shadow-sm">
              <Radio className={`w-3.5 h-3.5 ${pingColor}`} />
              <span className="text-slate-400 text-[10px] font-tajawal">{t.ping}</span>
              <span className={`font-bold font-mono ${pingColor}`} dir="ltr">{stats.pingMs}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Solo Lottery Summary Cards & Zero-Latency Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Jackpot Prize */}
        <div className="bg-[#0e111a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1 shadow-lg hover:border-amber-500/30 transition-all">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 font-tajawal">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.jackpotReward}</span>
          </div>
          <div className="text-2xl font-mono font-black text-amber-400 text-glow-amber" dir="ltr">
            3.125 BTC
          </div>
          <div className="text-[11px] text-slate-400 font-mono" dir="ltr">
            ≈ ${(3.125 * network.btcPriceUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
          </div>
        </div>

        {/* Personal Best Record */}
        <div className="bg-[#0e111a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1 shadow-lg hover:border-white/20 transition-all">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 font-tajawal">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.bestDifficulty}</span>
          </div>
          <div className="text-2xl font-mono font-black text-white" dir="ltr">
            {formatDifficulty(stats.bestDifficulty)}
          </div>
          <div className="text-[11px] text-slate-400 font-tajawal">
            {t.validShares}: <span className="font-mono font-bold text-emerald-400" dir="ltr">{stats.validShares}</span>
          </div>
        </div>

        {/* Zero-Latency Protocol Sync */}
        <div className="bg-[#0e111a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1 shadow-lg hover:border-emerald-500/30 transition-all">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 font-tajawal">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.zeroLatencySync}</span>
          </div>
          <div className="text-2xl font-mono font-black text-emerald-400" dir="ltr">
            &lt; 1ms Switch
          </div>
          <div className="text-[11px] text-slate-400 font-tajawal truncate">
            {stats.cleanJobsCount} {t.cleanJobsCount} | {stats.staleJobsPrevented} {t.staleStopped}
          </div>
        </div>
      </div>

      {/* Info Notice Card */}
      <div className="bg-[#0e111a]/60 border border-white/10 rounded-2xl p-4 text-xs text-slate-400 flex items-start gap-3 shadow-sm">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] font-cairo">
            {t.educationalNoticeTitle}
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed font-tajawal">
            {t.educationalNoticeDesc}
          </p>
        </div>
      </div>
    </div>
  );
};
