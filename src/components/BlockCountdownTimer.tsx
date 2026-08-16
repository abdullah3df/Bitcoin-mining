import React, { useState, useEffect } from 'react';
import { NetworkData, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  Hourglass, 
  Timer, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Clock, 
  Flame,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface BlockCountdownTimerProps {
  network: NetworkData;
  lang: Language;
  variant?: 'compact' | 'full' | 'header';
}

export const BlockCountdownTimer: React.FC<BlockCountdownTimerProps> = ({
  network,
  lang,
  variant = 'full'
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar';

  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Standard Bitcoin block interval target = 10 minutes (600 seconds)
  const TARGET_BLOCK_SECONDS = 600;
  const lastBlockTimestamp = network.lastBlockTime || (currentTime - 240000); // fallback 4m ago
  const elapsedSeconds = Math.max(0, Math.floor((currentTime - lastBlockTimestamp) / 1000));
  const remainingSeconds = Math.max(0, TARGET_BLOCK_SECONDS - elapsedSeconds);
  const isOvertime = elapsedSeconds > TARGET_BLOCK_SECONDS;
  const overtimeSeconds = isOvertime ? elapsedSeconds - TARGET_BLOCK_SECONDS : 0;

  // Format MM:SS helper
  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress percentage (capped at 100% for bar, with overtime glow)
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSeconds / TARGET_BLOCK_SECONDS) * 100)));

  // Phase computation
  let phaseColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  let phaseText = t.blockPhaseEarly;
  let phaseGlow = 'from-emerald-500/20 to-emerald-500/5';
  let progressBg = 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400';

  if (isOvertime) {
    phaseColor = 'text-rose-400 bg-rose-500/15 border-rose-500/40 animate-pulse';
    phaseText = t.blockPhaseOvertime;
    phaseGlow = 'from-rose-500/20 to-rose-500/5';
    progressBg = 'bg-gradient-to-r from-amber-500 via-rose-500 to-rose-400';
  } else if (elapsedSeconds > 480) { // 8 to 10 mins
    phaseColor = 'text-amber-300 bg-amber-500/15 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    phaseText = t.blockPhaseImminent;
    phaseGlow = 'from-amber-500/20 to-amber-500/5';
    progressBg = 'bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500';
  } else if (elapsedSeconds > 240) { // 4 to 8 mins
    phaseColor = 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30';
    phaseText = t.blockPhaseMid;
    phaseGlow = 'from-cyan-500/20 to-cyan-500/5';
    progressBg = 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-cyan-500';
  }

  const activeBlockHeight = network.blockHeight + 1;
  const startTimeFormatted = new Date(lastBlockTimestamp).toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Header compact pill variant
  if (variant === 'header') {
    return (
      <div 
        className="p-2.5 rounded-xl bg-[#121520]/90 border border-white/10 shadow-sm flex flex-col justify-between"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-tajawal">
          <span className="flex items-center gap-1 text-slate-300">
            <Hourglass className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />
            <span>{lang === 'ar' ? 'عداد الكتلة' : 'Block Timer'}</span>
          </span>
          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${phaseColor}`}>
            {isOvertime ? `+${formatTime(overtimeSeconds)}` : formatTime(remainingSeconds)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1" dir="ltr">
          <span className="text-xs font-bold text-white font-mono flex items-center gap-1">
            <span className="text-slate-400 font-normal">#{activeBlockHeight}</span>
          </span>
          <span className="text-[11px] font-bold font-mono text-amber-400">
            {isOvertime ? `+${formatTime(overtimeSeconds)}` : `-${formatTime(remainingSeconds)}`}
          </span>
        </div>
        {/* Micro progress bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-1 mt-1.5 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${progressBg}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  // Full detailed card variant
  return (
    <div 
      className="w-full bg-[#0e111a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5 font-mono text-slate-300"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Title & Phase Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${phaseGlow} border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]`}>
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white font-cairo flex items-center gap-2">
              <span>{t.blockCountdownTitle}</span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono">
                #{activeBlockHeight}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-tajawal mt-0.5">
              {t.targetBlockTime}
            </p>
          </div>
        </div>

        {/* Phase Badge */}
        <div className={`px-2.5 py-1 rounded-xl text-xs font-bold font-tajawal border flex items-center gap-1.5 shadow-sm ${phaseColor}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>{phaseText}</span>
        </div>
      </div>

      {/* Primary Big Countdown Displays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Start Time & Elapsed Box */}
        <div className="p-3 rounded-xl bg-[#141824] border border-white/10 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[11px] text-slate-400 font-tajawal flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.blockStartedAt}</span>
            </div>
            <div className="text-sm font-bold text-white font-mono" dir="ltr">
              {startTimeFormatted}
            </div>
          </div>
          <div className="text-right" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="text-[10px] text-slate-500 font-tajawal">{t.timeAgo}</div>
            <div className="text-base font-bold font-mono text-cyan-400" dir="ltr">
              {formatTime(elapsedSeconds)}
            </div>
          </div>
        </div>

        {/* Next Block Countdown Box */}
        <div className={`p-3 rounded-xl border flex items-center justify-between ${
          isOvertime 
            ? 'bg-rose-950/20 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
            : 'bg-[#141824] border-white/10'
        }`}>
          <div className="space-y-0.5">
            <div className="text-[11px] text-slate-400 font-tajawal flex items-center gap-1.5">
              <Hourglass className={`w-3.5 h-3.5 ${isOvertime ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
              <span>{t.expectedNextBlock}</span>
            </div>
            <div className="text-sm font-bold text-white font-mono" dir="ltr">
              #{activeBlockHeight}
            </div>
          </div>
          <div className="text-right" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="text-[10px] text-slate-500 font-tajawal">
              {isOvertime ? t.overtime : t.remaining}
            </div>
            <div className={`text-xl font-black font-mono tracking-tight ${
              isOvertime ? 'text-rose-400 animate-pulse' : 'text-amber-400'
            }`} dir="ltr">
              {isOvertime ? `+${formatTime(overtimeSeconds)}` : formatTime(remainingSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar & Epoch Indicator */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[11px] text-slate-400 font-tajawal flex items-center gap-1">
            <Layers className="w-3 h-3 text-amber-400" />
            <span>{t.blockEpochProgress}</span>
          </span>
          <span className="font-bold text-amber-400" dir="ltr">
            {progressPercent}% {isOvertime && <span className="text-rose-400 font-normal text-[10px]">(Overtime)</span>}
          </span>
        </div>

        {/* Animated Bar */}
        <div className="w-full bg-[#141824] p-0.5 rounded-full border border-white/10 overflow-hidden shadow-inner">
          <div 
            className={`h-2.5 rounded-full transition-all duration-1000 shadow-sm ${progressBg}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Footnote on Poisson Process */}
        <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-tajawal pt-1">
          <span>
            {lang === 'ar' 
              ? '💡 زمن الكتلة المستهدف هو 10 دقائق في المتوسط، ويتم حل الكتل عشوائياً بواسطة معدني العالم وفق توزيع بواسون (Poisson Process).'
              : '💡 Bitcoin block generation follows a Poisson distribution targeting a 10-minute average interval.'}
          </span>
          <span className="text-amber-400/80 font-mono" dir="ltr">
            {network.unconfirmedTxs.toLocaleString()} {lang === 'ar' ? 'معاملة بالانتظار' : 'txs in mempool'}
          </span>
        </div>
      </div>
    </div>
  );
};
