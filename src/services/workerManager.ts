import { IntensityMode, MiningJob, WorkerMessageFromWorker } from '../types';
import { MINER_WORKER_CODE } from './minerWorkerSource';

// Shared control buffer indices
const CTRL_IDX_JOB_EPOCH = 0;
const CTRL_IDX_MINING_ACTIVE = 1;
const CTRL_IDX_ABORT_BATCH = 2;
const CTRL_IDX_INTENSITY = 3;
const CTRL_IDX_SKIPPED_ROUNDS = 4;

export class WorkerManager {
  private workers: Worker[] = [];
  private workerBlobUrl: string | null = null;
  private threadCount: number = 2;
  private currentJob: MiningJob | null = null;
  private difficulty: number = 0.0001; // Share difficulty target
  private isMining: boolean = false;
  private intensityMode: IntensityMode = 'balanced';
  private currentJobVersion: number = Date.now();
  private jobEpoch: number = 1;
  private cleanJobsCount: number = 0;
  private staleJobsPrevented: number = 0;
  
  // SharedArrayBuffer lock-free cross-thread control memory
  private sharedBuffer: SharedArrayBuffer | null = null;
  private sharedControl: Int32Array | null = null;
  
  // Callback handlers
  public onHashBatch?: (hashes: number, elapsedMs: number, nonce: number, workerId: number, engine?: 'WASM' | 'UNROLLED_JS') => void;
  public onBestDiff?: (diff: number, nonce: number, workerId: number) => void;
  public onShareFound?: (data: { workerId: number; nonce: number; jobId: string; hashHex: string; difficulty: number }) => void;
  public onBlockFound?: (data: { workerId: number; nonce: number; jobId: string; hashHex: string; difficulty: number }) => void;
  public onCleanJobAck?: (jobId: string, latencyMs: number) => void;

  constructor(threads: number = 2, intensity: IntensityMode = 'balanced') {
    this.threadCount = Math.max(1, Math.min(threads, 32));
    this.intensityMode = intensity;
    this.initSharedBuffer();
    this.initBlob();
  }

  private initSharedBuffer(): void {
    try {
      if (typeof SharedArrayBuffer !== 'undefined') {
        // 32 x 4-byte Int32 control slots
        this.sharedBuffer = new SharedArrayBuffer(128);
        this.sharedControl = new Int32Array(this.sharedBuffer);
        Atomics.store(this.sharedControl, CTRL_IDX_JOB_EPOCH, this.jobEpoch);
        Atomics.store(this.sharedControl, CTRL_IDX_MINING_ACTIVE, 0);
        Atomics.store(this.sharedControl, CTRL_IDX_ABORT_BATCH, 0);
        Atomics.store(this.sharedControl, CTRL_IDX_INTENSITY, this.getIntensityCode(this.intensityMode));
        Atomics.store(this.sharedControl, CTRL_IDX_SKIPPED_ROUNDS, 0);
      }
    } catch (e) {
      console.warn('SharedArrayBuffer not supported or restricted, falling back to message sync:', e);
      this.sharedBuffer = null;
      this.sharedControl = null;
    }
  }

  private getIntensityCode(mode: IntensityMode): number {
    return mode === 'eco' ? 0 : mode === 'turbo' ? 2 : 1;
  }

  private initBlob(): void {
    if (!this.workerBlobUrl) {
      const blob = new Blob([MINER_WORKER_CODE], { type: 'application/javascript' });
      this.workerBlobUrl = URL.createObjectURL(blob);
    }
  }

  public setThreadCount(count: number): void {
    const newCount = Math.max(1, Math.min(count, 32));
    if (this.threadCount === newCount && this.workers.length === newCount) return;
    this.threadCount = newCount;
    if (this.isMining && this.currentJob) {
      this.restartWorkers();
    }
  }

  public setIntensityMode(mode: IntensityMode): void {
    this.intensityMode = mode;
    if (this.sharedControl) {
      Atomics.store(this.sharedControl, CTRL_IDX_INTENSITY, this.getIntensityCode(mode));
    }
    this.workers.forEach(worker => {
      worker.postMessage({
        type: 'SET_INTENSITY',
        intensity: mode
      });
    });
  }

  public getIntensityMode(): IntensityMode {
    return this.intensityMode;
  }

  public getThreadCount(): number {
    return this.threadCount;
  }

  public getCleanJobsCount(): number {
    return this.cleanJobsCount;
  }

  public getStaleJobsPrevented(): number {
    const sharedSkipped = this.sharedControl ? Atomics.load(this.sharedControl, CTRL_IDX_SKIPPED_ROUNDS) : 0;
    return this.staleJobsPrevented + sharedSkipped;
  }

  public isSharedSyncActive(): boolean {
    return this.sharedBuffer !== null && this.sharedControl !== null;
  }

  public startMining(job: MiningJob, diff: number = 0.0001): void {
    this.currentJob = job;
    this.difficulty = diff;
    this.isMining = true;
    this.currentJobVersion = Date.now();
    this.jobEpoch++;

    if (this.sharedControl) {
      Atomics.store(this.sharedControl, CTRL_IDX_MINING_ACTIVE, 1);
      Atomics.store(this.sharedControl, CTRL_IDX_ABORT_BATCH, 0);
      Atomics.store(this.sharedControl, CTRL_IDX_JOB_EPOCH, this.jobEpoch);
    }

    this.initBlob();
    this.restartWorkers();
  }

  /**
   * Ultra-fast Zero-Latency Job Skipping & Template Switching (<1ms).
   * Instantly halts active hashing batch loops across all threads via SharedArrayBuffer & Atomics.
   */
  public cleanJobsAndRestart(job: MiningJob): void {
    const cancelStart = performance.now();
    this.currentJob = job;
    this.currentJobVersion = Date.now();
    this.jobEpoch++;
    this.cleanJobsCount++;

    if (!this.isMining) return;

    // 1. INSTANT ATOMIC JOB-SKIPPING SIGNAL (<0.001ms):
    // Threads in the middle of a 100k-500k hash batch detect epoch change or abort flag on next slice and abort instantly
    if (this.sharedControl) {
      Atomics.store(this.sharedControl, CTRL_IDX_ABORT_BATCH, 1);
      Atomics.store(this.sharedControl, CTRL_IDX_JOB_EPOCH, this.jobEpoch);
    }

    if (this.workers.length === 0) {
      this.restartWorkers();
      return;
    }

    // 2. Broadcast new job payload & new epoch to all worker threads
    this.workers.forEach((worker, index) => {
      const nonceStart = Math.floor((0xffffffff / this.threadCount) * index) + Math.floor(Math.random() * 10000);
      worker.postMessage({
        type: 'CLEAN_JOB',
        job: this.currentJob,
        workerId: index,
        difficulty: this.difficulty,
        nonceStart: nonceStart,
        nonceStep: this.threadCount,
        intensity: this.intensityMode,
        jobVersion: this.currentJobVersion,
        jobEpoch: this.jobEpoch,
        sharedBuffer: this.sharedBuffer || undefined
      });
    });

    // 3. Reset abort flag once template payload has been dispatched
    if (this.sharedControl) {
      Atomics.store(this.sharedControl, CTRL_IDX_ABORT_BATCH, 0);
    }

    const elapsed = performance.now() - cancelStart;
    this.onCleanJobAck?.(job.jobId, elapsed);
  }

  public updateDifficulty(diff: number): void {
    this.difficulty = diff;
    this.workers.forEach(worker => {
      worker.postMessage({
        type: 'SET_DIFFICULTY',
        difficulty: this.difficulty
      });
    });
  }

  public stopMining(): void {
    this.isMining = false;
    if (this.sharedControl) {
      Atomics.store(this.sharedControl, CTRL_IDX_MINING_ACTIVE, 0);
      Atomics.store(this.sharedControl, CTRL_IDX_ABORT_BATCH, 1);
    }
    this.terminateWorkers();
  }

  private restartWorkers(): void {
    this.terminateWorkers();
    if (!this.currentJob) return;
    this.initBlob();

    let createdWorkers = 0;
    for (let i = 0; i < this.threadCount; i++) {
      try {
        if (!this.workerBlobUrl) break;
        const worker = new Worker(this.workerBlobUrl);
        const workerId = i;

        worker.onmessage = (event: MessageEvent<WorkerMessageFromWorker>) => {
          const msg = event.data;
          if (!msg) return;

          switch (msg.type) {
            case 'HASH_BATCH':
              this.onHashBatch?.(msg.hashes, msg.elapsedMs || 0, msg.nonce || 0, msg.workerId, msg.engine);
              break;
            case 'BEST_DIFF':
              if (msg.difficulty) {
                this.onBestDiff?.(msg.difficulty, msg.nonce || 0, msg.workerId);
              }
              break;
            case 'SHARE_FOUND':
              if (msg.difficulty && msg.jobId && msg.hashHex && msg.nonce !== undefined) {
                if (this.currentJob && msg.jobId === this.currentJob.jobId) {
                  this.onShareFound?.({
                    workerId: msg.workerId,
                    nonce: msg.nonce,
                    jobId: msg.jobId,
                    hashHex: msg.hashHex,
                    difficulty: msg.difficulty
                  });
                } else {
                  this.staleJobsPrevented++;
                }
              }
              break;
            case 'BLOCK_FOUND':
              if (msg.difficulty && msg.jobId && msg.hashHex && msg.nonce !== undefined) {
                this.onBlockFound?.({
                  workerId: msg.workerId,
                  nonce: msg.nonce,
                  jobId: msg.jobId,
                  hashHex: msg.hashHex,
                  difficulty: msg.difficulty
                });
              }
              break;
          }
        };

        // Assign each thread a distinct core-balanced nonce partition range
        const nonceStart = Math.floor((0xffffffff / this.threadCount) * workerId);
        worker.postMessage({
          type: 'START_JOB',
          job: this.currentJob,
          workerId: workerId,
          difficulty: this.difficulty,
          nonceStart: nonceStart,
          nonceStep: this.threadCount,
          intensity: this.intensityMode,
          jobVersion: this.currentJobVersion,
          jobEpoch: this.jobEpoch,
          sharedBuffer: this.sharedBuffer || undefined
        });

        this.workers.push(worker);
        createdWorkers++;
      } catch (err) {
        console.warn(`Worker ${i} instantiation error:`, err);
      }
    }
  }

  private terminateWorkers(): void {
    this.workers.forEach(w => {
      try {
        w.postMessage({ type: 'STOP' });
        w.terminate();
      } catch (e) {
        // ignore
      }
    });
    this.workers = [];
  }

  public destroy(): void {
    this.stopMining();
    if (this.workerBlobUrl) {
      URL.revokeObjectURL(this.workerBlobUrl);
      this.workerBlobUrl = null;
    }
  }
}
