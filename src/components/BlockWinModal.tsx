import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Coins, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  X,
  Share2
} from 'lucide-react';
import { NetworkData, PoolConfig, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface BlockWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockHeight: number;
  hashHex: string;
  network: NetworkData;
  config: PoolConfig;
  lang: Language;
}

export const BlockWinModal: React.FC<BlockWinModalProps> = ({
  isOpen,
  onClose,
  blockHeight,
  hashHex,
  network,
  config,
  lang
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar';

  useEffect(() => {
    if (!isOpen) return;

    // Fire fireworks confetti
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        particleCount,
        origin: { x: 0.1, y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#ffffff']
      });
      confetti({
        particleCount,
        origin: { x: 0.9, y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#ffffff']
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const rewardBtc = 3.125;
  const rewardUsd = rewardBtc * network.btcPriceUsd;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative w-full max-w-lg bg-[#0c0f17] border-2 border-amber-500 rounded-3xl shadow-[0_0_90px_rgba(245,158,11,0.4)] overflow-hidden font-mono text-slate-100 p-6 sm:p-8 text-center">
        
        {/* Close Button */}
        <button
          id="close-block-win-modal-btn"
          onClick={onClose}
          className="absolute top-4 left-4 sm:left-auto sm:right-4 p-2 rounded-xl bg-[#141824] border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Trophy Graphic with Golden Ring */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-4 shadow-[0_0_40px_rgba(245,158,11,0.6)] flex items-center justify-center animate-bounce">
          <Trophy className="w-12 h-12 text-slate-950" />
        </div>

        {/* Title */}
        <div className="mt-5 space-y-1.5">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black tracking-wider uppercase font-tajawal">
            {t.jackpotWonTitle}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mt-2 font-cairo">
            {t.blockSolvedTitle}
          </h2>
          <p className="text-xs text-slate-400 font-tajawal">
            {t.blockCandidateSolved} <span className="font-mono font-bold text-amber-400" dir="ltr">#{blockHeight.toLocaleString()}</span> {lang === 'ar' ? 'بواسطة أنوية جهازك!' : 'by your Web Worker!'}
          </p>
        </div>

        {/* Reward Value Card */}
        <div className="my-5 bg-[#121622] border border-white/10 p-5 rounded-2xl space-y-1.5 shadow-inner">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-bold font-tajawal">
            {t.estimatedReward}
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 tracking-tight text-glow-emerald" dir="ltr">
            +{rewardBtc} BTC
          </div>
          <div className="text-sm font-mono text-slate-400" dir="ltr">
            ≈ ${rewardUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </div>
        </div>

        {/* Block & Payout Details */}
        <div className="bg-[#121622] p-4 rounded-2xl border border-white/10 text-xs space-y-2.5 font-mono shadow-sm" dir="ltr">
          <div className="flex justify-between text-left items-center">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">{lang === 'ar' ? 'التجزئة الفائزة:' : 'Winning Hash:'}</span>
            <span className="text-cyan-400 font-bold truncate max-w-[220px]">
              {hashHex || '00000000000000000003b8e92f14ac61a...'}
            </span>
          </div>
          <div className="flex justify-between text-left items-center">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">{lang === 'ar' ? 'عنوان المحفظة:' : 'Payout Address:'}</span>
            <span className="text-amber-400 font-bold truncate max-w-[220px]">
              {config.btcAddress}
            </span>
          </div>
          <div className="flex justify-between text-left items-center">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">{lang === 'ar' ? 'البروتوكول:' : 'Pool Protocol:'}</span>
            <span className="text-emerald-400 font-bold">Stratum v1 Solo</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex gap-3 justify-center">
          <button
            id="claim-reward-btn"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs tracking-widest uppercase shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all active:scale-95 cursor-pointer font-cairo"
          >
            {t.continueMining}
          </button>
        </div>
      </div>
    </div>
  );
};
