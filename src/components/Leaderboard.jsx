import React from 'react';
import { Trophy, Award } from 'lucide-react';

export function Leaderboard({ scores = [] }) {
  // Urutkan skor dari yang tertinggi
  const sorted = [...scores].sort((a, b) => b.points - a.points).slice(0, 5);

  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return <span className="text-base">🥇</span>;
      case 1:
        return <span className="text-base">🥈</span>;
      case 2:
        return <span className="text-base">🥉</span>;
      default:
        return <span className="text-xs font-bold text-slate-400 font-game">#{index + 1}</span>;
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Header Leaderboard */}
      <div className="px-3.5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
            Top Leaderboard
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 font-sans">
          Top 5 Penonton
        </span>
      </div>

      {/* List Juara */}
      <div className="p-2.5 space-y-1.5">
        {sorted.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs font-sans">
            <Award className="w-6 h-6 mx-auto mb-1 text-slate-700" />
            <span>Belum ada yang berhasil menebak. Jadilah yang pertama!</span>
          </div>
        ) : (
          sorted.map((item, index) => {
            const isFirst = index === 0;

            return (
              <div
                key={item.userName}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                  isFirst
                    ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 shadow-sm'
                    : 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 text-center flex items-center justify-center">
                    {getRankBadge(index)}
                  </div>
                  <img
                    src={
                      item.profilePic ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(item.userName)}`
                    }
                    alt={item.userName}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full border border-slate-700 object-cover"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(item.userName)}`;
                    }}
                  />
                  <div className="truncate">
                    <p className={`text-xs font-bold font-sans truncate ${isFirst ? 'text-amber-300' : 'text-slate-200'}`}>
                      {item.userName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-sans">
                      {item.wins}x Menang
                    </p>
                  </div>
                </div>

                <div className="text-right pl-2">
                  <span className="text-sm font-game font-extrabold text-amber-400">
                    {item.points}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 ml-0.5">PTS</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
