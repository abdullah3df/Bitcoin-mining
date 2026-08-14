import React, { useRef, useEffect } from 'react';
import { StratumLog, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { Terminal, Trash2, ArrowUpRight, ArrowDownLeft, Shield, AlertTriangle, X } from 'lucide-react';

interface StratumLogsDrawerProps {
  logs: StratumLog[];
  onClearLogs: () => void;
  onClose: () => void;
  isOpen: boolean;
  lang: Language;
}

export const StratumLogsDrawer: React.FC<StratumLogsDrawerProps> = ({
  logs,
  onClearLogs,
  onClose,
  isOpen,
  lang
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
  const isRtl = lang === 'ar';
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  if (!isOpen) return null;

  const getLogBadge = (direction: StratumLog['direction']) => {
    switch (direction) {
      case 'SEND':
        return (
          <span className="px-1.5 py-0.5 rounded bg-[#161616] text-cyan-400 border border-cyan-500/30 text-[9px] font-bold inline-flex items-center gap-0.5 font-mono" dir="ltr">
            <ArrowUpRight className="w-2.5 h-2.5" />
            <span>SEND</span>
          </span>
        );
      case 'RECV':
        return (
          <span className="px-1.5 py-0.5 rounded bg-[#161616] text-purple-400 border border-purple-500/30 text-[9px] font-bold inline-flex items-center gap-0.5 font-mono" dir="ltr">
            <ArrowDownLeft className="w-2.5 h-2.5" />
            <span>RECV</span>
          </span>
        );
      case 'SHARE':
        return (
          <span className="px-1.5 py-0.5 rounded bg-[#161616] text-[#10b981] border border-[#10b981]/30 text-[9px] font-bold inline-flex items-center gap-0.5 font-mono" dir="ltr">
            <Shield className="w-2.5 h-2.5" />
            <span>SHARE</span>
          </span>
        );
      case 'BLOCK':
        return (
          <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 text-[9px] font-bold inline-flex items-center gap-0.5 font-mono" dir="ltr">
            ★ BLOCK
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded bg-[#161616] text-gray-400 text-[9px] font-bold font-mono" dir="ltr">
            SYS
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-[720px] mx-auto mt-4 bg-[#0a0d14]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs text-slate-300 animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#101420] border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="font-bold text-xs text-white uppercase tracking-wider font-cairo">{t.stratumLogsTitle}</span>
          <span className="text-[10px] text-slate-400 font-tajawal bg-white/5 px-2 py-0.5 rounded-full">({logs.length} {t.eventsCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            id="clear-logs-btn"
            onClick={onClearLogs}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
            title={t.clearLogs}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            id="close-logs-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title={t.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log list */}
      <div className="p-3.5 max-h-52 overflow-y-auto space-y-2 text-[11px] leading-relaxed custom-scrollbar" dir="ltr">
        {logs.length === 0 ? (
          <div className="text-slate-500 text-center py-6 italic font-tajawal">
            {t.waitingLogs}
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 border-b border-white/5 pb-1.5 hover:bg-white/[0.02] px-1 rounded transition-colors">
              <span className="text-slate-500 text-[10px] shrink-0 font-mono mt-0.5">{log.timestamp}</span>
              <div className="shrink-0">{getLogBadge(log.direction)}</div>
              <span className={`break-all ${
                log.direction === 'SHARE' ? 'text-emerald-400 font-semibold' :
                log.direction === 'BLOCK' ? 'text-amber-400 font-bold' :
                log.direction === 'SEND' ? 'text-cyan-300' :
                log.direction === 'RECV' ? 'text-slate-300' :
                'text-slate-400'
              }`}>
                {log.text}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
