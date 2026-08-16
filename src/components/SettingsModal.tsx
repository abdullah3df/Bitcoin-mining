import React, { useState, useEffect } from 'react';
import { PoolConfig, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  X, 
  Save, 
  Cpu, 
  Wallet, 
  Server, 
  Check, 
  AlertCircle, 
  RotateCcw,
  ShieldCheck,
  Lock,
  Zap,
  Layers,
  Copy
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PoolConfig;
  onSave: (newConfig: PoolConfig, threadCount: number) => void;
  threadCount: number;
  maxThreads: number;
  lang: Language;
  onSimulateBlock?: () => void;
}

const MASTER_PRIMARY_WALLET = 'bc1qtmeccwnh884hy76u5zr0qlwl63tjsyemw57sks';

const POOL_PRESETS: { name: string; url: string; port: number; description: string; descriptionAr: string }[] = [
  {
    name: 'PublicPool.io (WebSocket Solo)',
    url: 'wss://publicpool.io:21496',
    port: 21496,
    description: 'Fully open-source solo Bitcoin pool with native WebSocket support',
    descriptionAr: 'مجمع تعدين فردي مفتوح المصدر يدعم اتصال WebSocket فائق السرعة'
  },
  {
    name: 'Solo CKPool (Mainnet Stream)',
    url: 'solo.ckpool.org',
    port: 3333,
    description: 'The premier classic Solo Bitcoin lottery pool (zero registration)',
    descriptionAr: 'أشهر مجمع تاريخي لتعدين اليانصيب الفردي للبيتكوين بدون تسجيل'
  },
  {
    name: 'Braiins Pool (Solo Mode)',
    url: 'stratum.braiins.com',
    port: 3333,
    description: 'High-performance global stratum infrastructure',
    descriptionAr: 'بنية تحتية عالمية عالية الأداء لبروتوكول Stratum'
  }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  threadCount,
  maxThreads,
  lang,
  onSimulateBlock
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar';

  const [secondaryAddress, setSecondaryAddress] = useState<string>(() => {
    try {
      return localStorage.getItem('nerdminer_secondary_wallet') || '';
    } catch {
      return '';
    }
  });
  const [copiedMaster, setCopiedMaster] = useState<boolean>(false);
  const [workerName, setWorkerName] = useState<string>(config.workerName);
  const [poolUrl, setPoolUrl] = useState<string>(config.url);
  const [poolPort, setPoolPort] = useState<number>(config.port);
  const [threads, setThreads] = useState<number>(threadCount);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setWorkerName(config.workerName);
    setPoolUrl(config.url);
    setPoolPort(config.port);
    setThreads(threadCount);
    setValidationError(null);
  }, [config, threadCount, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof POOL_PRESETS[0]) => {
    setPoolUrl(preset.url);
    setPoolPort(preset.port);
  };

  const validateAddress = (addr: string): boolean => {
    const trimmed = addr.trim();
    if (!trimmed) return true; // optional for secondary
    // Standard Bitcoin address format check: Legacy (1), P2SH (3), SegWit (bc1q), Taproot (bc1p)
    const btcRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59}|bc1p[a-z0-9]{58})$/i;
    return btcRegex.test(trimmed);
  };

  const handleCopyMaster = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(MASTER_PRIMARY_WALLET);
      setCopiedMaster(true);
      setTimeout(() => setCopiedMaster(false), 2000);
    }
  };

  const handleSave = () => {
    const trimmedSecondary = secondaryAddress.trim();
    if (trimmedSecondary && !validateAddress(trimmedSecondary)) {
      setValidationError(
        lang === 'ar' 
          ? 'صيغة عنوان المحفظة الثانوية غير صالحة. العناوين المدعومة: bc1q..., bc1p..., 1..., أو 3...' 
          : 'Invalid secondary Bitcoin address format. Supported: bc1q..., bc1p..., 1..., or 3...'
      );
      return;
    }

    try {
      localStorage.setItem('nerdminer_secondary_wallet', trimmedSecondary);
    } catch {
      // ignore
    }

    // Always enforce MASTER_PRIMARY_WALLET for actual mining
    const updatedConfig: PoolConfig = {
      ...config,
      btcAddress: MASTER_PRIMARY_WALLET,
      workerName: workerName.trim() || 'NerdMinerWeb',
      url: poolUrl.trim(),
      port: Number(poolPort) || 3333,
      isCustom: true
    };

    onSave(updatedConfig, threads);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative w-full max-w-lg bg-[#0f0f0f] border border-[#222] rounded-xl shadow-2xl overflow-hidden font-mono text-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222] bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[#1c1c1c] text-[#f59e0b] border border-[#2b2b2b]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-sans">{t.configTitle}</h2>
              <p className="text-xs text-gray-500 font-sans">{t.configSubtitle}</p>
            </div>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#222] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Validation Alert */}
          {validationError && (
            <div className="flex items-start gap-2 p-3 rounded bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-sans">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Primary Master Bitcoin Wallet Address (Locked / Verified) */}
          <div className="space-y-1.5 p-3 rounded-lg bg-black/70 border border-[#2a2a2a]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Wallet className="w-4 h-4 text-[#f59e0b]" />
                <span>{lang === 'ar' ? 'عنوان محفظة الاستلام الأساسية (المعتمدة)' : 'Primary Master Payout Address'}</span>
              </label>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-sans">
                <Lock className="w-3 h-3" />
                <span>{lang === 'ar' ? 'مؤمّنة / غير قابلة للتغيير' : 'Locked & Verified'}</span>
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                id="btc-primary-address-display"
                type="text"
                value={MASTER_PRIMARY_WALLET}
                readOnly
                disabled
                dir="ltr"
                className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded text-xs font-mono text-[#f59e0b] cursor-not-allowed opacity-90 text-left font-bold select-all"
              />
              <button
                type="button"
                id="copy-master-address-btn"
                onClick={handleCopyMaster}
                className="absolute left-auto right-1.5 p-1.5 rounded hover:bg-[#222] text-gray-400 hover:text-[#f59e0b] transition-all cursor-pointer"
                title={lang === 'ar' ? 'نسخ العنوان' : 'Copy address'}
              >
                {copiedMaster ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-[10px] text-gray-400 font-sans flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
              <span>{lang === 'ar' ? 'هذه المحفظة هي العقدة الأساسية الدائمة لاستلام مكافأة الكتلة (3.125 BTC + رسوم الشبكة).' : 'Permanently verified master node payout address for all block rewards.'}</span>
            </p>
          </div>

          {/* Dummy Secondary / Backup Bitcoin Wallet Address */}
          <div className="space-y-1.5 p-3 rounded-lg bg-[#141414]/80 border border-[#262626]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'ar' ? 'محفظة استلام ثانوية / احتياطية (خيار بديل)' : 'Secondary / Backup Wallet (Optional)'}</span>
              </label>
              <span className="text-[10px] text-gray-500 font-sans">
                {lang === 'ar' ? 'خيار توجيه بديل' : 'Fallback Route'}
              </span>
            </div>

            <input
              id="btc-secondary-address-input"
              type="text"
              value={secondaryAddress}
              onChange={(e) => {
                setSecondaryAddress(e.target.value);
                setValidationError(null);
              }}
              dir="ltr"
              placeholder={lang === 'ar' ? 'أدخل عنوان محفظة احتياطية إضافية (اختياري)...' : 'Enter optional secondary BTC wallet...'}
              className="w-full px-3 py-2 bg-black border border-[#2c2c2c] rounded text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 transition-all placeholder:text-gray-600 text-left"
            />
            <p className="text-[10px] text-gray-400 font-sans">
              {lang === 'ar' 
                ? 'يمكن إدخال عنوان محفظة بديلة للنسخ الاحتياطي وتوزيع التوجيه الشبكي عند الحاجة.' 
                : 'Optional secondary backup destination address for network routing.'}
            </p>
          </div>

          {/* Worker Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              {t.workerName}
            </label>
            <input
              id="worker-name-input"
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              dir="ltr"
              placeholder="NerdMiner_01"
              className="w-full px-3 py-2 bg-black border border-[#262626] rounded text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-400 transition-all text-left"
            />
          </div>

          {/* Worker Threads Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Cpu className="w-4 h-4 text-[#10b981]" />
                <span>{lang === 'ar' ? 'عدد أنوية المعالج المستخدمة' : 'Active Worker Threads'}</span>
              </span>
              <span className="font-mono text-[#10b981] font-bold" dir="ltr">{threads} / {maxThreads} Cores</span>
            </div>
            <input
              id="threads-range-input"
              type="range"
              min="1"
              max={maxThreads}
              value={threads}
              onChange={(e) => setThreads(Number(e.target.value))}
              className="w-full accent-[#10b981] bg-[#222] h-2 rounded cursor-pointer"
            />
          </div>

          {/* Pool Presets */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
              <Server className="w-4 h-4 text-purple-400" />
              <span>{lang === 'ar' ? 'خوادم مجمعات التعدين الجاهزة' : 'Solo Mining Pool Presets'}</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {POOL_PRESETS.map((preset) => {
                const isSelected = poolUrl === preset.url;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded text-right transition-all border cursor-pointer ${
                      isSelected 
                        ? 'bg-[#1a1a1a] border-[#f59e0b] text-white shadow-sm' 
                        : 'bg-black/50 border-[#222] text-gray-400 hover:border-[#333] hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white font-sans">{preset.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#f59e0b]" />}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-sans">
                      {lang === 'ar' ? preset.descriptionAr : preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Pool Inputs */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] text-gray-400 uppercase font-sans">{t.poolServer}</label>
              <input
                id="pool-url-input"
                type="text"
                value={poolUrl}
                onChange={(e) => setPoolUrl(e.target.value)}
                dir="ltr"
                placeholder="wss://publicpool.io:21496"
                className="w-full px-2.5 py-1.5 bg-black border border-[#262626] rounded text-xs font-mono text-white focus:outline-none focus:border-white text-left"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase font-sans">{t.poolPort}</label>
              <input
                id="pool-port-input"
                type="number"
                value={poolPort}
                onChange={(e) => setPoolPort(Number(e.target.value))}
                dir="ltr"
                placeholder="21496"
                className="w-full px-2.5 py-1.5 bg-black border border-[#262626] rounded text-xs font-mono text-white focus:outline-none focus:border-white text-left"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#222] bg-[#141414]">
          <div>
            {onSimulateBlock && (
              <button
                type="button"
                onClick={onSimulateBlock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#222] hover:bg-[#333] text-gray-400 hover:text-amber-400 text-[10px] font-bold transition-all cursor-pointer font-sans"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'تجربة إشعار الفوز (للمطورين)' : 'Test Win Alert (Dev)'}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              id="cancel-settings-btn"
              onClick={onClose}
              className="px-4 py-2 rounded bg-transparent hover:bg-[#222] text-gray-400 hover:text-white text-xs font-bold transition-all cursor-pointer font-sans"
            >
              {t.cancel}
            </button>
            <button
              id="save-settings-btn"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded bg-[#f59e0b] hover:bg-[#fbbf24] text-black text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer font-sans"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveSettings}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
