import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Gift, Sparkles, Check, Heart } from 'lucide-react';

export function WinnerCelebration({ winner, targetWord, onDismiss }) {
  useEffect(() => {
    if (!winner) return;

    // Trigger confetti explosion
    const end = Date.now() + 3.8 * 1000;
    const colors = winner.isGift 
      ? ['#ec4899', '#f43f5e', '#a855f7', '#fbbf24', '#ffffff']
      : ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#3b82f6'];

    (function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [winner]);

  if (!winner) return null;

  const isGift = winner.isGift;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-pop">
      <div className={`relative w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border-2 ${
        isGift
          ? 'bg-gradient-to-b from-slate-900 via-rose-950/60 to-purple-950/80 border-rose-400 shadow-[0_0_60px_rgba(244,63,94,0.5)]'
          : 'bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/90 border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.4)]'
      }`}>
        {/* Glow halo */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full blur-2xl ${
          isGift ? 'bg-rose-500/40' : 'bg-amber-400/30'
        }`}></div>

        {/* Icon Header */}
        <div className={`relative mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg -mt-10 mb-4 border-2 border-white/50 ${
          isGift
            ? 'bg-gradient-to-tr from-rose-500 to-pink-400'
            : 'bg-gradient-to-tr from-amber-500 to-yellow-300'
        }`}>
          {isGift ? (
            <Gift className="w-8 h-8 text-white fill-current animate-bounce" />
          ) : (
            <Trophy className="w-8 h-8 text-slate-950 fill-current animate-bounce" />
          )}
        </div>

        {/* Badge Banner */}
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 font-sans border shadow ${
          isGift
            ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
            : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
        }`}>
          {isGift ? '🎁 JAWABAN DIBUKA DARI GIFT!' : '🎉 Pemenang Ronde!'}
        </span>

        {/* Winner / Gift Sponsor Profile */}
        <div className="my-3 flex flex-col items-center">
          <img
            src={
              winner.profilePic ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(winner.userName)}`
            }
            alt={winner.userName}
            referrerPolicy="no-referrer"
            className={`w-16 h-16 rounded-full border-4 shadow-xl object-cover ${
              isGift ? 'border-rose-400' : 'border-amber-400'
            }`}
            onError={(e) => {
              e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(winner.userName)}`;
            }}
          />
          <h2 className="text-xl font-game font-extrabold text-white mt-2 drop-shadow">
            {winner.userName}
          </h2>
          {isGift ? (
            <span className="text-xs text-rose-300 font-bold font-sans flex items-center gap-1 mt-0.5">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
              <span>Mengirim {winner.giftName || 'Gift'} (+150 PTS)</span>
            </span>
          ) : (
            <span className="text-xs text-amber-400 font-bold font-sans">
              +100 Points
            </span>
          )}
        </div>

        {/* Revealed Word Display */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 my-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 font-sans">
            {isGift ? 'Bocoran Jawaban Terbuka' : 'Jawaban Yang Benar'}
          </p>
          <p className={`text-2xl font-game font-extrabold tracking-wider animate-pop ${
            isGift ? 'text-rose-300' : 'text-amber-300'
          }`}>
            {targetWord}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onDismiss}
          className={`w-full py-3 font-game font-bold text-base rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
            isGift
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white'
              : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>Lanjut Soal Berikutnya</span>
        </button>
      </div>
    </div>
  );
}
