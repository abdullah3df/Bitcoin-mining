import React, { useState, useEffect, useMemo } from 'react';
import { MinerStats, NetworkData, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { formatDifficulty, formatHashRate } from '../services/bitcoinCrypto';
import { 
  Trophy, 
  Timer, 
  Percent, 
  Zap, 
  Coins, 
  Clock, 
  Sparkles, 
  Calculator, 
  Sliders, 
  CheckCircle2, 
  Info,
  TrendingUp,
  Award,
  Dice5,
  DollarSign,
  Calendar,
  Flame,
  HelpCircle
} from 'lucide-react';

interface WinOddsCalculatorProps {
  stats: MinerStats;
  network: NetworkData;
  lang: Language;
}

export const WinOddsCalculator: React.FC<WinOddsCalculatorProps> = ({
  stats,
  network,
  lang
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar';

  // Custom Simulator state (allows user to test custom hashrates or use live hashrate)
  const [useLiveHashrate, setUseLiveHashrate] = useState<boolean>(true);
  const [simulatedHashrate, setSimulatedHashrate] = useState<number>(100000); // default 100 kH/s

  // Effective hashrate for calculation
  const effectiveHashrate = useLiveHashrate 
    ? (stats.isMining && stats.hashRate > 0 ? stats.hashRate : 75000) 
    : simulatedHashrate;

  // Real Bitcoin Difficulty (1 Diff = 2^32 hashes)
  // network.difficulty in network object (e.g. 84e12 for 84 Trillion)
  const difficulty = network.difficulty > 0 ? network.difficulty : 84000000000000;
  const hashesPerBlockExpected = difficulty * 4294967296; // difficulty * 2^32

  // Expected Time to Find a Block in Seconds
  const expectedSeconds = useMemo(() => {
    if (effectiveHashrate <= 0) return Infinity;
    return hashesPerBlockExpected / effectiveHashrate;
  }, [hashesPerBlockExpected, effectiveHashrate]);

  // Mathematical Odds:
  // Chance per 10-minute block (600 seconds)
  const oddsPerBlock = useMemo(() => {
    if (effectiveHashrate <= 0) return 0;
    return (effectiveHashrate * 600) / hashesPerBlockExpected;
  }, [effectiveHashrate, hashesPerBlockExpected]);

  // Daily odds
  const oddsDaily = useMemo(() => {
    if (effectiveHashrate <= 0) return 0;
    return 1 - Math.pow(1 - (effectiveHashrate / hashesPerBlockExpected), 86400);
  }, [effectiveHashrate, hashesPerBlockExpected]);

  // 1-in-N odds ratio per day
  const oneInDaily = useMemo(() => {
    if (oddsDaily <= 0) return 0;
    return Math.round(1 / oddsDaily);
  }, [oddsDaily]);

  // 1-in-N odds ratio per 10-min block
  const oneInBlock = useMemo(() => {
    if (oddsPerBlock <= 0) return 0;
    return Math.round(1 / oddsPerBlock);
  }, [oddsPerBlock]);

  // Format expected time into human friendly units
  const formattedExpectedTime = useMemo(() => {
    if (!isFinite(expectedSeconds) || expectedSeconds <= 0) {
      return { main: lang === 'ar' ? 'غير محدود' : 'Infinite', sub: '' };
    }

    const secInMinute = 60;
    const secInHour = 3600;
    const secInDay = 86400;
    const secInYear = 31536000;

    if (expectedSeconds < secInHour) {
      const minutes = Math.round(expectedSeconds / secInMinute);
      return {
        main: `${minutes} ${lang === 'ar' ? 'دقيقة' : 'Minutes'}`,
        sub: `≈ ${(expectedSeconds / secInMinute).toFixed(1)} min`
      };
    } else if (expectedSeconds < secInDay * 2) {
      const hours = (expectedSeconds / secInHour).toFixed(1);
      return {
        main: `${hours} ${lang === 'ar' ? 'ساعة' : 'Hours'}`,
        sub: `≈ ${(expectedSeconds / secInHour).toFixed(1)} hr`
      };
    } else if (expectedSeconds < secInYear * 2) {
      const days = Math.round(expectedSeconds / secInDay);
      return {
        main: `${days.toLocaleString()} ${lang === 'ar' ? 'يوم' : 'Days'}`,
        sub: `≈ ${(expectedSeconds / secInDay).toFixed(1)} d`
      };
    } else if (expectedSeconds < secInYear * 1000) {
      const years = (expectedSeconds / secInYear).toFixed(1);
      return {
        main: `${parseFloat(years).toLocaleString()} ${lang === 'ar' ? 'سنة' : 'Years'}`,
        sub: `≈ ${(expectedSeconds / secInDay).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${lang === 'ar' ? 'يوم' : 'days'}`
      };
    } else if (expectedSeconds < secInYear * 1000000) {
      const thousandYears = (expectedSeconds / (secInYear * 1000)).toFixed(1);
      return {
        main: `${parseFloat(thousandYears).toLocaleString()} ${lang === 'ar' ? 'ألف سنة' : 'k Years'}`,
        sub: `≈ ${parseFloat((expectedSeconds / secInYear).toFixed(0)).toLocaleString()} ${lang === 'ar' ? 'سنة' : 'years'}`
      };
    } else {
      const millionYears = (expectedSeconds / (secInYear * 1000000)).toFixed(2);
      return {
        main: `${parseFloat(millionYears).toLocaleString()} ${lang === 'ar' ? 'مليون سنة' : 'M Years'}`,
        sub: `${lang === 'ar' ? 'احتمال يانصيب حقيقي' : 'Solo Lottery Math'}`
      };
    }
  }, [expectedSeconds, lang]);

  // Live Micro Countdown simulation ticker (for visual engagement)
  const [simTick, setSimTick] = useState<number>(600); // 10 minutes countdown for current network block interval
  useEffect(() => {
    const timer = setInterval(() => {
      setSimTick(prev => (prev <= 1 ? 600 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // USD reward estimate
  const currentJackpotUsd = 3.125 * network.btcPriceUsd;

  // Expected Daily/Monthly/Yearly Theoretical Earnings (Mathematical Expected Value: EV = Probability * Reward)
  // Blocks generated globally per day: 86,400 / 600 = 144 blocks
  // Total BTC mined globally per day: 144 * 3.125 = 450 BTC
  // Share of global network = effectiveHashrate / (hashesPerBlockExpected / 600)
  const globalNetworkHashrate = useMemo(() => {
    return hashesPerBlockExpected / 600; // hashes per second globally
  }, [hashesPerBlockExpected]);

  const hashrateShare = useMemo(() => {
    if (globalNetworkHashrate <= 0 || effectiveHashrate <= 0) return 0;
    return effectiveHashrate / globalNetworkHashrate;
  }, [effectiveHashrate, globalNetworkHashrate]);

  const dailyBtcExpected = useMemo(() => {
    return hashrateShare * 450; // 450 BTC/day
  }, [hashrateShare]);

  const dailySatoshis = useMemo(() => {
    return dailyBtcExpected * 100000000;
  }, [dailyBtcExpected]);

  const dailyUsdExpected = useMemo(() => {
    return dailyBtcExpected * network.btcPriceUsd;
  }, [dailyBtcExpected, network.btcPriceUsd]);

  const monthlyBtcExpected = useMemo(() => {
    return dailyBtcExpected * 30.4375; // avg days in month
  }, [dailyBtcExpected]);

  const monthlyUsdExpected = useMemo(() => {
    return monthlyBtcExpected * network.btcPriceUsd;
  }, [monthlyBtcExpected, network.btcPriceUsd]);

  const yearlyBtcExpected = useMemo(() => {
    return dailyBtcExpected * 365.25;
  }, [dailyBtcExpected]);

  const yearlyUsdExpected = useMemo(() => {
    return yearlyBtcExpected * network.btcPriceUsd;
  }, [yearlyBtcExpected, network.btcPriceUsd]);

  return (
    <div 
      className="w-full max-w-[720px] mx-auto mt-4 bg-[#0e111a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl text-slate-300 font-sans"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-cairo">
              <span>{lang === 'ar' ? 'احتمالات الربح والوقت المتوقع' : 'Solo Win Odds & Expected Time'}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/40 font-mono font-bold">
                {lang === 'ar' ? 'يانصيب البيتكوين' : 'LOTTERY MATH'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-tajawal mt-0.5">
              {lang === 'ar' 
                ? 'حسابات رياضية دقيقة مبنية على صعوبة شبكة البيتكوين الحالية وسرعة التجزئة' 
                : 'Accurate probabilistic estimates based on real-time Bitcoin network difficulty'}
            </div>
          </div>
        </div>

        {/* Live vs Simulator Toggle */}
        <div className="flex items-center gap-1.5 bg-[#141824] p-1 rounded-xl border border-white/10 shadow-inner text-xs font-tajawal font-bold">
          <button
            id="odds-use-live-btn"
            onClick={() => setUseLiveHashrate(true)}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              useLiveHashrate 
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.35)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${stats.isMining ? 'bg-emerald-600 animate-pulse' : 'bg-slate-600'}`} />
            <span>{lang === 'ar' ? 'السرعة الحية' : 'Live Hash'}</span>
          </button>
          <button
            id="odds-use-sim-btn"
            onClick={() => setUseLiveHashrate(false)}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              !useLiveHashrate 
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.35)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>{lang === 'ar' ? 'محاكي الأجهزة' : 'Simulator'}</span>
          </button>
        </div>
      </div>

      {/* Simulator Device Presets (Visible when Simulator is selected) */}
      {!useLiveHashrate && (
        <div className="bg-[#141824]/90 border border-cyan-500/30 rounded-xl p-3 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-tajawal">
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              {lang === 'ar' ? 'اختر قوة المعالجة للمقارنة:' : 'Select device tier to simulate:'}
            </span>
            <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10" dir="ltr">
              {formatHashRate(simulatedHashrate)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <button
              onClick={() => setSimulatedHashrate(100000)} // 100 kH/s
              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                simulatedHashrate === 100000
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-[#1c2233] text-slate-300 border-white/10 hover:bg-[#252d42]'
              }`}
            >
              <div className="text-[10px] font-tajawal text-slate-400">📱 1× NerdMiner</div>
              <div className="font-bold font-mono">100 kH/s</div>
            </button>

            <button
              onClick={() => setSimulatedHashrate(1000000)} // 1 MH/s
              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                simulatedHashrate === 1000000
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-[#1c2233] text-slate-300 border-white/10 hover:bg-[#252d42]'
              }`}
            >
              <div className="text-[10px] font-tajawal text-slate-400">⚡ 10× Devices</div>
              <div className="font-bold font-mono">1.0 MH/s</div>
            </button>

            <button
              onClick={() => setSimulatedHashrate(110000000000000)} // 110 TH/s
              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                simulatedHashrate === 110000000000000
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-[#1c2233] text-slate-300 border-white/10 hover:bg-[#252d42]'
              }`}
            >
              <div className="text-[10px] font-tajawal text-slate-400">🚀 1× ASIC S19</div>
              <div className="font-bold font-mono">110 TH/s</div>
            </button>

            <button
              onClick={() => setSimulatedHashrate(10000000000000000)} // 10 PH/s
              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                simulatedHashrate === 10000000000000000
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-[#1c2233] text-slate-300 border-white/10 hover:bg-[#252d42]'
              }`}
            >
              <div className="text-[10px] font-tajawal text-slate-400">👑 Solo Farm</div>
              <div className="font-bold font-mono">10 PH/s</div>
            </button>
          </div>
        </div>
      )}

      {/* Main Expected Time & Win Odds Highlight Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Card 1: Expected Time to Find a Block */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#131929] to-[#0c0f18] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_20px_rgba(245,158,11,0.08)] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-tajawal">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                <Timer className="w-4 h-4" />
                {lang === 'ar' ? 'الوقت المتوقع للعثور على كتلة' : 'Expected Time to Find Block'}
              </span>
              <span className="font-mono text-[11px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20" dir="ltr">
                {formatHashRate(effectiveHashrate)}
              </span>
            </div>

            <div className="py-2">
              <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400 tracking-tight" dir="ltr">
                {formattedExpectedTime.main}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1" dir="ltr">
                {formattedExpectedTime.sub}
              </div>
            </div>
          </div>

          {/* Real-time Block Draw Countdown Gauge */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400 font-tajawal">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'ar' ? 'سحب الكتلة الحالية:' : 'Current Block Draw:'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                {formatCountdown(simTick)}
              </span>
              <span className="text-[10px] text-slate-500 font-tajawal">
                {lang === 'ar' ? '(كل 10 دقائق)' : '(~10 min)'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Probability & Solo Lottery Odds Breakdown */}
        <div className="bg-gradient-to-br from-[#131929] to-[#0c0f18] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-tajawal mb-2">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                <Percent className="w-4 h-4" />
                {lang === 'ar' ? 'احتمالات الفوز بالجائزة' : 'Winning Probability'}
              </span>
              <span className="font-mono text-emerald-400 font-bold" dir="ltr">
                3.125 BTC (${(currentJackpotUsd / 1000).toFixed(0)}k USD)
              </span>
            </div>

            {/* Odds Table */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between bg-[#181e30] px-3 py-2 rounded-xl border border-white/5">
                <span className="text-slate-400 font-tajawal">
                  {lang === 'ar' ? 'الفرصة لكل كتلة (10 دقائق):' : 'Per 10-Min Block:'}
                </span>
                <span className="font-bold text-white" dir="ltr">
                  1 in {oneInBlock > 1e9 ? `${(oneInBlock / 1e9).toFixed(1)}B` : oneInBlock > 1e6 ? `${(oneInBlock / 1e6).toFixed(1)}M` : oneInBlock.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between bg-[#181e30] px-3 py-2 rounded-xl border border-white/5">
                <span className="text-slate-400 font-tajawal">
                  {lang === 'ar' ? 'الفرصة اليومية التراكمية:' : 'Daily Cumulative:'}
                </span>
                <span className="font-bold text-amber-400" dir="ltr">
                  1 in {oneInDaily > 1e9 ? `${(oneInDaily / 1e9).toFixed(1)}B` : oneInDaily > 1e6 ? `${(oneInDaily / 1e6).toFixed(1)}M` : oneInDaily.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between bg-[#181e30] px-3 py-2 rounded-xl border border-white/5">
                <span className="text-slate-400 font-tajawal">
                  {lang === 'ar' ? 'النسبة المئوية التقديرية:' : 'Calculated Percentage:'}
                </span>
                <span className="font-bold text-cyan-300" dir="ltr">
                  {(oddsDaily * 100).toExponential(4)}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-tajawal flex items-center gap-1.5 pt-1">
            <Dice5 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'كل تجزئة (Hash) هي تذكرة يانصيب حقيقية مستقلة تماماً!'
                : 'Every single hash computed is an independent valid lottery ticket!'}
            </span>
          </div>
        </div>
      </div>

      {/* NEW: Estimated Daily / Monthly / Yearly Earnings Panel */}
      <div className="bg-gradient-to-br from-[#121727] to-[#0d101a] border border-cyan-500/20 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Earnings Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white font-cairo flex items-center gap-2">
                <span>{t.earningsTitle}</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md font-mono" dir="ltr">
                  1 BTC = ${network.btcPriceUsd.toLocaleString()}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 font-tajawal mt-0.5">
                {t.earningsSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#141824] border border-white/10 text-slate-300 text-xs font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-400 font-tajawal">{lang === 'ar' ? 'السرعة المحسوبة:' : 'Rate:'}</span>
            <span className="font-bold text-amber-400" dir="ltr">{formatHashRate(effectiveHashrate)}</span>
          </div>
        </div>

        {/* 3-Column Earnings Breakdown (Daily, Monthly, Yearly) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Daily Card */}
          <div className="bg-[#161c2e]/90 border border-white/10 hover:border-cyan-500/40 rounded-xl p-3.5 flex flex-col justify-between transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-tajawal mb-2">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                {t.earningsDaily}
              </span>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                24h
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400" dir="ltr">
                ${dailyUsdExpected < 0.0001 ? dailyUsdExpected.toExponential(2) : dailyUsdExpected.toFixed(6)}
              </div>
              <div className="text-[11px] font-mono text-slate-300 flex items-center justify-between" dir="ltr">
                <span className="text-slate-500">BTC:</span>
                <span>{dailyBtcExpected.toExponential(3)}</span>
              </div>
              <div className="text-[10px] font-mono text-amber-400/90 flex items-center justify-between" dir="ltr">
                <span className="text-slate-500">Sats:</span>
                <span>{dailySatoshis < 0.001 ? dailySatoshis.toExponential(2) : dailySatoshis.toFixed(4)} sat</span>
              </div>
            </div>
          </div>

          {/* Monthly Card */}
          <div className="bg-[#161c2e]/90 border border-white/10 hover:border-amber-500/40 rounded-xl p-3.5 flex flex-col justify-between transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-tajawal mb-2">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Calendar className="w-3.5 h-3.5" />
                {t.earningsMonthly}
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                30d
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-base sm:text-lg font-bold font-mono text-amber-400" dir="ltr">
                ${monthlyUsdExpected < 0.001 ? monthlyUsdExpected.toExponential(2) : monthlyUsdExpected.toFixed(5)}
              </div>
              <div className="text-[11px] font-mono text-slate-300 flex items-center justify-between" dir="ltr">
                <span className="text-slate-500">BTC:</span>
                <span>{monthlyBtcExpected.toExponential(3)}</span>
              </div>
              <div className="text-[10px] font-mono text-amber-400/90 flex items-center justify-between" dir="ltr">
                <span className="text-slate-500">Sats:</span>
                <span>{(dailySatoshis * 30.4375).toFixed(3)} sat</span>
              </div>
            </div>
          </div>

          {/* Annual Card */}
          <div className="bg-[#161c2e]/90 border border-white/10 hover:border-emerald-500/40 rounded-xl p-3.5 flex flex-col justify-between transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-tajawal mb-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Flame className="w-3.5 h-3.5" />
                {t.earningsYearly}
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                365d
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-base sm:text-lg font-bold font-mono text-cyan-300" dir="ltr">
                ${yearlyUsdExpected < 0.01 ? yearlyUsdExpected.toExponential(2) : yearlyUsdExpected.toFixed(4)}
              </div>
              <div className="text-[11px] font-mono text-slate-300 flex items-center justify-between" dir="ltr">
                <span className="text-slate-500">BTC:</span>
                <span>{yearlyBtcExpected.toExponential(3)}</span>
              </div>
              <div className="text-[10px] font-mono text-amber-400/90 flex items-center justify-between" dir="ltr">
                <span className="text-slate-500">Sats:</span>
                <span>{(dailySatoshis * 365.25).toFixed(2)} sat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Solo vs Pooled Concept Educational Footer */}
        <div className="bg-[#0b0e17] rounded-xl p-3 border border-white/5 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold font-tajawal">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{t.earningsSoloVsPool}</span>
          </div>
          <p className="text-[11px] text-slate-400 font-tajawal leading-relaxed">
            {t.earningsSoloExplain} {t.earningsPoolExplain}
          </p>
        </div>
      </div>

      {/* Solo Mining Fact Banner */}
      <div className="bg-[#141824]/60 border border-white/10 rounded-xl p-3 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed font-tajawal">
          {lang === 'ar' ? (
            <span>
              <strong className="text-white">كيف يعمل تعدين اليانصيب المنفرد (Solo Lottery)؟</strong> في التعدين الفردي، لا توجد مكافآت مقسمة صغيرة؛ فإذا عثر جهازك على تجزئة تطابق صعوبة الشبكة (<span className="font-mono text-amber-400" dir="ltr">{formatDifficulty(difficulty)}</span>)، فستحصل على مكافأة الكتلة بالكامل (<strong className="text-emerald-400" dir="ltr">3.125 BTC</strong>) مباشرة في محفظتك.
            </span>
          ) : (
            <span>
              <strong className="text-white">How Solo Lottery Mining Works:</strong> Solo miners do not split fractional rewards. If your hardware strikes a golden nonce matching the global network difficulty (<span className="font-mono text-amber-400" dir="ltr">{formatDifficulty(difficulty)}</span>), you win the entire block reward (<strong className="text-emerald-400" dir="ltr">3.125 BTC</strong>) directly to your payout address.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
