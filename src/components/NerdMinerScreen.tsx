import React, { useState, useEffect, useMemo } from 'react';
import { 
  MinerStats, 
  NetworkData, 
  PoolConfig, 
  ScreenMode, 
  MiningJob,
  IntensityMode,
  Language 
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { formatDifficulty, formatHashRate } from '../services/bitcoinCrypto';
import { 
  Wifi, 
  Zap, 
  Trophy, 
  Flame, 
  Activity, 
  Layers, 
  Cpu, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Hash,
  ShieldCheck,
  Radio,
  Server,
  Thermometer,
  Gauge,
  Sparkles,
  BrainCircuit,
  Hourglass,
  Timer
} from 'lucide-react';
import { ShareParticlesCanvas } from './ShareParticlesCanvas';

interface NerdMinerScreenProps {
  stats: MinerStats;
  network: NetworkData;
  config: PoolConfig;
  currentJob: MiningJob | null;
  mode: ScreenMode;
  onCycleMode: () => void;
  poolConnected: boolean;
  poolMessage: string;
  lang: Language;
  onSetIntensity?: (mode: IntensityMode) => void;
}

export const NerdMinerScreen: React.FC<NerdMinerScreenProps> = ({
  stats,
  network,
  config,
  currentJob,
  mode,
  onCycleMode,
  poolConnected,
  poolMessage,
  lang,
  onSetIntensity
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar';

  const [timeStr, setTimeStr] = useState<string>('');
  const [matrixLines, setMatrixLines] = useState<string[]>([]);
  const [matrixNonce, setMatrixNonce] = useState<string>('00000000');

  // Clock updater
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  // Matrix stream simulation
  useEffect(() => {
    if (mode !== 'matrix') return;

    const interval = setInterval(() => {
      const randomHex = () => Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const n = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
      setMatrixNonce(n);
      setMatrixLines(prev => [
        `0000000000000000000${randomHex().substring(0, 8)}... [N:0x${n}]`,
        ...prev.slice(0, 5)
      ]);
    }, 200);

    return () => clearInterval(interval);
  }, [mode]);

  // Solo lottery daily odds calculation
  const chancePerDay = useMemo(() => {
    const userH = Math.max(1, stats.hashRate);
    const netH = (network.networkHashrateEH || 700) * 1e18;
    const blocksPerDay = 144;
    return (userH / netH) * blocksPerDay;
  }, [stats.hashRate, network.networkHashrateEH]);

  const yearsToBlock = chancePerDay > 0 ? (1 / chancePerDay) / 365.25 : 0;

  // Render SVG Sparkline for hashrate trend
  const sparklineData = useMemo(() => {
    const history = stats.hashRateHistory.length > 0 ? stats.hashRateHistory : [stats.hashRate];
    const max = Math.max(10, ...history);
    const width = 140;
    const height = 24;
    const points = history.map((val, idx) => {
      const x = (idx / Math.max(1, history.length - 1)) * width;
      const y = height - (val / max) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return { points, width, height };
  }, [stats.hashRateHistory, stats.hashRate]);

  // Thermal badge coloring
  const tempColor = stats.temperatureC > 70 ? 'text-rose-400' : stats.temperatureC > 55 ? 'text-[#f59e0b]' : 'text-[#10b981]';
  const pingColor = stats.pingMs < 50 ? 'text-[#10b981]' : stats.pingMs < 150 ? 'text-[#f59e0b]' : 'text-rose-400';

  // Real-time Block Lifecycle Countdown (10m Target)
  const TARGET_BLOCK_SEC = 600;
  const lastBlockTimestamp = network.lastBlockTime || (Date.now() - 240000);
  const elapsedBlockSec = Math.max(0, Math.floor((Date.now() - lastBlockTimestamp) / 1000));
  const remainingBlockSec = Math.max(0, TARGET_BLOCK_SEC - elapsedBlockSec);
  const isBlockOvertime = elapsedBlockSec > TARGET_BLOCK_SEC;
  const overtimeBlockSec = isBlockOvertime ? elapsedBlockSec - TARGET_BLOCK_SEC : 0;
  const blockCountdownStr = isBlockOvertime
    ? `+${Math.floor(overtimeBlockSec / 60).toString().padStart(2, '0')}:${(overtimeBlockSec % 60).toString().padStart(2, '0')}`
    : `${Math.floor(remainingBlockSec / 60).toString().padStart(2, '0')}:${(remainingBlockSec % 60).toString().padStart(2, '0')}`;
  const blockElapsedStr = `${Math.floor(elapsedBlockSec / 60).toString().padStart(2, '0')}:${(elapsedBlockSec % 60).toString().padStart(2, '0')}`;
  const blockProgressPct = Math.min(100, Math.round((elapsedBlockSec / TARGET_BLOCK_SEC) * 100));

  const modeName = t.screenModes[mode] || mode;

  return (
    <div 
      onClick={onCycleMode}
      dir={isRtl ? 'rtl' : 'ltr'}
      className="w-full h-full bg-[#05070a] text-slate-100 p-3.5 sm:p-5 flex flex-col justify-between select-none relative overflow-hidden font-mono cursor-pointer transition-all rounded-lg"
      style={{
        boxShadow: 'inset 0 0 25px rgba(0,0,0,0.95)'
      }}
      title={isRtl ? 'انقر على الشاشة لتبديل الأوضاع' : 'Click screen to cycle display modes'}
    >
      {/* Subtle CRT Scanline overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15 z-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.8) 50%)',
          backgroundSize: '100% 3px'
        }}
      />

      {/* Real-time Valid Share & Block Won Canvas Particle Physics Overlay */}
      <ShareParticlesCanvas
        validSharesCount={stats.validShares}
        bestDifficulty={stats.bestDifficulty}
        blocksFoundCount={stats.blocksFound}
      />

      {/* TOP HEADER BAR */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-2.5 text-[11px] font-mono">
        {/* Left: Device Name & Mode Tag */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-ping" />
          <span className="font-bold text-white tracking-wide font-cairo">
            {lang === 'ar' ? 'نيرد ماينر v2' : 'NERDMINER v2'}
          </span>
          <span className="bg-[#141926] text-amber-300 px-2 py-0.5 rounded text-[9px] uppercase border border-amber-500/30 font-tajawal font-bold">
            {modeName}
          </span>
          {stats.smartAutoTune && (
            <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[9px] font-bold font-tajawal">
              <BrainCircuit className="w-2.5 h-2.5" />
              <span>{lang === 'ar' ? 'الضبط الذكي' : 'SMART'}</span>
            </span>
          )}
        </div>

        {/* Center: Real-time Ping Latency & Thermal Status */}
        <div className="hidden sm:flex items-center gap-2.5 text-[10px]">
          <div className="flex items-center gap-1 bg-[#10141f] px-2.5 py-0.5 rounded border border-white/10" dir="ltr">
            <Radio className={`w-3 h-3 ${pingColor}`} />
            <span className={`font-bold ${pingColor}`}>{stats.pingMs === 0 ? '--' : stats.pingMs}ms</span>
          </div>
          <div 
            className="flex items-center gap-1 bg-[#10141f] px-2.5 py-0.5 rounded border border-white/10" 
            dir="ltr"
            title={lang === 'ar' ? 'حرارة تقديرية (محاكاة برمجية)' : 'Estimated Temp (Software Model)'}
          >
            <Thermometer className={`w-3 h-3 ${tempColor}`} />
            <span className="text-[9px] text-slate-500 mr-0.5">Est.</span>
            <span className={`font-bold ${tempColor}`}>{stats.temperatureC}°C</span>
          </div>
        </div>

        {/* Right: Clock & Connection Status */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-slate-300" dir="ltr">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-white font-bold font-mono tracking-wider">{timeStr || '12:00:00'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className={`w-3.5 h-3.5 ${poolConnected ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
          </div>
        </div>
      </div>

      {/* MAIN SCREEN DISPLAY MODES */}
      <div className="relative z-10 my-auto py-1">
        {/* SCREEN MODE 1: CLASSIC NERDMINER 2.8" TFT DISPLAY */}
        {mode === 'nerdminer' && (
          <div className="space-y-2.5">
            {/* HERO HASHRATE VELOCITY DISPLAY WITH SVG TREND CHART */}
            <div className="bg-gradient-to-r from-[#0d1017] via-[#121622] to-[#0d1017] border border-white/10 rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <div>
                <div className="text-[11px] text-slate-300 font-tajawal font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{t.hashrateVelocity}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40 font-mono font-bold">
                    {stats.engineType}
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1 flex items-baseline gap-2 font-mono text-glow-amber" dir="ltr">
                  <span className="text-amber-400">{formatHashRate(stats.hashRate)}</span>
                </div>
              </div>

              {/* Real-time Hashrate Sparkline Chart */}
              <div className="text-right flex flex-col items-end">
                <div className="w-[120px] sm:w-[150px] h-[30px] flex items-center justify-end" dir="ltr">
                  <svg width="100%" height="28" className="overflow-visible">
                    <defs>
                      <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={sparklineData.points}
                    />
                  </svg>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                  <span>{lang === 'ar' ? 'الجهد' : 'Load'}: {stats.cpuLoadPercent}%</span>
                  <span className="text-white/20">•</span>
                  <span className="text-amber-400 uppercase font-bold font-tajawal">
                    {stats.intensityMode === 'eco' ? (lang === 'ar' ? 'اقتصادي' : 'ECO') :
                     stats.intensityMode === 'turbo' ? (lang === 'ar' ? 'توربو' : 'TURBO') : 
                     (lang === 'ar' ? 'متوازن' : 'BALANCED')}
                  </span>
                </div>
              </div>
            </div>

            {/* 4-BLOCK METRIC GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Total Hashes */}
              <div className="bg-[#0e111a] border border-white/10 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center shadow-sm">
                <div className="text-[10px] text-slate-400 font-tajawal mb-0.5">{t.totalHashes}</div>
                <div className="text-base sm:text-lg font-black text-white font-mono" dir="ltr">
                  {stats.totalHashes > 1e9 
                    ? (stats.totalHashes / 1e9).toFixed(2) + ' G'
                    : stats.totalHashes > 1e6 
                    ? (stats.totalHashes / 1e6).toFixed(2) + ' M'
                    : stats.totalHashes > 1e3
                    ? (stats.totalHashes / 1e3).toFixed(1) + ' k'
                    : stats.totalHashes.toLocaleString()}
                </div>
                <div className="text-[10px] text-amber-400 mt-0.5 font-mono" dir="ltr">
                  + {((stats.hashRate || 0) / 1000).toFixed(1)}k / sec
                </div>
              </div>

              {/* Best Diff */}
              <div className="bg-[#0e111a] border border-white/10 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center shadow-sm">
                <div className="text-[10px] text-slate-400 font-tajawal mb-0.5">{t.bestDifficulty}</div>
                <div className="text-base sm:text-lg font-black text-amber-400 font-mono" dir="ltr">
                  {formatDifficulty(stats.bestDifficulty)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono" dir="ltr">
                  {lang === 'ar' ? 'الشبكة' : 'Global'}: {network.networkDifficulty.toFixed(1)}T
                </div>
              </div>

              {/* Valid Shares */}
              <div className="bg-[#0e111a] border border-white/10 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center shadow-sm">
                <div className="text-[10px] text-slate-400 font-tajawal mb-0.5">{t.validShares}</div>
                <div className="text-base sm:text-lg font-black text-emerald-400 font-mono" dir="ltr">
                  {stats.validShares} <span className="text-xs text-slate-500 font-normal">/ {stats.rejectedShares}</span>
                </div>
                <div className="text-[10px] text-emerald-400/90 mt-0.5 font-mono" dir="ltr">
                  {t.acceptedRate}: {stats.validShares + stats.rejectedShares > 0 
                    ? ((stats.validShares / (stats.validShares + stats.rejectedShares)) * 100).toFixed(0) + '%'
                    : '100%'}
                </div>
              </div>

              {/* Blocks Found */}
              <div className="bg-[#0e111a] border border-white/10 rounded-xl p-2.5 sm:p-3 flex flex-col justify-center shadow-sm">
                <div className="text-[10px] text-slate-400 font-tajawal mb-0.5">{t.blocksFound}</div>
                <div className={`text-base sm:text-lg font-black font-mono ${stats.blocksFound > 0 ? 'text-amber-400' : 'text-rose-400'}`} dir="ltr">
                  {stats.blocksFound}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono" dir="ltr">
                  {t.soloLuck}: {(chancePerDay * 100).toFixed(5)}%
                </div>
              </div>
            </div>

            {/* LIVE BITCOIN & BLOCKCHAIN TICKER BAR */}
            <div className="bg-[#0e111a] border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="text-slate-300 flex items-center gap-1.5 font-mono" dir="ltr">
                  <span className="text-[10px] uppercase text-slate-400 font-tajawal">{t.btcPrice}:</span>
                  <span className="text-white font-black">
                    ${network.btcPriceUsd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className={`flex items-center text-[10px] font-bold font-mono ${network.btcPriceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} dir="ltr">
                  {network.btcPriceChange24h >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  <span>{network.btcPriceChange24h >= 0 ? '+' : ''}{network.btcPriceChange24h.toFixed(2)}%</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-slate-300 text-[10px] uppercase tracking-wider font-mono" dir="ltr">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-tajawal">{lang === 'ar' ? 'الكتلة' : 'HEIGHT'}:</span>
                  <span className="text-amber-400 font-bold">#{network.blockHeight.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 bg-[#141824] px-2 py-0.5 rounded border border-white/10" title={lang === 'ar' ? 'العد التنازلي المتوقع للكتلة التالية' : 'Estimated Block Countdown'}>
                  <Hourglass className={`w-2.5 h-2.5 ${isBlockOvertime ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
                  <span className={`font-bold ${isBlockOvertime ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                    {blockCountdownStr}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN MODE 2: CLOCK & MEMPOOL HALVING MATRIX */}
        {mode === 'clock' && (
          <div className="space-y-2.5">
            {/* Real-time Block Lifecycle & Countdown Banner */}
            <div className="bg-gradient-to-r from-[#0d1017] via-[#141824] to-[#0d1017] border border-white/10 rounded-xl p-3 shadow-md">
              <div className="flex items-center justify-between text-[11px] font-tajawal pb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Hourglass className={`w-3.5 h-3.5 ${isBlockOvertime ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
                  <span>{t.blockCountdownTitle}</span>
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30" dir="ltr">
                    #{network.blockHeight + 1}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  isBlockOvertime ? 'text-rose-400 bg-rose-500/15 border-rose-500/40 animate-pulse' :
                  elapsedBlockSec > 480 ? 'text-amber-300 bg-amber-500/15 border-amber-500/40' :
                  'text-emerald-400 bg-emerald-500/15 border-emerald-500/40'
                }`}>
                  {isBlockOvertime ? t.blockPhaseOvertime : elapsedBlockSec > 480 ? t.blockPhaseImminent : t.blockPhaseEarly}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2" dir="ltr">
                <div className="bg-[#0b0e16] p-2 rounded-lg border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-slate-400 font-tajawal">{t.blockStartedAt}</div>
                    <div className="text-xs font-bold text-white font-mono">{blockElapsedStr} {t.timeAgo}</div>
                  </div>
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className={`p-2 rounded-lg border flex items-center justify-between ${
                  isBlockOvertime ? 'bg-rose-950/30 border-rose-500/40' : 'bg-[#0b0e16] border-white/5'
                }`}>
                  <div>
                    <div className="text-[9px] text-slate-400 font-tajawal">{t.expectedNextBlock}</div>
                    <div className={`text-sm font-black font-mono ${isBlockOvertime ? 'text-rose-400' : 'text-amber-400'}`}>
                      {blockCountdownStr}
                    </div>
                  </div>
                  <Timer className={`w-3.5 h-3.5 ${isBlockOvertime ? 'text-rose-400' : 'text-amber-400'}`} />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#161a26] h-1.5 rounded-full mt-2 overflow-hidden border border-white/5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isBlockOvertime 
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                      : 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400'
                  }`}
                  style={{ width: `${blockProgressPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#0e111a] border border-white/10 rounded-xl p-3 shadow-sm">
                <div className="text-[10px] text-slate-400 font-tajawal flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.blockHeight}</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1 font-mono tracking-tight" dir="ltr">
                  #{network.blockHeight.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-tajawal">
                  {t.mempoolTxs}: <span className="text-slate-200 font-mono font-bold" dir="ltr">{network.unconfirmedTxs.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-[#0e111a] border border-white/10 rounded-xl p-3 shadow-sm">
                <div className="text-[10px] text-slate-400 font-tajawal flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.halvingProgress}</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1 font-mono tracking-tight" dir="ltr">
                  {network.halvingProgress.toFixed(1)}%
                </div>
                <div className="w-full bg-[#161a26] h-1.5 rounded-full mt-1.5 overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_15px_#f59e0b] h-full rounded-full transition-all"
                    style={{ width: `${network.halvingProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recommended Fees */}
            <div className="bg-[#0e111a] border border-white/10 rounded-xl p-3 shadow-sm">
              <div className="text-[10px] text-slate-300 font-tajawal mb-2 flex items-center justify-between">
                <span className="font-bold">{t.recommendedFees}</span>
                <span className="text-amber-400 font-mono font-bold" dir="ltr">{network.networkHashrateEH.toFixed(1)} EH/s</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-[#141824] border border-white/5 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-400 font-tajawal">{t.low}</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">{network.minimumFee} sat</div>
                </div>
                <div className="bg-[#141824] border border-white/5 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-400 font-tajawal">{t.economy}</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono">{network.hourFee} sat</div>
                </div>
                <div className="bg-[#141824] border border-white/5 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-400 font-tajawal">{t.halfHour}</div>
                  <div className="text-sm font-bold text-amber-400 font-mono">{network.halfHourFee} sat</div>
                </div>
                <div className="bg-[#141824] border border-white/5 p-2 rounded-lg">
                  <div className="text-[9px] text-slate-400 font-tajawal">{t.fastest}</div>
                  <div className="text-sm font-bold text-rose-400 font-mono">{network.fastestFee} sat</div>
                </div>
              </div>
            </div>

            {/* Current Mining Job details */}
            <div className="bg-[#0e111a] border border-white/10 rounded-xl p-2.5 text-[10px] text-slate-400 flex items-center justify-between font-mono" dir="ltr">
              <div className="truncate">
                JOB ID: <span className="text-cyan-400 font-mono font-bold">{currentJob?.jobId || 'INIT_JOB'}</span> | PREV: <span className="text-slate-400 font-mono">{currentJob?.prevHash?.substring(0, 10) || '00000000'}...</span>
              </div>
              <div className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                &lt;1ms SWITCH
              </div>
            </div>
          </div>
        )}

        {/* SCREEN MODE 3: CRYPTO HASH STREAM & MATRIX */}
        {mode === 'matrix' && (
          <div className="space-y-2.5">
            <div className="bg-[#090c13] border border-white/10 rounded-xl p-3.5 font-mono text-[11px] leading-tight text-emerald-400 shadow-inner" dir="ltr">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2 mb-2 flex items-center justify-between font-tajawal">
                <span>// Live Double SHA-256 Nonce Stream [Midstate Active]</span>
                <span className="animate-pulse text-emerald-400 font-bold font-mono">{lang === 'ar' ? '● نشط' : '● ACTIVE'}</span>
              </div>
              <div className="space-y-1.5 overflow-hidden h-24 font-mono">
                {matrixLines.map((line, idx) => (
                  <div key={idx} className={`truncate ${idx === 0 ? 'text-white font-bold' : 'text-emerald-400/70'}`}>
                    <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                    {idx === 0 ? '▶ 0x' : '  0x'}{line}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#0e111a] border border-white/10 rounded-xl p-3 font-mono" dir="ltr">
              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[9px]">Header Midstate:</span>
                <div className="text-cyan-400 truncate font-mono font-bold mt-0.5">
                  {currentJob?.version || '20000000'}-{currentJob?.nBits || '17088b39'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase tracking-wider text-[9px]">Nonce Iteration:</span>
                <div className="text-amber-400 font-mono font-black mt-0.5 text-xs">
                  0x{matrixNonce}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN MODE 4: SOLO LOTTERY STATS & ODDS */}
        {mode === 'stats' && (
          <div className="space-y-2.5 bg-[#0e111a] border border-white/10 rounded-xl p-4 text-xs shadow-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-amber-400 font-black text-sm flex items-center gap-1.5 font-cairo">
                <Trophy className="w-4 h-4 text-amber-400" />
                {t.oddsTitle}
              </span>
              <span className="text-slate-300 text-[10px] font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30" dir="ltr">
                1 Block = 3.125 BTC + Fees
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1 text-[11px]">
              <div className="bg-[#141824] border border-white/5 p-3 rounded-xl">
                <div className="text-slate-400 font-tajawal text-[10px]">{t.yourHashrate}</div>
                <div className="text-base font-black text-amber-400 mt-0.5 font-mono" dir="ltr">
                  {formatHashRate(stats.hashRate)}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5 font-mono" dir="ltr">
                  Net: {network.networkHashrateEH.toFixed(1)} EH/s
                </div>
              </div>

              <div className="bg-[#141824] border border-white/5 p-3 rounded-xl">
                <div className="text-slate-400 font-tajawal text-[10px]">{t.jackpotValue}</div>
                <div className="text-base font-black text-emerald-400 mt-0.5 font-mono" dir="ltr">
                  ${(3.125 * network.btcPriceUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5 font-mono" dir="ltr">
                  3.125 BTC Reward
                </div>
              </div>
            </div>

            <div className="bg-[#141824] border border-white/5 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5 font-tajawal">
              <div className="flex justify-between items-center">
                <span>{t.dailyProbability}</span>
                <span className="text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded" dir="ltr">
                  {(chancePerDay * 100).toExponential(3)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>{t.estimatedTime}</span>
                <span className="text-cyan-400 font-mono font-bold" dir="ltr">
                  {yearsToBlock > 1000 ? `${(yearsToBlock / 1000).toFixed(1)} ${t.thousandYears}` : `${yearsToBlock.toFixed(1)} ${t.years}`}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1 border-t border-white/5 mt-1">
                {t.oddsFootnote}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER */}
      <div className="relative z-10 border-t border-white/10 pt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 truncate max-w-[150px] sm:max-w-[200px]">
          <span className="font-tajawal text-slate-400">{t.pool}:</span>
          <span className="text-slate-200 font-semibold truncate" dir="ltr">{config.url}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1" dir="ltr">
            <span className="text-slate-400 font-tajawal">{t.latency}:</span>
            <span className={`font-bold ${pingColor}`}>{stats.pingMs === 0 ? '--' : stats.pingMs}ms</span>
          </div>
          <span className="text-white/20">•</span>
          <div className="flex items-center gap-1">
            <Radio className={`w-3 h-3 ${poolConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className={`font-bold font-tajawal ${poolConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {poolConnected ? t.stratumActive : t.syncing}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
