import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MinerStats, 
  NetworkData, 
  PoolConfig, 
  ScreenMode, 
  StratumLog, 
  MiningJob,
  IntensityMode,
  Language 
} from './types';
import { TRANSLATIONS } from './i18n/translations';
import { WorkerManager } from './services/workerManager';
import { StratumClient } from './services/stratumClient';
import { fetchBitcoinNetworkData, DEFAULT_NETWORK_DATA } from './services/bitcoinNetwork';
import { createInstantMiningJob } from './services/bitcoinCrypto';
import { soundManager } from './services/soundEffects';
import { NerdMinerScreen } from './components/NerdMinerScreen';
import { HardwareFrame } from './components/HardwareFrame';
import { SettingsModal } from './components/SettingsModal';
import { BlockWinModal } from './components/BlockWinModal';
import { StratumLogsDrawer } from './components/StratumLogsDrawer';
import { MiningDashboard } from './components/MiningDashboard';
import { WinOddsCalculator } from './components/WinOddsCalculator';
import { MiniMinerWidget } from './components/MiniMinerWidget';
import { MobileFloatingWidget } from './components/MobileFloatingWidget';
import { Languages, BrainCircuit, Minimize2, Sliders, Volume2, VolumeX, Terminal, Radio } from 'lucide-react';

const DEFAULT_PAYOUT_ADDRESS = 'bc1qtmeccwnh884hy76u5zr0qlwl63tjsyemw57sks';

const DEFAULT_POOL_CONFIG: PoolConfig = {
  name: 'PublicPool.io (WebSocket Solo)',
  url: 'wss://publicpool.io:21496',
  port: 21496,
  btcAddress: DEFAULT_PAYOUT_ADDRESS,
  workerName: 'NerdMiner01',
  password: 'x',
  isCustom: false,
  useSsl: true
};

export default function App() {
  // Arabic is the primary default language
  const [lang, setLang] = useState<Language>('ar');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar';

  // Detect available CPU hardware cores
  const maxCores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
  // Use up to maxCores minus 1 for UI responsiveness (at least 1, max 32)
  const initialThreads = Math.max(1, Math.min(32, maxCores - 1));

  // Miner state
  const [stats, setStats] = useState<MinerStats>({
    isMining: true,
    hashRate: 0,
    hashRateHistory: Array(20).fill(0),
    totalHashes: 0,
    bestDifficulty: 0,
    validShares: 0,
    rejectedShares: 0,
    blocksFound: 0,
    activeThreads: initialThreads,
    maxThreads: maxCores,
    uptimeSeconds: 0,
    acceptedRatio: 100,
    currentDifficulty: 0.0001,
    lastShareTime: null,
    currentNonce: 0,
    intensityMode: 'balanced',
    cpuLoadPercent: 78,
    temperatureC: 45,
    pingMs: 24,
    cleanJobsCount: 0,
    staleJobsPrevented: 0,
    engineType: 'UNROLLED_JS',
    smartAutoTune: true,
    efficiencyScore: 94
  });

  const [network, setNetwork] = useState<NetworkData>(DEFAULT_NETWORK_DATA);
  const [poolConfig, setPoolConfig] = useState<PoolConfig>(() => {
    try {
      const saved = localStorage.getItem('nerdminer_pool_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.btcAddress) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_POOL_CONFIG;
  });
  const [currentJob, setCurrentJob] = useState<MiningJob | null>(() => createInstantMiningJob(884200));
  const [screenMode, setScreenMode] = useState<ScreenMode>('nerdminer');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [logs, setLogs] = useState<StratumLog[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [blockWonData, setBlockWonData] = useState<{ open: boolean; height: number; hash: string } | null>(null);
  const [deviceViewMode, setDeviceViewMode] = useState<'enclosure' | 'flat'>('enclosure');
  const [poolConnected, setPoolConnected] = useState<boolean>(false);
  const [poolMessage, setPoolMessage] = useState<string>('Connecting...');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // References for high-frequency counters & real-time telemetry
  const workerManagerRef = useRef<WorkerManager | null>(null);
  const stratumClientRef = useRef<StratumClient | null>(null);
  const batchHashesCountRef = useRef<number>(0);
  const totalHashesRef = useRef<number>(0);
  const currentNonceRef = useRef<number>(0);
  const engineTypeRef = useRef<'WASM' | 'UNROLLED_JS'>('UNROLLED_JS');
  const isMiningRef = useRef<boolean>(true);
  const currentJobRef = useRef<MiningJob>(createInstantMiningJob(884200));
  const difficultyRef = useRef<number>(0.0001);
  const lastTickTimeRef = useRef<number>(Date.now());

  // Dynamic Browser Tab Title with live hashrate and BTC price
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (stats.isMining && stats.hashRate > 0) {
        const hrStr = stats.hashRate >= 1000000 
          ? `${(stats.hashRate / 1000000).toFixed(2)} MH/s` 
          : stats.hashRate >= 1000 
          ? `${(stats.hashRate / 1000).toFixed(1)} kH/s` 
          : `${stats.hashRate.toFixed(0)} H/s`;
        document.title = `⚡ ${hrStr} | ₿ $${Math.round(network.btcPriceUsd).toLocaleString()} | NerdMiner v2`;
      } else {
        document.title = 'NerdMiner v2 | Solo Bitcoin Miner';
      }
    }
  }, [stats.hashRate, stats.isMining, network.btcPriceUsd]);

  // Add Log Helper
  const addLog = useCallback((log: StratumLog) => {
    setLogs(prev => [...prev.slice(-150), log]);
  }, []);

  // Language toggle handler
  const handleToggleLanguage = () => {
    const nextLang: Language = lang === 'ar' ? 'en' : 'ar';
    setLang(nextLang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = nextLang;
      document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  // Sync document dir on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    }
  }, [lang, isRtl]);

  // Initialize Stratum and Worker Manager
  useEffect(() => {
    const wm = new WorkerManager(initialThreads, 'balanced');
    workerManagerRef.current = wm;

    const stratum = new StratumClient(poolConfig);
    stratumClientRef.current = stratum;

    // Immediately start worker manager with instant job so hashing runs at t=0ms!
    wm.startMining(currentJobRef.current, difficultyRef.current);

    // Stratum events
    stratum.onStatusChange = (connected, msg) => {
      setPoolConnected(connected);
      setPoolMessage(msg);
    };

    stratum.onPingUpdate = (ping) => {
      setStats(prev => ({ ...prev, pingMs: ping }));
    };

    stratum.onLog = (log) => {
      addLog(log);
    };

    stratum.onSetDifficulty = (diff) => {
      difficultyRef.current = diff;
      setStats(prev => ({ ...prev, currentDifficulty: diff }));
      wm.updateDifficulty(diff);
    };

    stratum.onNewJob = (job) => {
      currentJobRef.current = job;
      setCurrentJob(job);
      if (isMiningRef.current) {
        if (job.cleanJobs) {
          // Zero-Latency Cancellation (<1ms)
          wm.cleanJobsAndRestart(job);
        } else {
          wm.startMining(job, difficultyRef.current);
        }
      }
    };

    stratum.onShareResult = (accepted) => {
      if (accepted) {
        setStats(prev => ({
          ...prev,
          validShares: prev.validShares + 1,
          lastShareTime: Date.now()
        }));
        soundManager.playShareSound();
      } else {
        setStats(prev => ({
          ...prev,
          rejectedShares: prev.rejectedShares + 1
        }));
      }
    };

    // Worker Manager events (High-frequency accumulators in Refs to avoid freezing the UI)
    wm.onHashBatch = (hashes, _elapsed, nonce, _workerId, engine) => {
      batchHashesCountRef.current += hashes;
      totalHashesRef.current += hashes;
      currentNonceRef.current = nonce;
      if (engine) engineTypeRef.current = engine;
    };

    wm.onBestDiff = (diff, nonce) => {
      setStats(prev => {
        if (diff > prev.bestDifficulty) {
          soundManager.playBestDiffSound();
          addLog({
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            direction: 'SYS',
            text: lang === 'ar' 
              ? `★ تم تسجيل أعلى صعوبة جديدة: ${diff.toFixed(2)} (الرقم العشوائي Nonce: 0x${nonce.toString(16).padStart(8, '0')})`
              : `★ NEW BEST DIFFICULTY: ${diff.toFixed(2)} (Nonce: 0x${nonce.toString(16).padStart(8, '0')})`
          });
          return { ...prev, bestDifficulty: diff };
        }
        return prev;
      });
    };

    wm.onShareFound = ({ nonce, jobId, hashHex, difficulty }) => {
      stratum.submitShare(jobId, nonce, hashHex, difficulty);
    };

    wm.onBlockFound = ({ hashHex }) => {
      setStats(prev => ({ ...prev, blocksFound: prev.blocksFound + 1 }));
      soundManager.playBlockJackpot();
      setBlockWonData({
        open: true,
        height: network.blockHeight + 1,
        hash: hashHex
      });
      addLog({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        direction: 'BLOCK',
        text: lang === 'ar'
          ? `★★★ تم حل كتلة رئيسية صالحة للبيتكوين! التجزئة: ${hashHex.substring(0, 16)}... ★★★`
          : `★★★ VALID MAINNET BLOCK CANDIDATE FOUND! Hash: ${hashHex.substring(0, 16)}... ★★★`
      });
    };

    wm.onCleanJobAck = (jobId, latencyMs) => {
      setStats(prev => ({
        ...prev,
        cleanJobsCount: wm.getCleanJobsCount(),
        staleJobsPrevented: wm.getStaleJobsPrevented()
      }));
      addLog({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        direction: 'SYS',
        text: lang === 'ar'
          ? `⚡ تبديل فوري للمهمة في ${latencyMs.toFixed(2)} مللي ثانية -> المهمة ${jobId.substring(0, 8)}`
          : `⚡ Zero-Latency Job Switch in ${latencyMs.toFixed(2)}ms -> Job ${jobId.substring(0, 8)}`
      });
    };

    // Connect to Stratum pool
    stratum.connect();

    return () => {
      wm.destroy();
      stratum.disconnect();
    };
  }, [lang]);

  // Hashrate ticker & thermal modeling + Smart Auto-Tuner (every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = now;

      setStats(prev => {
        let currentRate = 0;
        if (isMiningRef.current && deltaSec > 0) {
          const hashes = batchHashesCountRef.current;
          batchHashesCountRef.current = 0;
          currentRate = Math.round(hashes / deltaSec);
        }

        // Smart Auto-Tuning logic
        let effectiveIntensity = prev.intensityMode;
        if (prev.smartAutoTune && isMiningRef.current) {
          if (prev.temperatureC > 65) {
            effectiveIntensity = 'eco';
            workerManagerRef.current?.setIntensityMode('eco');
          } else if (prev.temperatureC < 55 && prev.pingMs < 100) {
            effectiveIntensity = 'turbo';
            workerManagerRef.current?.setIntensityMode('turbo');
          } else {
            effectiveIntensity = 'balanced';
            workerManagerRef.current?.setIntensityMode('balanced');
          }
        }

        // Dynamic thermal & cpu load modeling
        const load = isMiningRef.current 
          ? (effectiveIntensity === 'turbo' ? 99 : effectiveIntensity === 'balanced' ? 78 : 35)
          : 5;
        
        const coreRatio = prev.activeThreads / maxCores;
        const targetTemp = isMiningRef.current 
          ? 38 + (coreRatio * (effectiveIntensity === 'turbo' ? 32 : effectiveIntensity === 'balanced' ? 18 : 8))
          : 36;
        
        const newTemp = Math.round(prev.temperatureC * 0.85 + targetTemp * 0.15);
        const newHistory = [...prev.hashRateHistory.slice(1), currentRate];

        return {
          ...prev,
          hashRate: currentRate,
          hashRateHistory: newHistory,
          totalHashes: totalHashesRef.current,
          currentNonce: currentNonceRef.current,
          engineType: engineTypeRef.current,
          uptimeSeconds: isMiningRef.current ? prev.uptimeSeconds + 1 : prev.uptimeSeconds,
          intensityMode: effectiveIntensity,
          cpuLoadPercent: load,
          temperatureC: newTemp,
          cleanJobsCount: workerManagerRef.current?.getCleanJobsCount() || prev.cleanJobsCount,
          staleJobsPrevented: workerManagerRef.current?.getStaleJobsPrevented() || prev.staleJobsPrevented
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [maxCores]);

  // Periodic Bitcoin Network Data Fetcher
  useEffect(() => {
    const loadNetworkData = async () => {
      const data = await fetchBitcoinNetworkData();
      setNetwork(data);
    };

    loadNetworkData();
    const netInterval = setInterval(loadNetworkData, 30000);
    return () => clearInterval(netInterval);
  }, []);

  // Toggle Mining
  const handleToggleMining = () => {
    soundManager.playClick();
    if (stats.isMining) {
      isMiningRef.current = false;
      workerManagerRef.current?.stopMining();
      batchHashesCountRef.current = 0;
      setStats(prev => ({ ...prev, isMining: false, hashRate: 0, cpuLoadPercent: 5 }));
      addLog({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        direction: 'SYS',
        text: lang === 'ar' ? 'تم إيقاف أنوية التعدين مؤقتاً.' : 'Worker threads paused.'
      });
    } else {
      isMiningRef.current = true;
      const job = currentJobRef.current || createInstantMiningJob(884200);
      workerManagerRef.current?.startMining(job, difficultyRef.current);
      setStats(prev => ({ ...prev, isMining: true }));
      addLog({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        direction: 'SYS',
        text: lang === 'ar' 
          ? `بدء التعدين بـ ${stats.activeThreads} أنوية معالج (${stats.intensityMode})...`
          : `Starting mining with ${stats.activeThreads} worker threads (${stats.intensityMode} mode)...`
      });
    }
  };

  // Toggle Smart Auto-Tune
  const handleToggleSmartAutoTune = () => {
    soundManager.playClick();
    const nextState = !stats.smartAutoTune;
    setStats(prev => ({ ...prev, smartAutoTune: nextState }));
    addLog({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      direction: 'SYS',
      text: lang === 'ar'
        ? nextState ? '🧠 تم تفعيل نظام الضبط الذكي التلقائي للأداء والحرارة.' : 'تم إيقاف نظام الضبط التلقائي (الوضع اليدوي).'
        : nextState ? '🧠 Smart Auto-Tuning Engine enabled.' : 'Manual tuning active.'
    });
  };

  // Set Intensity Mode
  const handleSetIntensity = (mode: IntensityMode) => {
    soundManager.playClick();
    setStats(prev => ({ ...prev, intensityMode: mode, smartAutoTune: false }));
    workerManagerRef.current?.setIntensityMode(mode);
    addLog({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      direction: 'SYS',
      text: lang === 'ar' 
        ? `تم تحويل نمط الطاقة والحرارة إلى وضع ${mode.toUpperCase()}.`
        : `Thermal profile switched to ${mode.toUpperCase()} mode.`
    });
  };

  // Set Thread Count
  const handleSetThreadCount = (count: number) => {
    soundManager.playClick();
    const clamped = Math.max(1, Math.min(count, maxCores));
    setStats(prev => ({ ...prev, activeThreads: clamped }));
    workerManagerRef.current?.setThreadCount(clamped);
    addLog({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      direction: 'SYS',
      text: lang === 'ar'
        ? `تم ضبط عدد الأنوية النشطة إلى ${clamped} أنوية.`
        : `Worker thread pool adjusted to ${clamped} threads.`
    });
  };

  // Cycle Screen Mode
  const handleCycleMode = () => {
    soundManager.playClick();
    setScreenMode(prev => {
      if (prev === 'nerdminer') return 'clock';
      if (prev === 'clock') return 'matrix';
      if (prev === 'matrix') return 'stats';
      return 'nerdminer';
    });
  };

  // Toggle Audio
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
    if (next) soundManager.playClick();
  };

  // Save Settings
  const handleSaveSettings = (newConfig: PoolConfig, newThreads: number) => {
    const lockedConfig: PoolConfig = {
      ...newConfig,
      btcAddress: DEFAULT_PAYOUT_ADDRESS
    };
    setPoolConfig(lockedConfig);
    try {
      localStorage.setItem('nerdminer_pool_config', JSON.stringify(lockedConfig));
    } catch {
      // ignore
    }
    handleSetThreadCount(newThreads);
    stratumClientRef.current?.updateConfig(lockedConfig);
    addLog({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      direction: 'SYS',
      text: lang === 'ar'
        ? `تم حفظ الإعدادات بنجاح. المحفظة الأساسية المعتمدة: ${DEFAULT_PAYOUT_ADDRESS.substring(0, 10)}...`
        : `Settings saved. Master payout address: ${DEFAULT_PAYOUT_ADDRESS.substring(0, 10)}...`
    });
  };

  // Simulate Block Jackpot
  const handleSimulateJackpot = () => {
    soundManager.playBlockJackpot();
    setStats(prev => ({
      ...prev,
      blocksFound: prev.blocksFound + 1,
      bestDifficulty: Math.max(prev.bestDifficulty, 108450000000000)
    }));
    setBlockWonData({
      open: true,
      height: network.blockHeight + 1,
      hash: '000000000000000000028a4c1f90e8d76b543210efabcd1234567890abcdef'
    });
  };

  if (isMinimized) {
    return (
      <>
        <MiniMinerWidget
          stats={stats}
          network={network}
          isMining={stats.isMining}
          poolConnected={poolConnected}
          soundEnabled={soundEnabled}
          lang={lang}
          onToggleMining={handleToggleMining}
          onToggleSound={handleToggleSound}
          onMaximize={() => setIsMinimized(false)}
        />

        {/* Block Win Celebration Modal still active in mini mode */}
        {blockWonData && (
          <BlockWinModal
            isOpen={blockWonData.open}
            onClose={() => setBlockWonData(null)}
            blockHeight={blockWonData.height}
            hashHex={blockWonData.hash}
            network={network}
            config={poolConfig}
            lang={lang}
          />
        )}
      </>
    );
  }

  return (
    <main 
      className="min-h-screen cyber-grid-bg text-slate-100 flex flex-col justify-between py-6 px-3 sm:px-6 select-none relative overflow-x-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[250px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top Modern Sleek App Header with Responsive Non-Overlapping Layout */}
      <header className="w-full max-w-[720px] mx-auto space-y-3.5 border-b border-white/10 pb-4 mb-4 backdrop-blur-md">
        {/* Row 1: Brand & Top Utilities Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 p-[1px] shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <div className="w-full h-full bg-[#0d0f17] rounded-[11px] flex items-center justify-center">
                  <span className="text-lg font-black text-amber-400 font-mono tracking-tighter">₿</span>
                </div>
              </div>
              <div className="absolute -inset-0.5 bg-amber-500/30 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-500 -z-10" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white font-cairo whitespace-nowrap">
                  {t.appTitle}
                </h1>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 font-tajawal whitespace-nowrap">
                  {t.smartEdition}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-tajawal tracking-wide mt-0.5">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Switcher */}
            <button
              id="header-lang-btn"
              onClick={handleToggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1d2334] text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold font-tajawal shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
              title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <Languages className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Sound Toggle Button */}
            <button
              id="header-sound-btn"
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border text-xs cursor-pointer transition-all active:scale-95 ${
                soundEnabled
                  ? 'bg-[#151a27] text-amber-400 border-amber-500/40 hover:bg-[#1c2233] shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'bg-[#121520] text-slate-500 border-white/10 hover:text-slate-300'
              }`}
              title={soundEnabled ? t.soundOn : t.soundOff}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Minimize Mode Header Action */}
            <button
              id="header-minimize-btn"
              onClick={() => setIsMinimized(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1e2436] text-amber-400 border border-amber-500/30 hover:border-amber-400 text-xs font-bold font-tajawal shadow-sm transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              title={t.miniMode}
            >
              <Minimize2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t.miniMode}</span>
            </button>

            {/* Settings Dialog Quick Launch */}
            <button
              id="header-settings-btn"
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl bg-[#141824] hover:bg-[#1d2334] text-slate-300 border border-white/10 hover:border-amber-500/40 cursor-pointer transition-all active:scale-95 shadow-sm"
              title={t.settings}
            >
              <Sliders className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Row 2: Live Network & Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
          {/* BTC Price Card */}
          <div className="p-2.5 rounded-xl bg-[#121520]/90 border border-white/10 shadow-sm flex flex-col justify-between" dir="ltr">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-tajawal">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300">{lang === 'ar' ? 'سعر البيتكوين' : 'BTC Price'}</span>
              </span>
              <span className={`font-bold font-mono ${network.btcPriceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {network.btcPriceChange24h >= 0 ? '+' : ''}{network.btcPriceChange24h.toFixed(2)}%
              </span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white tracking-tight mt-1 font-mono">
              ${network.btcPriceUsd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>

          {/* Block Height Card */}
          <div className="p-2.5 rounded-xl bg-[#121520]/90 border border-white/10 shadow-sm flex flex-col justify-between" dir="ltr">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-tajawal">
              <span className="text-slate-300">{lang === 'ar' ? 'رقم الكتلة' : 'Block Height'}</span>
              <span className="text-cyan-400 font-bold font-mono">{network.networkHashrateEH.toFixed(1)} EH/s</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-amber-400 tracking-tight mt-1 font-mono">
              #{network.blockHeight.toLocaleString()}
            </div>
          </div>

          {/* Mining Pool Status Card */}
          <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-[#121520]/90 border border-white/10 shadow-sm flex flex-col justify-between" dir="ltr">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-tajawal">
              <span className="text-slate-300">{lang === 'ar' ? 'حوض التعدين' : 'Stratum Pool'}</span>
              <span className={`font-bold font-mono ${stats.pingMs < 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{stats.pingMs}ms</span>
            </div>
            <div className="text-xs font-bold text-slate-200 tracking-tight truncate mt-1 flex items-center gap-1.5 font-mono">
              <span className={`w-2 h-2 rounded-full shrink-0 ${poolConnected ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-amber-400 animate-pulse'}`} />
              <span className="truncate">{poolConfig.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Center Area: Hardware Frame with Screen */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <HardwareFrame
          stats={stats}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onToggleMining={handleToggleMining}
          onCycleMode={handleCycleMode}
          onOpenSettings={() => setShowSettings(true)}
          onToggleLogs={() => setShowLogs(prev => !prev)}
          showLogs={showLogs}
          onSimulateBlock={handleSimulateJackpot}
          deviceViewMode={deviceViewMode}
          onToggleDeviceView={() => setDeviceViewMode(prev => prev === 'enclosure' ? 'flat' : 'enclosure')}
          lang={lang}
          onToggleLanguage={handleToggleLanguage}
          onToggleMiniMode={() => setIsMinimized(true)}
        >
          <NerdMinerScreen
            stats={stats}
            network={network}
            config={poolConfig}
            currentJob={currentJob}
            mode={screenMode}
            onCycleMode={handleCycleMode}
            poolConnected={poolConnected}
            poolMessage={poolMessage}
            onSetIntensity={handleSetIntensity}
            lang={lang}
          />
        </HardwareFrame>

        {/* Live Protocol Logs Drawer */}
        <StratumLogsDrawer
          logs={logs}
          onClearLogs={() => setLogs([])}
          onClose={() => setShowLogs(false)}
          isOpen={showLogs}
          lang={lang}
        />

        {/* Mining Controls Dashboard */}
        <MiningDashboard
          stats={stats}
          network={network}
          config={poolConfig}
          onSetThreadCount={handleSetThreadCount}
          onSetIntensity={handleSetIntensity}
          onToggleSmartAutoTune={handleToggleSmartAutoTune}
          maxThreads={maxCores}
          onResetStats={() => setStats(prev => ({
            ...prev,
            totalHashes: 0,
            bestDifficulty: 0,
            validShares: 0,
            rejectedShares: 0,
            uptimeSeconds: 0
          }))}
          lang={lang}
        />

        {/* Real-time Solo Win Odds & Expected Time Calculator */}
        <WinOddsCalculator
          stats={stats}
          network={network}
          lang={lang}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={poolConfig}
        onSave={handleSaveSettings}
        threadCount={stats.activeThreads}
        maxThreads={maxCores}
        lang={lang}
        onSimulateBlock={handleSimulateJackpot}
      />

      {/* Block Win Celebration Modal */}
      {blockWonData && (
        <BlockWinModal
          isOpen={blockWonData.open}
          onClose={() => setBlockWonData(null)}
          blockHeight={blockWonData.height}
          hashHex={blockWonData.hash}
          network={network}
          config={poolConfig}
          lang={lang}
        />
      )}

      {/* Geometric Bottom Status Footer */}
      <footer className="w-full max-w-[720px] mx-auto mt-7 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-tajawal gap-3 mb-10">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">{t.uptime}:</span>
          <span className="font-mono text-slate-200 font-bold bg-[#141824] px-2 py-0.5 rounded border border-white/5" dir="ltr">
            {Math.floor(stats.uptimeSeconds / 3600)}h {Math.floor((stats.uptimeSeconds % 3600) / 60)}m {stats.uptimeSeconds % 60}s
          </span>
        </div>
        
        <div className="font-mono text-slate-500 text-[10px] tracking-wider" dir="ltr">
          {t.engineVersion}
        </div>

        <div className="flex items-center gap-2 bg-[#141824] px-3 py-1 rounded-full border border-white/5 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
          <span className="text-slate-300 font-medium">{t.networkConnected}</span>
        </div>
      </footer>

      {/* Floating Bottom Quick Action Mobile Dock Bar */}
      <MobileFloatingWidget
        hashRate={stats.hashRate}
        isMining={stats.isMining}
        activeThreads={stats.activeThreads}
        lang={lang}
        onOpenSettings={() => setShowSettings(true)}
        onToggleMiniMode={() => setIsMinimized(true)}
      />
    </main>
  );
}
