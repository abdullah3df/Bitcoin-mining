import { NetworkData } from '../types';

export const DEFAULT_NETWORK_DATA: NetworkData = {
  btcPriceUsd: 96450,
  btcPriceChange24h: 2.34,
  blockHeight: 884120,
  networkDifficulty: 108.45, // Trillion
  difficultyProgress: 64.2,
  halvingProgress: 21.5,
  fastestFee: 12,
  halfHourFee: 9,
  hourFee: 6,
  minimumFee: 4,
  unconfirmedTxs: 142500,
  lastBlockTime: Date.now(),
  networkHashrateEH: 745.2
};

export async function fetchBitcoinNetworkData(): Promise<NetworkData> {
  const result: NetworkData = { ...DEFAULT_NETWORK_DATA };

  // 1. Fetch BTC Price from CoinGecko, with Binance fallback
  try {
    const cgRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
      { headers: { 'Accept': 'application/json' } }
    );
    if (cgRes.ok) {
      const data = await cgRes.json();
      if (data.bitcoin) {
        result.btcPriceUsd = data.bitcoin.usd || result.btcPriceUsd;
        result.btcPriceChange24h = data.bitcoin.usd_24h_change || 0;
      }
    } else {
      throw new Error('CoinGecko rate limit');
    }
  } catch (e) {
    // Fallback to Binance public ticker
    try {
      const bnRes = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
      if (bnRes.ok) {
        const bnData = await bnRes.json();
        result.btcPriceUsd = parseFloat(bnData.lastPrice) || result.btcPriceUsd;
        result.btcPriceChange24h = parseFloat(bnData.priceChangePercent) || result.btcPriceChange24h;
      }
    } catch (e2) {
      // Keep defaults
    }
  }

  // 2. Fetch Mempool.space Blockchain Info
  try {
    // Latest Blocks & Block Timestamp
    const blocksRes = await fetch('https://mempool.space/api/v1/blocks');
    if (blocksRes.ok) {
      const blocks = await blocksRes.json();
      if (Array.isArray(blocks) && blocks.length > 0) {
        const latestBlock = blocks[0];
        if (latestBlock.height) result.blockHeight = latestBlock.height;
        if (latestBlock.timestamp) {
          result.lastBlockTime = latestBlock.timestamp * 1000;
        }

        // Map recent 6 blocks
        result.recentBlocks = blocks.slice(0, 6).map((b: any, idx: number) => {
          const prevBlock = blocks[idx + 1];
          const duration = prevBlock && b.timestamp && prevBlock.timestamp
            ? Math.max(1, b.timestamp - prevBlock.timestamp)
            : 600; // default 10m
          
          const poolName = b.extras?.pool?.name || (b.miner ? b.miner : 'Unknown Pool');
          const reward = b.extras?.reward ? b.extras.reward / 1e8 : 3.125;

          return {
            height: b.height,
            id: b.id,
            timestamp: b.timestamp * 1000,
            txCount: b.tx_count || 0,
            size: b.size || 0,
            minerName: poolName,
            durationSeconds: duration,
            rewardBtc: reward
          };
        });
      }
    } else {
      // Fallback: Block height tip
      const tipRes = await fetch('https://mempool.space/api/blocks/tip/height');
      if (tipRes.ok) {
        result.blockHeight = await tipRes.json();
      }
    }

    // Calculate 5th halving progress (Block 840,000 to 1,050,000)
    const currentEpochBlocks = result.blockHeight - 840000;
    result.halvingProgress = Math.min(100, Math.max(0, (currentEpochBlocks / 210000) * 100));

    // Difficulty progress (every 2016 blocks)
    const diffBlocks = result.blockHeight % 2016;
    result.difficultyProgress = (diffBlocks / 2016) * 100;

    // Recommended fees
    const feesRes = await fetch('https://mempool.space/api/v1/fees/recommended');
    if (feesRes.ok) {
      const fees = await feesRes.json();
      result.fastestFee = fees.fastestFee || result.fastestFee;
      result.halfHourFee = fees.halfHourFee || result.halfHourFee;
      result.hourFee = fees.hourFee || result.hourFee;
      result.minimumFee = fees.minimumFee || result.minimumFee;
    }

    // Mempool stats
    const mempoolRes = await fetch('https://mempool.space/api/mempool');
    if (mempoolRes.ok) {
      const mempool = await mempoolRes.json();
      result.unconfirmedTxs = mempool.count || result.unconfirmedTxs;
    }

    // Difficulty and hashrate estimation
    const hashrateRes = await fetch('https://mempool.space/api/v1/mining/hashrate/3d');
    if (hashrateRes.ok) {
      const hrData = await hashrateRes.json();
      if (hrData.currentDifficulty) {
        result.networkDifficulty = hrData.currentDifficulty / 1e12;
      }
      if (hrData.currentHashrate) {
        result.networkHashrateEH = hrData.currentHashrate / 1e18;
      }
    }
  } catch (err) {
    console.warn('Mempool API fetch notice:', err);
  }

  return result;
}
