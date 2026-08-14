import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Sun, 
  SunMedium, 
  Check, 
  Download, 
  Share2, 
  X, 
  Sparkles,
  Zap
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface MobileFloatingWidgetProps {
  hashRate: number;
  isMining: boolean;
  activeThreads: number;
  lang: Language;
  onOpenSettings: () => void;
  onToggleMiniMode: () => void;
}

export const MobileFloatingWidget: React.FC<MobileFloatingWidgetProps> = ({
  hashRate,
  isMining,
  activeThreads,
  lang,
  onOpenSettings,
  onToggleMiniMode
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar';

  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [wakeLockSupported, setWakeLockSupported] = useState<boolean>(false);
  const [showPwaModal, setShowPwaModal] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<any>(null);

  // Check WakeLock support
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      setWakeLockSupported(true);
      // Auto-request wakeLock if mining
      requestWakeLock();
    }

    // Listen to PWA install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, []);

  // Request screen wake lock
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const sentinel = await (navigator as any).wakeLock.request('screen');
        setWakeLockSentinel(sentinel);
        setWakeLockActive(true);
        sentinel.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      }
    } catch {
      setWakeLockActive(false);
    }
  };

  const toggleWakeLock = async () => {
    if (wakeLockActive && wakeLockSentinel) {
      try {
        await wakeLockSentinel.release();
        setWakeLockSentinel(null);
        setWakeLockActive(false);
      } catch {
        setWakeLockActive(false);
      }
    } else {
      await requestWakeLock();
    }
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPwaModal(false);
      }
    } else {
      setShowPwaModal(true);
    }
  };

  const hrFormatted = hashRate >= 1000000 
    ? `${(hashRate / 1000000).toFixed(2)} MH/s`
    : hashRate >= 1000
    ? `${(hashRate / 1000).toFixed(1)} kH/s`
    : `${hashRate.toFixed(0)} H/s`;

  return (
    <>
      {/* Floating Bottom Quick Action Mobile Dock Bar */}
      <aside 
        aria-label="Mobile Quick Dock"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-[500px] bg-[#0c0f18]/90 backdrop-blur-xl border border-amber-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.15)] rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2 select-none font-sans"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Live Hashrate Badge */}
        <div className="flex items-center gap-2 font-mono">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping" />
            <span className="absolute w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-tajawal font-bold leading-none">
              {lang === 'ar' ? 'التعدين الحي' : 'Live Hash'}
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-400 font-mono tracking-tight" dir="ltr">
              {hrFormatted}
            </span>
          </div>
        </div>

        {/* Action Buttons: Screen Wake Lock + PWA Floating Icon + Mini Mode */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Screen Wake Lock Button */}
          <button
            id="mobile-wake-lock-toggle-btn"
            onClick={toggleWakeLock}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold font-tajawal cursor-pointer transition-all active:scale-95 ${
              wakeLockActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-[#151926] text-slate-400 border-white/10 hover:text-slate-200'
            }`}
            title={wakeLockActive ? t.wakeLockActive : t.wakeLockDisabled}
          >
            {wakeLockActive ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ) : (
              <SunMedium className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="hidden xs:inline">
              {wakeLockActive ? (lang === 'ar' ? 'الشاشة مضاءة' : 'Awake') : (lang === 'ar' ? 'إبقاء الشاشة' : 'Keep Awake')}
            </span>
          </button>

          {/* Add to Phone Home Screen (PWA Icon) */}
          <button
            id="mobile-pwa-install-btn"
            onClick={handleInstallPwa}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-cyan-600/10 hover:from-cyan-500/30 hover:to-cyan-600/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold font-tajawal cursor-pointer transition-all active:scale-95 shadow-sm"
            title={t.pwaInstallTitle}
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'ar' ? 'أيقونة بالهاتف' : 'App Icon'}</span>
          </button>
        </div>
      </aside>

      {/* PWA Phone Icon Guide Modal */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="relative w-full max-w-md bg-[#0f121d] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4 font-sans text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-cairo">
                    {lang === 'ar' ? 'تثبيت كأيقونة تطبيق على هاتفك' : 'Add to Phone Home Screen'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-tajawal">
                    {lang === 'ar' ? 'تشغيل سريع ومستمر بدون شريط المتصفح' : 'Quick standalone launcher for your phone'}
                  </p>
                </div>
              </div>
              <button
                id="close-pwa-modal-btn"
                onClick={() => setShowPwaModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step-by-step Instructions for Android & iPhone */}
            <div className="space-y-3 text-xs leading-relaxed font-tajawal">
              {/* Android Box */}
              <div className="p-3 rounded-xl bg-[#141824] border border-white/10 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>📱 أندرويد (Google Chrome / Samsung Internet):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] pr-1">
                  <li>اضغط على زر الخيارات <strong>(⋮) الثلاث نقاط</strong> في أعلى أو أسفل المتصفح.</li>
                  <li>اختر <strong>"الإضافة إلى الشاشة الرئيسية" (Add to Home screen)</strong> أو <strong>"تثبيت التطبيق" (Install)</strong>.</li>
                  <li>ستظهر أيقونة البيتكوين ₿ مباشرة مع تطبيقات هاتفك!</li>
                </ol>
              </div>

              {/* iPhone Box */}
              <div className="p-3 rounded-xl bg-[#141824] border border-white/10 space-y-1.5">
                <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <span>🍎 آيفون (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] pr-1">
                  <li>اضغط على زر المشاركة <Share2 className="w-3 h-3 inline text-cyan-300 mx-0.5" /> في أسفل المتصفح.</li>
                  <li>مرر للأسفل واختر <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</strong>.</li>
                  <li>اضغط <strong>"إضافة" (Add)</strong> في الزاوية العلوية.</li>
                </ol>
              </div>

              {/* Tip regarding Mining while multitasking */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  {lang === 'ar' 
                    ? 'نصيحة: ميزة "إبقاء الشاشة مضاءة" مفعلة تلقائياً لضمان استمرار التعدين وحساب التجزئات دون أن يقفل الهاتف شاشته.' 
                    : 'Tip: The screen stay-awake feature is enabled so mining continues without interruption.'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-1">
              <button
                id="ack-pwa-guide-btn"
                onClick={() => setShowPwaModal(false)}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-tajawal transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                {lang === 'ar' ? 'فهمت، شكراً' : 'Got it!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
