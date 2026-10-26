import React, { useEffect, useRef } from 'react';
import { MessageSquare, Flame, CheckCircle2, Gift } from 'lucide-react';

export function LiveChatFeed({ comments = [] }) {
  const scrollRef = useRef(null);

  // Auto-scroll ke komentar terbaru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  return (
    <div className="w-full flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Header Feed Komentar */}
      <div className="px-3.5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
            Live Chat Feed
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[10px] text-emerald-400 font-bold font-sans">LIVE</span>
        </div>
      </div>

      {/* Daftar Komentar */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 scroll-smooth max-h-[340px]"
      >
        {comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8 text-center px-4 font-sans">
            <MessageSquare className="w-8 h-8 text-slate-700 mb-2" />
            <p className="font-semibold text-slate-400">Menunggu komentar penonton...</p>
            <p className="text-[11px] text-slate-600 mt-1">Komentar TikTok, Facebook, dan Gift akan tampil di sini secara realtime.</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isGift = comment.isGift;
            const isNear = comment.isNear;
            const isExact = comment.isExact;

            return (
              <div
                key={comment.id}
                className={`relative rounded-xl p-2.5 transition-all duration-300 animate-pop border ${
                  isGift
                    ? 'bg-gradient-to-r from-rose-950/95 via-purple-950/90 to-pink-950/85 border-2 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                    : isExact
                    ? 'bg-gradient-to-r from-amber-950/90 to-amber-900/80 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                    : isNear
                    ? 'bg-emerald-950/85 border-2 border-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.6)] animate-green-glow'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800/80'
                }`}
              >
                {/* Header Komentar: Avatar & Nama */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        comment.profilePic ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(comment.userName)}`
                      }
                      alt={comment.userName}
                      referrerPolicy="no-referrer"
                      className={`w-6 h-6 rounded-full object-cover border ${
                        isGift
                          ? 'border-rose-400 ring-2 ring-rose-400/60'
                          : isExact
                          ? 'border-amber-400 ring-2 ring-amber-400/50'
                          : isNear
                          ? 'border-emerald-400 ring-2 ring-emerald-400/50'
                          : 'border-slate-600'
                      }`}
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(comment.userName)}`;
                      }}
                    />
                    <span
                      className={`text-xs font-bold font-sans truncate max-w-[120px] ${
                        isGift
                          ? 'text-rose-300'
                          : isExact
                          ? 'text-amber-300'
                          : isNear
                          ? 'text-emerald-300'
                          : 'text-slate-300'
                      }`}
                    >
                      {comment.userName}
                    </span>
                  </div>

                  {/* Badge Status Komentar */}
                  {isGift && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white shadow animate-pulse">
                      <Gift className="w-3 h-3 text-white" />
                      GIFT SPONSOR!
                    </span>
                  )}

                  {!isGift && isExact && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow">
                      <CheckCircle2 className="w-3 h-3" />
                      BENAR!
                    </span>
                  )}

                  {!isGift && isNear && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow animate-pulse">
                      <Flame className="w-3 h-3 text-amber-200" />
                      HAMPIR BENAR!
                    </span>
                  )}
                </div>

                {/* Isi Pesan Komentar / Gift */}
                <p
                  className={`text-sm break-words leading-relaxed pl-8 font-sans ${
                    isGift
                      ? 'text-rose-100 font-bold text-base'
                      : isExact
                      ? 'text-amber-100 font-bold text-base'
                      : isNear
                      ? 'text-emerald-200 font-bold text-base drop-shadow-[0_1px_6px_rgba(16,185,129,0.8)]'
                      : 'text-slate-200'
                  }`}
                >
                  {isGift 
                    ? `Mengirim ${comment.giftName}! Jawaban Dibuka: ${comment.revealedAnswer || ''} 🔓`
                    : comment.message}
                </p>

                {/* Sub-label informasi jika mendekati */}
                {isNear && comment.reason && (
                  <div className="mt-1 pl-8 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Petunjuk: {comment.reason}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
