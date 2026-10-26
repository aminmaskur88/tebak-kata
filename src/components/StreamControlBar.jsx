import React from 'react';
import { 
  SkipForward, 
  Lightbulb, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Settings, 
  Smartphone, 
  Monitor, 
  Radio 
} from 'lucide-react';

export function StreamControlBar({
  onNextWord,
  onRevealHint,
  onResetTimer,
  isVoiceMuted,
  onToggleVoice,
  layoutMode,
  onToggleLayout,
  onOpenSettings,
  streamStatus = {},
  fbStatus = {}
}) {
  const isLive = streamStatus.isLive || fbStatus.status === 'connected' || fbStatus.status === 'active';
  const label = streamStatus.label || (isLive ? 'Live Aktif' : 'Offline');
  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-xl backdrop-blur-md">
      {/* Tombol Aksi Permainan */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onRevealHint}
          title="Buka 1 Huruf Petunjuk"
          className="flex items-center gap-1 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold font-sans transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Buka Huruf</span>
        </button>

        <button
          onClick={onNextWord}
          title="Ganti ke Kata Berikutnya"
          className="flex items-center gap-1 px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-bold font-sans transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <SkipForward className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Lewati</span>
        </button>

        <button
          onClick={onResetTimer}
          title="Reset Timer"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Status Live Stream (TikTok / FB) */}
      <div 
        onClick={onOpenSettings}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all"
        title="Klik untuk konfigurasi Live Stream (TikTok & Facebook)"
      >
        <Radio className={`w-3.5 h-3.5 ${
          isLive 
            ? 'text-emerald-400 animate-pulse' 
            : 'text-slate-500'
        }`} />
        <span className="text-[11px] font-bold font-sans hidden sm:inline text-slate-300">
          {label}
        </span>
      </div>

      {/* Kontrol Audio, Layout & Pengaturan */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleVoice}
          title={isVoiceMuted ? 'Nyalakan Voice Over TTS' : 'Matikan Voice Over TTS'}
          className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
            isVoiceMuted
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-400'
              : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
          }`}
        >
          {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onToggleLayout}
          title={layoutMode === 'portrait' ? 'Ganti ke Mode Landscape (16:9)' : 'Ganti ke Mode Portrait (9:16 HP)'}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all active:scale-95 cursor-pointer"
        >
          {layoutMode === 'portrait' ? (
            <Smartphone className="w-4 h-4 text-purple-400" />
          ) : (
            <Monitor className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          title="Pengaturan"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all active:scale-95 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
