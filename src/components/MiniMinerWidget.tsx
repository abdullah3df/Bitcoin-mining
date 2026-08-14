import React from 'react';
import { 
  Maximize2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Zap, 
  Cpu, 
  Thermometer, 
  Radio, 
  Coins, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Layers
} from 'lucide-react';
import { MinerStats, NetworkData } from '../types';
import { TRANSLATIONS, Language } from '../i18n/translations';

interface MiniMinerWidgetProps {
  stats: MinerStats;
  network: NetworkData;
  isMining: boolean;
  poolConnected: boolean;
  soundEnabled: boolean;
  lang: Language;
  onToggleMining: () => void;
  onToggleSound: () => void;
  onMaximize: () => void;
}

export const MiniMinerWidget: React.FC<MiniMinerWidgetProps> = ({
  stats,
  network,
  isMining,
  poolConnected,
  soundEnabled,
  lang,
  onToggleMining,
  onToggleSound,
  onMaximize
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar';

  const formatHashRate = (rate: number) => {
    if (rate >= 1000000) return `${(rate / 1000000).toFixed(2)} MH/s`;
    if (rate >= 1000) return `${(rate / 1000).toFixed(1)} kH/s`;
    return `${rate.toFixed(0)} H/s`;
  };

  const tempColor = stats.temperatureC > 70 ? 'text-rose-400' : stats.temperatureC > 55 ? 'text-amber-400' : 'text-emerald-400';
  const pingColor = stats.pingMs < 50 ? 'text-emerald-400' : stats.pingMs < 150 ? 'text-amber-400' : 'text-rose-400';

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div 
      className="min-h-screen cyber-grid-bg flex flex-col items-center justify-center p-4 relative overflow-hidden select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Ambient glowing backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />

      {/* Main Minimized Compact Card */}
      <div className="w-full max-w-xl bg-[#0c0f17]/95 backdrop-blur-2xl border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-5 animate-fadeIn">
        
        {/* Header with status & Maximize Button */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 p-[1px] shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <div className="w-full h-full bg-[#0d0f17] rounded-[11px] flex items-center justify-center">
                  <span className="text-lg font-black text-amber-400 font-mono">₿</span>
                </div>
              </div>
              {isMining && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-ping" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white font-cairo">
                  {lang === 'ar' ? 'نيرد ماينر (وضع التصغير)' : 'NerdMiner (Mini Mode)'}
                </h2>
                <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-tajawal">
                  {isMining ? (lang === 'ar' ? 'التعدين نشط' : 'ACTIVE') : (lang === 'ar' ? 'متوقف' : 'PAUSED')}
                </span>
              </div>
              <p className="text-xs text-emerald-400/90 font-tajawal flex items-center gap-1.5 mt-0.5">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>{t.miniModeActive}</span>
              </p>
            </div>
          </div>

          {/* Maximize Button */}
          <button
            id="maximize-full-btn"
            onClick={onMaximize}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs font-tajawal shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer"
            title={t.expandFull}
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden xs:inline">{t.expandFull}</span>
          </button>
        </div>

        {/* Hero Hashrate & Power Bar */}
        <div className="bg-gradient-to-r from-[#0e121c] via-[#141a29] to-[#0e121c] border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-inner">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-tajawal flex items-center gap-1.5 font-bold">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{t.hashrateVelocity}</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded font-mono font-bold">
                {stats.activeThreads} {lang === 'ar' ? 'أنوية' : 'Cores'}
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight text-glow-amber" dir="ltr">
              {formatHashRate(stats.hashRate)}
            </div>
          </div>

          {/* Live mini stats */}
          <div className="text-right space-y-1" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="text-xs text-slate-400 font-tajawal">
              {t.validShares}: <span className="font-mono font-bold text-emerald-400">{stats.validShares}</span>
            </div>
            <div className="text-xs text-slate-400 font-tajawal">
              {t.totalHashes}: <span className="font-mono font-bold text-white">
                {stats.totalHashes > 1e6 ? (stats.totalHashes / 1e6).toFixed(2) + ' M' : stats.totalHashes.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* BTC Price */}
          <div className="bg-[#101420] border border-white/10 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-400 font-tajawal">{t.btcPrice}</div>
            <div className="text-sm font-black text-white font-mono mt-0.5" dir="ltr">
              ${network.btcPriceUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className={`text-[10px] font-bold font-mono mt-0.5 flex items-center justify-center ${network.btcPriceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
              {network.btcPriceChange24h >= 0 ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
              <span>{network.btcPriceChange24h >= 0 ? '+' : ''}{network.btcPriceChange24h.toFixed(1)}%</span>
            </div>
          </div>

          {/* Block Height */}
          <div className="bg-[#101420] border border-white/10 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-400 font-tajawal">{t.blockHeight}</div>
            <div className="text-sm font-black text-amber-400 font-mono mt-0.5" dir="ltr">
              #{network.blockHeight.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5" dir="ltr">
              Era 5 (3.125 ₿)
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-[#101420] border border-white/10 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-400 font-tajawal">{t.coreTemp}</div>
            <div className={`text-sm font-black font-mono mt-0.5 ${tempColor}`} dir="ltr">
              {stats.temperatureC}°C
            </div>
            <div className="text-[10px] text-slate-400 font-tajawal mt-0.5">
              {stats.intensityMode.toUpperCase()}
            </div>
          </div>

          {/* Network / Ping */}
          <div className="bg-[#101420] border border-white/10 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-400 font-tajawal">{t.ping}</div>
            <div className={`text-sm font-black font-mono mt-0.5 ${pingColor}`} dir="ltr">
              {stats.pingMs}ms
            </div>
            <div className="text-[10px] text-emerald-400 font-tajawal mt-0.5 font-bold">
              {poolConnected ? t.stratumActive : t.syncing}
            </div>
          </div>
        </div>

        {/* Quick Compact Controls */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <div className="flex items-center gap-2">
            <button
              id="mini-toggle-mining-btn"
              onClick={onToggleMining}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs font-tajawal cursor-pointer transition-all active:scale-95 ${
                isMining
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              }`}
            >
              {isMining ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isMining ? t.stopMining : t.startMining}</span>
            </button>

            <button
              id="mini-toggle-sound-btn"
              onClick={onToggleSound}
              className={`p-2 rounded-xl border cursor-pointer transition-all ${
                soundEnabled
                  ? 'bg-[#141824] text-amber-400 border-amber-500/30'
                  : 'bg-[#141824] text-slate-500 border-white/10'
              }`}
              title={soundEnabled ? t.soundOn : t.soundOff}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-right text-[11px] text-slate-400 font-tajawal flex items-center gap-2">
            <span>{t.uptime}</span>
            <span className="font-mono font-bold text-white bg-[#141824] px-2 py-0.5 rounded border border-white/10" dir="ltr">
              {formatUptime(stats.uptimeSeconds)}
            </span>
          </div>
        </div>

      </div>

      {/* Floating Expand Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500 font-tajawal">
          {lang === 'ar' 
            ? 'يمكنك ترك هذه النافذة مفتوحة أو التبديل بين النوافذ بينما تواصل الأنوية التعدين وحساب التجزئات.' 
            : 'You can leave this tab running in the background while Web Workers continue hashing at peak efficiency.'}
        </p>
      </div>
    </div>
  );
};
