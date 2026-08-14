import { IntensityMode, MiningJob, WorkerMessageFromWorker } from '../types';
import { MINER_WORKER_CODE } from './minerWorkerSource';

export class WorkerManager {
  private workers: Worker[] = [];
  private workerBlobUrl: string | null = null;
  private threadCount: number = 2;
  private currentJob: MiningJob | null = null;
  private difficulty: number = 0.0001; // Share difficulty target
  private isMining: boolean = false;
  private intensityMode: IntensityMode = 'balanced';
  private currentJobVersion: number = Date.now();
  private cleanJobsCount: number = 0;
  private staleJobsPrevented: number = 0;
  
  // Callback handlers
  public onHashBatch?: (hashes: number, elapsedMs: number, nonce: number, workerId: number, engine?: 'WASM' | 'UNROLLED_JS') => void;
  public onBestDiff?: (diff: number, nonce: number, workerId: number) => void;
  public onShareFound?: (data: { workerId: number; nonce: number; jobId: string; hashHex: string; difficulty: number }) => void;
  public onBlockFound?: (data: { workerId: number; nonce: number; jobId: string; hashHex: string; difficulty: number }) => void;
  public onCleanJobAck?: (jobId: string, latencyMs: number) => void;

  constructor(threads: number = 2, intensity: IntensityMode = 'balanced') {
    this.threadCount = Math.max(1, Math.min(threads, 32));
    this.intensityMode = intensity;
    this.initBlob();
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
    return this.staleJobsPrevented;
  }

  public startMining(job: MiningJob, diff: number = 0.0001): void {
    this.currentJob = job;
    this.difficulty = diff;
    this.isMining = true;
    this.currentJobVersion = Date.now();
    this.initBlob();
    this.restartWorkers();
  }

  /**
   * Ultra-fast Zero-Latency Job Cancellation & Template Switching (<1ms).
   * Prevents computing stale hashes immediately upon receiving new clean_jobs notify.
   */
  public cleanJobsAndRestart(job: MiningJob): void {
    const cancelStart = performance.now();
    this.currentJob = job;
    this.currentJobVersion = Date.now();
    this.cleanJobsCount++;

    if (!this.isMining) return;

    if (this.workers.length === 0) {
      this.restartWorkers();
      return;
    }

    // Broadcast instantaneous high-priority CLEAN_JOB message without recreating worker threads
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
        jobVersion: this.currentJobVersion
      });
    });

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
    this.terminateWorkers();
  }

  private restartWorkers(): void {
    this.terminateWorkers();
    if (!this.workerBlobUrl || !this.currentJob) return;

    for (let i = 0; i < this.threadCount; i++) {
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
              // Stale job check: only submit shares for active job
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
        jobVersion: this.currentJobVersion
      });

      this.workers.push(worker);
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
    this.terminateWorkers();
    if (this.workerBlobUrl) {
      URL.revokeObjectURL(this.workerBlobUrl);
      this.workerBlobUrl = null;
    }
  }
}
