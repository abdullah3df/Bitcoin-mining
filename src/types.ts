export type Language = 'ar' | 'en';
export type IntensityMode = 'eco' | 'balanced' | 'turbo';

export interface MiningJob {
  jobId: string;
  prevHash: string;
  coinb1: string;
  coinb2: string;
  merkleBranch: string[];
  version: string;
  nBits: string;
  nTime: string;
  cleanJobs: boolean;
  target?: string;
  difficulty?: number;
  height?: number;
}

export interface WorkerMessageToWorker {
  type: 'START_JOB' | 'SET_DIFFICULTY' | 'STOP' | 'UPDATE_PARAMS' | 'CLEAN_JOB' | 'SET_INTENSITY';
  job?: MiningJob;
  extraNonce1?: string;
  extraNonce2?: string;
  difficulty?: number;
  workerId?: number;
  nonceStart?: number;
  nonceStep?: number;
  intensity?: IntensityMode;
  jobVersion?: number;
}

export interface WorkerMessageFromWorker {
  type: 'HASH_BATCH' | 'SHARE_FOUND' | 'BEST_DIFF' | 'BLOCK_FOUND' | 'LOG' | 'ENGINE_READY';
  hashes: number;
  workerId: number;
  elapsedMs?: number;
  nonce?: number;
  jobId?: string;
  headerHex?: string;
  hashHex?: string;
  difficulty?: number;
  message?: string;
  engine?: 'WASM' | 'UNROLLED_JS';
  dutyCycleMs?: number;
}

export interface MinerStats {
  isMining: boolean;
  hashRate: number; // in H/s
  hashRateHistory: number[];
  totalHashes: number;
  bestDifficulty: number;
  validShares: number;
  rejectedShares: number;
  blocksFound: number;
  activeThreads: number;
  maxThreads: number;
  uptimeSeconds: number;
  acceptedRatio: number;
  currentDifficulty: number;
  lastShareTime: number | null;
  currentNonce: number;
  intensityMode: IntensityMode;
  cpuLoadPercent: number;
  temperatureC: number;
  pingMs: number;
  cleanJobsCount: number;
  staleJobsPrevented: number;
  engineType: 'WASM' | 'UNROLLED_JS';
  smartAutoTune: boolean;
  efficiencyScore: number;
}

export interface NetworkData {
  btcPriceUsd: number;
  btcPriceChange24h: number;
  blockHeight: number;
  networkDifficulty: number; // in trillions e.g. 104.5T
  difficultyProgress: number; // % towards next retarget
  halvingProgress: number;
  fastestFee: number; // sat/vB
  halfHourFee: number;
  hourFee: number;
  minimumFee: number;
  unconfirmedTxs: number;
  lastBlockTime: number;
  networkHashrateEH: number; // in EH/s
}

export interface PoolConfig {
  name: string;
  url: string;
  port: number;
  btcAddress: string;
  workerName: string;
  password: string;
  isCustom: boolean;
  useSsl: boolean;
}

export interface StratumLog {
  id: string;
  timestamp: string;
  direction: 'SEND' | 'RECV' | 'SYS' | 'SHARE' | 'BLOCK';
  text: string;
  raw?: any;
}

export type ScreenMode = 'nerdminer' | 'clock' | 'matrix' | 'stats';
