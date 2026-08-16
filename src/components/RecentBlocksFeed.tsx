import React from 'react';
import { RecentBlock, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  Layers, 
  Clock, 
  ExternalLink, 
  Zap, 
  Pickaxe, 
  Coins, 
  FileText,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface RecentBlocksFeedProps {
  blocks?: RecentBlock[];
  currentBlockHeight: number;
  lang: Language;
  defaultExpanded?: boolean;
}

export const RecentBlocksFeed: React.FC<RecentBlocksFeedProps> = ({
  blocks = [],
  currentBlockHeight,
  lang,
  defaultExpanded = false
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultExpanded);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar';

  // Fallback demo blocks if API hasn't loaded yet
  const displayBlocks: RecentBlock[] = blocks && blocks.length > 0 ? blocks : [
    {
      height: currentBlockHeight,
      id: '000000000000000000018a3f89d41b61c92d5345ec4c748c2e680a6c02410a7b',
      timestamp: Date.now() - 480000,
      txCount: 3412,
      size: 1720000,
      minerName: 'Foundry USA',
      durationSeconds: 380, // 6m 20s
      rewardBtc: 3.18
    },
    {
      height: currentBlockHeight - 1,
      id: '000000000000000000021b44c688390bb9a1a798516ee892d19ec6859e8751fa',
      timestamp: Date.now() - 860000,
      txCount: 2890,
      size: 1580000,
      minerName: 'AntPool',
      durationSeconds: 940, // 15m 40s
      rewardBtc: 3.24
    },
    {
      height: currentBlockHeight - 2,
      id: '00000000000000000000cb75d14e0129bc61aa55490bc894b4cfda74288b854e',
      timestamp: Date.now() - 1800000,
      txCount: 4105,
      size: 1840000,
      minerName: 'F2Pool',
      durationSeconds: 190, // 3m 10s
      rewardBtc: 3.15
    },
    {
      height: currentBlockHeight - 3,
      id: '00000000000000000001aef91501b88e146746cf61b17a1f592fcfbcf193023e',
      timestamp: Date.now() - 1990000,
      txCount: 3204,
      size: 1650000,
      minerName: 'ViaBTC',
      durationSeconds: 610, // 10m 10s
      rewardBtc: 3.21
    }
  ];

  // Calculate average duration across recent blocks
  const validDurations = displayBlocks.map(b => b.durationSeconds || 600);
  const avgDurationSec = Math.round(validDurations.reduce((acc, v) => acc + v, 0) / validDurations.length);
  const avgDurationMin = (avgDurationSec / 60).toFixed(1);

  // Helper format time duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '10:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}${t.minShort} ${s.toString().padStart(2, '0')}${t.secShort}`;
  };

  // Helper format time ago
  const formatTimeAgo = (timestampMs: number) => {
    const elapsedSec = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
    if (elapsedSec < 60) return lang === 'ar' ? 'الآن' : 'just now';
    const m = Math.floor(elapsedSec / 60);
    if (m < 60) return `${m} ${t.minShort} ${t.timeAgo}`;
    const h = Math.floor(m / 60);
    return `${h} ${lang === 'ar' ? 'س' : 'h'} ${t.timeAgo}`;
  };

  return (
    <div 
      className="w-full bg-[#0e111a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl font-mono text-slate-300 overflow-hidden transition-all duration-300"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Clickable Header / Toggle Banner */}
      <button
        id="toggle-recent-blocks-accordion-btn"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full p-4 sm:p-4.5 flex flex-wrap items-center justify-between gap-3 text-start hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-white font-cairo">
                {t.recentBlocksTitle}
              </h3>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md font-mono">
                {displayBlocks.length} {lang === 'ar' ? 'كتل' : 'blocks'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-tajawal mt-0.5">
              {t.recentBlocksSubtitle}
            </p>
          </div>
        </div>

        {/* Right side status & Chevron */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 bg-[#141824] border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-slate-400 font-tajawal">
              {lang === 'ar' ? 'المتوسط:' : 'Avg:'}
            </span>
            <span className="font-bold text-amber-400" dir="ltr">
              ~{avgDurationMin} {t.minShort}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141824] border border-white/10 text-cyan-400 text-xs font-tajawal font-bold hover:border-cyan-500/40 transition-all">
            <span>{isOpen ? t.hideRecentBlocks : t.showRecentBlocks}</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Accordion Expandable Content */}
      {isOpen && (
        <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-white/10 mt-1">
          {/* Average Duration Mobile Badge */}
          <div className="flex sm:hidden items-center justify-between bg-[#141824] border border-white/10 px-3 py-2 rounded-xl text-xs font-mono">
            <span className="text-[11px] text-slate-400 font-tajawal flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'متوسط سرعة الكتل:' : 'Avg Block Time:'}</span>
            </span>
            <span className="font-bold text-amber-400" dir="ltr">
              ~{avgDurationMin} {t.minShort}
            </span>
          </div>

          {/* Blocks Grid / Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {displayBlocks.map((block, idx) => {
              const duration = block.durationSeconds || 600;
              const isFast = duration < 360; // < 6 mins
              const isSlow = duration > 780; // > 13 mins

              let badgeStyle = 'bg-slate-800/60 text-slate-300 border-white/10';
              let badgeLabel = t.normalBlockBadge;
              let durationColor = 'text-slate-200';

              if (isFast) {
                badgeStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
                badgeLabel = t.fastBlockBadge;
                durationColor = 'text-emerald-400';
              } else if (isSlow) {
                badgeStyle = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
                badgeLabel = t.slowBlockBadge;
                durationColor = 'text-amber-400';
              }

              const mempoolUrl = `https://mempool.space/block/${block.id || block.height}`;

              return (
                <div
                  key={block.height || idx}
                  className="bg-[#141824]/90 border border-white/10 hover:border-cyan-500/40 rounded-xl p-3 shadow-md transition-all duration-200 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] flex flex-col justify-between group"
                >
                  {/* Top: Block Height & Badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                      <span className="font-bold text-sm text-white font-mono" dir="ltr">
                        #{block.height.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeStyle}`}>
                        {badgeLabel}
                      </span>
                      <a
                        href={mempoolUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-cyan-400 transition-colors p-1 rounded hover:bg-white/5"
                        title={t.viewMempool}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Middle: Details Matrix */}
                  <div className="grid grid-cols-2 gap-2 my-2.5 text-xs font-mono">
                    {/* Duration */}
                    <div className="bg-[#0e111a] p-2 rounded-lg border border-white/5">
                      <div className="text-[10px] text-slate-400 font-tajawal flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{t.blockDuration}</span>
                      </div>
                      <div className={`font-bold font-mono mt-0.5 ${durationColor}`} dir="ltr">
                        {formatDuration(block.durationSeconds)}
                      </div>
                    </div>

                    {/* Miner Pool */}
                    <div className="bg-[#0e111a] p-2 rounded-lg border border-white/5">
                      <div className="text-[10px] text-slate-400 font-tajawal flex items-center gap-1">
                        <Pickaxe className="w-3 h-3 text-amber-400" />
                        <span>{t.blockMiner}</span>
                      </div>
                      <div className="font-bold text-slate-200 truncate mt-0.5" title={block.minerName} dir="ltr">
                        {block.minerName || 'Unknown'}
                      </div>
                    </div>

                    {/* TXs Count */}
                    <div className="bg-[#0e111a] p-2 rounded-lg border border-white/5">
                      <div className="text-[10px] text-slate-400 font-tajawal flex items-center gap-1">
                        <FileText className="w-3 h-3 text-emerald-400" />
                        <span>{t.blockTxsCount}</span>
                      </div>
                      <div className="font-bold text-slate-200 mt-0.5" dir="ltr">
                        {block.txCount.toLocaleString()}
                      </div>
                    </div>

                    {/* Reward & Size */}
                    <div className="bg-[#0e111a] p-2 rounded-lg border border-white/5">
                      <div className="text-[10px] text-slate-400 font-tajawal flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-400" />
                        <span>{lang === 'ar' ? 'المكافأة' : 'Reward'}</span>
                      </div>
                      <div className="font-bold text-amber-400 mt-0.5" dir="ltr">
                        {(block.rewardBtc || 3.125).toFixed(2)} BTC
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Time Ago & Hash Slice */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1.5 border-t border-white/5" dir="ltr">
                    <span className="truncate max-w-[140px] text-slate-600 hover:text-slate-400 transition-colors">
                      {block.id ? `${block.id.slice(0, 10)}...${block.id.slice(-6)}` : ''}
                    </span>
                    <span className="text-slate-400 font-tajawal font-medium">
                      {formatTimeAgo(block.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Educational Note */}
          <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-300/90 font-tajawal flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'تُظهر هذه البيانات الحية تباين سرعة حل الكتل: بعض الكتل تُحل خلال دقيقة واحدة وأخرى تستغرق أكثر من 20 دقيقة، بمعدل وسطي قدره 10 دقائق.'
                : 'Live data confirms the natural Poisson variance: some blocks solve in 2 minutes while others take 20+ minutes, averaging 10 minutes overall.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
