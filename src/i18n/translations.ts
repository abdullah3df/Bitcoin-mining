export type Language = 'ar' | 'en';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  smartEdition: string;
  btcPrice: string;
  blockHeight: string;
  netDifficulty: string;
  netHashrate: string;
  mempoolTxs: string;
  halvingProgress: string;
  recommendedFees: string;
  low: string;
  economy: string;
  halfHour: string;
  fastest: string;
  hashrateVelocity: string;
  totalHashes: string;
  bestDifficulty: string;
  globalDiff: string;
  validShares: string;
  acceptedRate: string;
  blocksFound: string;
  soloLuck: string;
  jackpotReward: string;
  jackpotEstimate: string;
  pool: string;
  latency: string;
  stratumActive: string;
  syncing: string;
  chassisView: string;
  compactDisplay: string;
  fullEnclosure: string;
  testJackpot: string;
  startMining: string;
  stopMining: string;
  hashing: string;
  idle: string;
  cycleScreen: string;
  soundOn: string;
  soundOff: string;
  settings: string;
  logs: string;
  hardwareMultithreading: string;
  coresActive: string;
  dutyCycle: string;
  ecoMode: string;
  balancedMode: string;
  turboMode: string;
  smartAutoTune: string;
  coreTemp: string;
  ping: string;
  zeroLatencySync: string;
  cleanJobsCount: string;
  staleStopped: string;
  educationalNoticeTitle: string;
  educationalNoticeDesc: string;
  oddsTitle: string;
  yourHashrate: string;
  jackpotValue: string;
  dailyProbability: string;
  estimatedTime: string;
  years: string;
  thousandYears: string;
  oddsFootnote: string;
  configTitle: string;
  configSubtitle: string;
  walletAddress: string;
  walletHelp: string;
  workerName: string;
  poolServer: string;
  poolPort: string;
  saveSettings: string;
  cancel: string;
  stratumLogsTitle: string;
  eventsCount: string;
  clearLogs: string;
  close: string;
  waitingLogs: string;
  jackpotWonTitle: string;
  blockSolvedTitle: string;
  blockCandidateSolved: string;
  estimatedReward: string;
  winningHash: string;
  payoutAddress: string;
  poolProtocol: string;
  continueMining: string;
  uptime: string;
  engineVersion: string;
  networkConnected: string;
  miniMode: string;
  expandFull: string;
  miniModeActive: string;
  stealthMini: string;
  dockBottom: string;
  wakeLockActive: string;
  wakeLockDisabled: string;
  screenKeepAwake: string;
  pwaInstallTitle: string;
  pwaInstallHelp: string;
  screenModes: {
    nerdminer: string;
    clock: string;
    matrix: string;
    stats: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  ar: {
    appTitle: 'نيرد ماينر v2.2',
    appSubtitle: 'محطة تعدين البيتكوين الفردية الذكية',
    smartEdition: 'إصدار الويب الذكي',
    btcPrice: 'سعر البيتكوين',
    blockHeight: 'ارتفاع الكتلة',
    netDifficulty: 'صعوبة الشبكة',
    netHashrate: 'قوة الشبكة العالمية',
    mempoolTxs: 'معاملات الميمبول',
    halvingProgress: 'تقدم التنصيف (الحقبة 5)',
    recommendedFees: 'رسوم المعاملات الموصى بها (sat/vB)',
    low: 'منخفض',
    economy: 'اقتصادي',
    halfHour: 'نصف ساعة',
    fastest: 'الأسرع',
    hashrateVelocity: 'سرعة التجزئة الحية',
    totalHashes: 'إجمالي التجزئات',
    bestDifficulty: 'أعلى صعوبة محققة',
    globalDiff: 'العالمية',
    validShares: 'الحصص المقبولة',
    acceptedRate: 'نسبة القبول',
    blocksFound: 'الكتل المكتشفة',
    soloLuck: 'نسبة الحظ',
    jackpotReward: 'مكافأة الكتلة',
    jackpotEstimate: 'قيمة الجائزة الكبرى',
    pool: 'المجمع',
    latency: 'زمن الاستجابة',
    stratumActive: 'متصل ومفعل',
    syncing: 'جاري المزامنة',
    chassisView: 'هيكل الجهاز',
    compactDisplay: 'العرض المدمج',
    fullEnclosure: 'الهيكل الكامل',
    testJackpot: 'تجربة الفوز بكتلة (3.125 BTC)',
    startMining: 'بدء التعدين',
    stopMining: 'إيقاف التعدين',
    hashing: 'جاري التعدين',
    idle: 'خامل',
    cycleScreen: 'تبديل الشاشة',
    soundOn: 'كتم الصوت',
    soundOff: 'تشغيل الصوت',
    settings: 'الإعدادات',
    logs: 'السجلات',
    hardwareMultithreading: 'التعدين متعدد النوى المسرّع',
    coresActive: 'أنوية معالج نشطة من أصل',
    dutyCycle: 'دورة استهلاك المعالج:',
    ecoMode: '❄️ اقتصادي (35%)',
    balancedMode: '⚖️ متوازن (78%)',
    turboMode: '🔥 توربو فائق (100%)',
    smartAutoTune: '🧠 ضبط ذكي تلقائي',
    coreTemp: 'حرارة المعالج:',
    ping: 'البينغ:',
    zeroLatencySync: 'مزامنة فورية للبروتوكول',
    cleanJobsCount: 'مهام حديثة مفعلة',
    staleStopped: 'تجزئات قديمة تم منعها',
    educationalNoticeTitle: 'تعدين اليانصيب الفردي للبيتكوين',
    educationalNoticeDesc: 'تقوم كل عملية تشفير SHA-256 مضاعفة ينفذها المتصفح باختبار حل ترويسة كتلة البيتكوين القادمة على الشبكة الرئيسية. إذا تطابقت التجزئة مع أصفار الصعوبة المطلوبة، تفوز بمكافأة الكتلة الكاملة 3.125 BTC فوراً.',
    oddsTitle: 'احتمالات وحسابات اليانصيب الفردي',
    yourHashrate: 'سرعة جهازك',
    jackpotValue: 'قيمة الجائزة الكبرى',
    dailyProbability: 'احتمالية الفوز اليومية:',
    estimatedTime: 'الوقت المتوقع إحصائياً:',
    years: 'سنة',
    thousandYears: 'ألف سنة',
    oddsFootnote: '* يمنح التعدين الفردي كل عملية تجزئة فرصة متكافئة وعادلة لحل كتلة البيتكوين!',
    configTitle: 'إعدادات نيرد ماينر',
    configSubtitle: 'معلمات مجمع التعدين الفردي ومحفظة الاستلام',
    walletAddress: 'عنوان محفظة البيتكوين لاستلام المكافأة',
    walletHelp: 'عند حل أي كتلة، تُرسل مكافأة 3.125 BTC بالإضافة إلى رسوم المعاملات مباشرة إلى هذا العنوان.',
    workerName: 'اسم جهاز التعدين (Worker)',
    poolServer: 'خادم المجمع (Pool URL)',
    poolPort: 'المنفذ (Port)',
    saveSettings: 'حفظ وتطبيق الإعدادات',
    cancel: 'إلغاء',
    stratumLogsTitle: 'تدفق بروتوكول Stratum المباشر',
    eventsCount: 'أحداث مسجلة',
    clearLogs: 'مسح السجل',
    close: 'إغلاق',
    waitingLogs: 'في انتظار بيانات بروتوكول Stratum...',
    jackpotWonTitle: '★ تم الفوز بالجائزة الكبرى للتعدين الفردي! ★',
    blockSolvedTitle: 'تم حل كتلة بيتكوين صحيحة بنجاح!',
    blockCandidateSolved: 'تم التحقق من الكتلة رقم',
    estimatedReward: 'مكافأة الكتلة المقدرة والرسوم',
    winningHash: 'التجزئة الفائزة:',
    payoutAddress: 'عنوان المحفظة المستلمة:',
    poolProtocol: 'بروتوكول المجمع:',
    continueMining: 'متابعة تعدين الكتلة التالية',
    uptime: 'وقت التشغيل:',
    engineVersion: 'محرك SHA-256 المسرّع v4.2',
    networkConnected: 'متصل بشبكة بيتكوين',
    miniMode: 'وضع التصغير (خلفية)',
    expandFull: 'تكبير الواجهة الكاملة',
    miniModeActive: 'التعدين يعمل في الخلفية بكامل الأنوية والسرعة',
    stealthMini: 'المصغر العائم',
    dockBottom: 'تثبيت مصغر',
    wakeLockActive: 'شاشة الهاتف نشطة دائماً (منع القفل)',
    wakeLockDisabled: 'السماح بقفل الشاشة التلقائي',
    screenKeepAwake: 'إبقاء الشاشة مضاءة للتعدين',
    pwaInstallTitle: 'تثبيت كأيقونة تطبيق على هاتفك',
    pwaInstallHelp: 'اضغط على خيارات المتصفح واختر "إضافة إلى الشاشة الرئيسية"',
    screenModes: {
      nerdminer: 'شاشة نيرد ماينر',
      clock: 'ساعة وشبكة الميمبول',
      matrix: 'تدفق التجزئات الحية',
      stats: 'احتمالات وحسابات الجائزة'
    }
  },
  en: {
    appTitle: 'NERDMINER v2.2',
    appSubtitle: 'SOLO BITCOIN MINING TERMINAL',
    smartEdition: 'TURBO_WASM',
    btcPrice: 'BTC/USD',
    blockHeight: 'Block Height',
    netDifficulty: 'Network Difficulty',
    netHashrate: 'Network Hashrate',
    mempoolTxs: 'Mempool TXs',
    halvingProgress: 'Halving Progress (Era 5)',
    recommendedFees: 'Mempool Recommended Fees (sat/vB)',
    low: 'Low',
    economy: 'Economy',
    halfHour: 'Half Hour',
    fastest: 'Fastest',
    hashrateVelocity: 'Hashrate Velocity',
    totalHashes: 'Total Hashes',
    bestDifficulty: 'Best Difficulty',
    globalDiff: 'Global',
    validShares: 'Valid Shares',
    acceptedRate: 'Accept Rate',
    blocksFound: 'Blocks Found',
    soloLuck: 'Solo Luck',
    jackpotReward: 'Block Reward',
    jackpotEstimate: 'Jackpot Prize',
    pool: 'POOL',
    latency: 'LATENCY',
    stratumActive: 'STRATUM ACTIVE',
    syncing: 'SYNCING',
    chassisView: 'CHASSIS VIEW',
    compactDisplay: 'Compact Display',
    fullEnclosure: 'Enclosure: ON',
    testJackpot: 'Test Jackpot (3.125 BTC)',
    startMining: 'START MINING',
    stopMining: 'STOP MINING',
    hashing: 'HASHING',
    idle: 'IDLE',
    cycleScreen: 'MODE',
    soundOn: 'Mute',
    soundOff: 'Unmute',
    settings: 'CONFIG',
    logs: 'LOGS',
    hardwareMultithreading: 'Hardware Multithreading',
    coresActive: 'detected CPU hardware cores active',
    dutyCycle: 'CPU Duty Cycle:',
    ecoMode: '❄️ Eco (35%)',
    balancedMode: '⚖️ Balanced (78%)',
    turboMode: '🔥 Turbo (100%)',
    smartAutoTune: '🧠 Smart Auto-Tune',
    coreTemp: 'Core Temp:',
    ping: 'Ping:',
    zeroLatencySync: 'Stratum Zero-Latency',
    cleanJobsCount: 'Clean Jobs',
    staleStopped: 'Stale Stopped',
    educationalNoticeTitle: 'Hardware-Accelerated Web Mining',
    educationalNoticeDesc: 'Double SHA-256 is executed using midstate precomputation and zero-allocation memory buffers inside parallel Web Workers. Dynamic duty-cycling distributes workloads evenly across CPU cores to prevent thermal throttling while preserving maximum Solo Lottery mining efficiency.',
    oddsTitle: 'SOLO BITCOIN LOTTERY ODDS',
    yourHashrate: 'Your Hashrate',
    jackpotValue: 'Jackpot Value',
    dailyProbability: 'Daily Solo Block Probability:',
    estimatedTime: 'Estimated Time to Solo Block:',
    years: 'Years',
    thousandYears: 'k Years',
    oddsFootnote: '* Solo lottery mining gives every hash an equal chance to find a valid Bitcoin block!',
    configTitle: 'NerdMiner Configuration',
    configSubtitle: 'Solo Bitcoin Pool & Worker Parameters',
    walletAddress: 'Bitcoin Payout Address (Jackpot Wallet)',
    walletHelp: 'If your miner solves a block, the entire 3.125 BTC + transaction fees go directly to this address.',
    workerName: 'Worker Identifier',
    poolServer: 'Stratum Pool URL',
    poolPort: 'Port',
    saveSettings: 'Save & Apply Config',
    cancel: 'Cancel',
    stratumLogsTitle: 'Stratum v1 Protocol Stream',
    eventsCount: 'events',
    clearLogs: 'Clear Logs',
    close: 'Close',
    waitingLogs: 'Waiting for Stratum protocol traffic...',
    jackpotWonTitle: '★ Solo Lottery Jackpot Won! ★',
    blockSolvedTitle: 'Valid Bitcoin Block Solved!',
    blockCandidateSolved: 'Block Candidate #',
    estimatedReward: 'Estimated Block Reward & Fees',
    winningHash: 'Winning Hash:',
    payoutAddress: 'Payout Address:',
    poolProtocol: 'Pool Protocol:',
    continueMining: 'Continue Mining Next Block',
    uptime: 'Uptime:',
    engineVersion: 'SHA-256 Bitwise Core Engine v4.2',
    networkConnected: 'Network Connected',
    miniMode: 'Mini Mode (Background)',
    expandFull: 'Expand Full Terminal',
    miniModeActive: 'Mining running in background with full CPU efficiency',
    stealthMini: 'Floating Mini Bar',
    dockBottom: 'Dock Widget',
    wakeLockActive: 'Screen Kept Awake (Mining Active)',
    wakeLockDisabled: 'Normal Screen Sleep Allowed',
    screenKeepAwake: 'Keep Mobile Screen Awake',
    pwaInstallTitle: 'Install as Home Screen App Icon',
    pwaInstallHelp: 'Tap browser options and select "Add to Home screen"',
    screenModes: {
      nerdminer: 'NerdMiner TFT Screen',
      clock: 'Clock & Mempool Matrix',
      matrix: 'Live Hash Stream',
      stats: 'Solo Odds & Jackpot Matrix'
    }
  }
};
