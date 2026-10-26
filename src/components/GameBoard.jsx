import React from 'react';
import { Timer, Sparkles, HelpCircle, Flame } from 'lucide-react';

export function GameBoard({
  currentWord,
  revealedIndices,
  timeLeft,
  maxTime,
  round,
  totalRounds,
  lastWinner,
  isPaused
}) {
  if (!currentWord) return null;

  const targetChars = currentWord.word.split('');
  const timePercent = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));

  // Warna progress bar waktu berdasarkan sisa detik
  let timerColor = 'from-emerald-500 to-green-400';
  if (timeLeft <= 10) {
    timerColor = 'from-red-600 to-rose-500 animate-pulse';
  } else if (timeLeft <= 25) {
    timerColor = 'from-amber-500 to-yellow-400';
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Banner: Ronde & Kategori */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 rounded-full px-4 py-1.5 shadow-md">
          <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="text-xs uppercase tracking-wider font-bold text-slate-300 font-sans">
            Ronde {round} {totalRounds ? `/ ${totalRounds}` : ''}
          </span>
        </div>

        <div className="bg-gradient-to-r from-purple-600/80 to-indigo-600/80 border border-purple-400/30 rounded-full px-4 py-1.5 shadow-md">
          <span className="text-xs font-bold text-white tracking-wide font-sans">
            {currentWord.category}
          </span>
        </div>
      </div>

      {/* Kotak Petunjuk / Clue */}
      <div className="w-full relative overflow-hidden bg-slate-900/95 border-2 border-indigo-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-md mb-4 text-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        
        <div className="flex items-center justify-center gap-1.5 mb-1 text-indigo-300 text-xs font-bold uppercase tracking-widest font-sans">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Petunjuk Soal</span>
        </div>
        
        <p className="text-base sm:text-lg font-bold text-slate-100 font-game leading-relaxed px-2">
          "{currentWord.clue}"
        </p>
      </div>

      {/* Kotak Huruf Tebak Kata */}
      <div className="w-full py-4 flex flex-wrap justify-center items-center gap-2 sm:gap-2.5 my-2">
        {targetChars.map((char, index) => {
          if (char === ' ') {
            return (
              <div key={index} className="w-4 sm:w-6 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
              </div>
            );
          }

          const isRevealed = revealedIndices.has(index);

          return (
            <div
              key={index}
              className={`relative flex items-center justify-center rounded-xl font-game font-extrabold text-2xl sm:text-3xl transition-all duration-300 select-none shadow-lg
                ${isRevealed
                  ? 'w-11 h-14 sm:w-13 sm:h-16 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 border-2 border-amber-200 scale-105 shadow-amber-500/40'
                  : 'w-10 h-13 sm:w-12 sm:h-15 bg-slate-800/90 text-indigo-300 border-2 border-slate-700/80 hover:border-slate-500'
                }`}
            >
              {isRevealed ? (
                <span className="drop-shadow-sm animate-pop">{char}</span>
              ) : (
                <span className="text-slate-600 text-xl font-bold font-sans">?</span>
              )}
              {isRevealed && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Huruf Terbuka Info */}
      <div className="text-xs text-slate-400 font-sans mb-3 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Ketik tebakanmu di kolom komentar!</span>
      </div>

      {/* Timer Bar */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 shadow-inner">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5 px-1 font-sans">
          <div className="flex items-center gap-1 text-slate-300">
            <Timer className={`w-3.5 h-3.5 ${timeLeft <= 10 ? 'text-red-400 animate-spin' : 'text-slate-400'}`} />
            <span>Sisa Waktu</span>
          </div>
          <span className={`text-sm font-game font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${timerColor} transition-all duration-1000 ease-linear shadow-sm`}
            style={{ width: `${timePercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
