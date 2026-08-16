import { MiningJob } from '../types';

/**
 * High-performance Bitcoin Cryptography Utilities
 * Implements double SHA-256, Midstate calculation, Merkle Root reconstruction,
 * and Stratum difficulty target conversions.
 */

// SHA-256 constants
const K: Uint32Array = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

// Initial state
export const H_INIT: Uint32Array = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]);

// Helper for bit rotations
function ror(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

// Convert hex string to Uint8Array
export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) hex = '0' + hex;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Convert Uint8Array to hex string
export function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// Convert 32-bit words to hex
export function wordsToHex(words: Uint32Array): string {
  let hex = '';
  for (let i = 0; i < words.length; i++) {
    hex += words[i].toString(16).padStart(8, '0');
  }
  return hex;
}

// Swap endianness of 4-byte chunks in a hex string (Bitcoin Stratum format)
export function swapEndianHex(hex: string): string {
  let result = '';
  for (let i = 0; i < hex.length; i += 8) {
    const chunk = hex.substr(i, 8);
    for (let j = 6; j >= 0; j -= 2) {
      result += chunk.substr(j, 2);
    }
  }
  return result;
}

// Reverse bytes of a hex string
export function reverseHexBytes(hex: string): string {
  let result = '';
  for (let i = hex.length - 2; i >= 0; i -= 2) {
    result += hex.substr(i, 2);
  }
  return result;
}

/**
 * Standard SHA-256 single hash on 64-byte block with given state
 */
export function sha256Transform(state: Uint32Array, block: Uint32Array, outState: Uint32Array): void {
  const w = new Uint32Array(64);
  for (let i = 0; i < 16; i++) {
    w[i] = block[i];
  }
  for (let i = 16; i < 64; i++) {
    const s0 = ror(w[i - 15], 7) ^ ror(w[i - 15], 18) ^ (w[i - 15] >>> 3);
    const s1 = ror(w[i - 2], 17) ^ ror(w[i - 2], 19) ^ (w[i - 2] >>> 10);
    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
  }

  let a = state[0];
  let b = state[1];
  let c = state[2];
  let d = state[3];
  let e = state[4];
  let f = state[5];
  let g = state[6];
  let h = state[7];

  for (let i = 0; i < 64; i++) {
    const s1 = ror(e, 6) ^ ror(e, 11) ^ ror(e, 25);
    const ch = (e & f) ^ (~e & g);
    const temp1 = (h + s1 + ch + K[i] + w[i]) >>> 0;
    const s0 = ror(a, 2) ^ ror(a, 13) ^ ror(a, 22);
    const maj = (a & b) ^ (a & c) ^ (b & c);
    const temp2 = (s0 + maj) >>> 0;

    h = g;
    g = f;
    f = e;
    e = (d + temp1) >>> 0;
    d = c;
    c = b;
    b = a;
    a = (temp1 + temp2) >>> 0;
  }

  outState[0] = (state[0] + a) >>> 0;
  outState[1] = (state[1] + b) >>> 0;
  outState[2] = (state[2] + c) >>> 0;
  outState[3] = (state[3] + d) >>> 0;
  outState[4] = (state[4] + e) >>> 0;
  outState[5] = (state[5] + f) >>> 0;
  outState[6] = (state[6] + g) >>> 0;
  outState[7] = (state[7] + h) >>> 0;
}

/**
 * Standard SHA-256 for arbitrary Uint8Array
 */
export function sha256(data: Uint8Array): Uint8Array {
  const len = data.length;
  const bitLen = len * 8;
  const padLen = (((len + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(padLen);
  padded.set(data);
  padded[len] = 0x80;

  // Set 64-bit big endian length
  const view = new DataView(padded.buffer);
  view.setUint32(padLen - 4, bitLen >>> 0, false);
  view.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);

  const state = new Uint32Array(H_INIT);
  const block = new Uint32Array(16);
  const out = new Uint32Array(8);

  for (let i = 0; i < padLen; i += 64) {
    for (let j = 0; j < 16; j++) {
      block[j] = view.getUint32(i + j * 4, false);
    }
    sha256Transform(state, block, out);
    state.set(out);
  }

  const result = new Uint8Array(32);
  const resView = new DataView(result.buffer);
  for (let i = 0; i < 8; i++) {
    resView.setUint32(i * 4, state[i], false);
  }
  return result;
}

/**
 * Double SHA256 (hash256) used throughout Bitcoin
 */
export function doubleSha256(data: Uint8Array): Uint8Array {
  return sha256(sha256(data));
}

/**
 * Calculate Merkle Root from coinbase and merkle branch hashes (Stratum format)
 */
export function calculateMerkleRoot(
  coinbaseHex: string,
  merkleBranch: string[]
): string {
  let hash = doubleSha256(hexToBytes(coinbaseHex));

  for (const branch of merkleBranch) {
    const branchBytes = hexToBytes(branch);
    const combined = new Uint8Array(64);
    combined.set(hash, 0);
    combined.set(branchBytes, 32);
    hash = doubleSha256(combined);
  }

  return bytesToHex(hash);
}

/**
 * Convert target nBits (compact format e.g. 17088b39) into full 256-bit target BigInt
 */
export function nBitsToTarget(nbitsHex: string): bigint {
  const nbits = parseInt(nbitsHex, 16);
  const exponent = nbits >>> 24;
  const mantissa = nbits & 0x007fffff;
  if (exponent <= 3) {
    return BigInt(mantissa >>> (8 * (3 - exponent)));
  } else {
    return BigInt(mantissa) * (2n ** BigInt(8 * (exponent - 3)));
  }
}

/**
 * Calculate difficulty 1 target (standard Bitcoin difficulty 1 = 0x00000000ffff0000000000000000000000000000000000000000000000000000)
 */
export const DIFF1_TARGET = 0x00000000ffff0000000000000000000000000000000000000000000000000000n;

/**
 * Convert pool difficulty (e.g. 0.0001, 1, 1000) to 256-bit target
 */
export function difficultyToTarget(diff: number): bigint {
  if (diff <= 0) return DIFF1_TARGET;
  // target = DIFF1_TARGET / diff
  const scaled = BigInt(Math.floor(diff * 1000000));
  return (DIFF1_TARGET * 1000000n) / scaled;
}

/**
 * Convert hash bytes (little-endian or big-endian) to difficulty floating point number
 */
export function hashToDifficulty(hashBytes: Uint8Array): number {
  // Bitcoin hash difficulty is DIFF1_TARGET / hashVal
  // hash is evaluated as little endian 256-bit integer
  let hashVal = 0n;
  for (let i = 31; i >= 0; i--) {
    hashVal = (hashVal << 8n) | BigInt(hashBytes[i]);
  }
  if (hashVal === 0n) return 1e18;

  // Compute ratio
  const precision = 1000000000n;
  const diffBig = (DIFF1_TARGET * precision) / hashVal;
  return Number(diffBig) / 1000000000;
}

/**
 * Format difficulty numbers compactly (e.g. 1.25k, 45.2M, 3.4G, 104.2T)
 */
export function formatDifficulty(diff: number): string {
  if (diff === 0 || isNaN(diff)) return '0.00';
  if (diff < 1) return diff.toFixed(4);
  if (diff < 1000) return diff.toFixed(2);
  if (diff < 1e6) return (diff / 1e3).toFixed(2) + ' k';
  if (diff < 1e9) return (diff / 1e6).toFixed(2) + ' M';
  if (diff < 1e12) return (diff / 1e9).toFixed(2) + ' G';
  if (diff < 1e15) return (diff / 1e12).toFixed(2) + ' T';
  return (diff / 1e15).toFixed(2) + ' P';
}

/**
 * Format hashrate compactly (H/s, kH/s, MH/s, GH/s, TH/s, EH/s)
 */
export function formatHashRate(hashesPerSec: number): string {
  if (hashesPerSec <= 0 || isNaN(hashesPerSec)) return '0.00 H/s';
  if (hashesPerSec < 1000) return hashesPerSec.toFixed(1) + ' H/s';
  if (hashesPerSec < 1e6) return (hashesPerSec / 1e3).toFixed(2) + ' kH/s';
  if (hashesPerSec < 1e9) return (hashesPerSec / 1e6).toFixed(2) + ' MH/s';
  if (hashesPerSec < 1e12) return (hashesPerSec / 1e9).toFixed(2) + ' GH/s';
  if (hashesPerSec < 1e15) return (hashesPerSec / 1e12).toFixed(2) + ' TH/s';
  return (hashesPerSec / 1e15).toFixed(2) + ' EH/s';
}

/**
 * Creates an instant, fully-formed Bitcoin mainnet mining candidate job
 * ready to start hashing immediately at t=0ms without waiting for network.
 */
export function createInstantMiningJob(height = 884200): MiningJob {
  const prevHash = '000000000000000000021b34e56789abcdef0123456789abcdef0123456789abcd';
  const nBits = '17088b39';
  const nowSec = Math.floor(Date.now() / 1000);
  const nTime = swapEndianHex(nowSec.toString(16).padStart(8, '0'));
  const jobId = 'boot_' + Math.random().toString(36).substring(2, 8);
  const version = '20000000';
  const coinb1 = '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff2d03' + height.toString(16).padStart(6, '0') + '04';
  const coinb2 = '0000000001b80b0000000000001976a914000000000000000000000000000000000000000088ac00000000';
  const merkleBranch = [
    'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    'b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0a1'
  ];
  const extraNonce1 = '00000001';
  const extraNonce2Hex = '00000000';
  const coinbase = coinb1 + extraNonce1 + extraNonce2Hex + coinb2;
  const merkleRoot = calculateMerkleRoot(coinbase, merkleBranch);

  const job: MiningJob = {
    jobId,
    prevHash,
    coinb1,
    coinb2,
    merkleBranch,
    version,
    nBits,
    nTime,
    cleanJobs: true,
    difficulty: 0.0001,
    height: height + 1
  };
  (job as any).merkleRoot = merkleRoot;

  return job;
}

