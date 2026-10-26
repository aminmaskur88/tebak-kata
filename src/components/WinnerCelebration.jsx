import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Check } from 'lucide-react';

export function WinnerCelebration({ winner, targetWord, onDismiss }) {
  useEffect(() => {
    if (!winner) return;

    // Trigger confetti explosion
    const end = Date.now() + 3.5 * 1000;
    const colors = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#3b82f6'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [winner]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/90 border-2 border-amber-400 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(251,191,36,0.4)]">
        {/* Glow halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-amber-400/30 rounded-full blur-2xl"></div>

        {/* Trophy Icon */}
        <div className="relative mx-auto w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-2xl flex items-center justify-center shadow-lg -mt-10 mb-4 border-2 border-white/50">
          <Trophy className="w-8 h-8 text-slate-950 fill-current animate-bounce" />
        </div>

        <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 font-sans">
          🎉 Pemenang Ronde!
        </span>

        {/* Winner User Profile */}
        <div className="my-3 flex flex-col items-center">
          <img
            src={
              winner.profilePic ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(winner.userName)}`
            }
            alt={winner.userName}
            className="w-16 h-16 rounded-full border-4 border-amber-400 shadow-xl object-cover"
            onError={(e) => {
              e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(winner.userName)}`;
            }}
          />
          <h2 className="text-xl font-game font-extrabold text-white mt-2 drop-shadow">
            {winner.userName}
          </h2>
          <span className="text-xs text-amber-400 font-bold font-sans">
            +100 Points
          </span>
        </div>

        {/* Revealed Word */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 my-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 font-sans">
            Jawaban Yang Benar
          </p>
          <p className="text-2xl font-game font-extrabold text-amber-300 tracking-wider">
            {targetWord}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onDismiss}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-game font-bold text-base rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>Lanjut Soal Berikutnya</span>
        </button>
      </div>
    </div>
  );
}
