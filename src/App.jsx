import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WORD_DATABASE } from './data/words';
import { checkWordMatch } from './utils/similarity';
import { soundEffects } from './services/soundEffects';
import { speechService } from './services/speechService';
import { FacebookLivePoller } from './services/facebookLive';
import { TikTokLiveClient } from './services/tiktokLive';

import { GameBoard } from './components/GameBoard';
import { LiveChatFeed } from './components/LiveChatFeed';
import { Leaderboard } from './components/Leaderboard';
import { WinnerCelebration } from './components/WinnerCelebration';
import { StreamControlBar } from './components/StreamControlBar';
import { SettingsModal } from './components/SettingsModal';

const MAX_TIME = 60;

export default function App() {
  // Game State
  const [wordList, setWordList] = useState(WORD_DATABASE);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [round, setRound] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [winner, setWinner] = useState(null);

  // Chat & Leaderboard State
  const [comments, setComments] = useState([]);
  const [scores, setScores] = useState([]);

  // UI & Audio Settings
  const [layoutMode, setLayoutMode] = useState('portrait'); // 'portrait' (9:16) | 'landscape' (16:9)
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [voiceRate, setVoiceRate] = useState(1.15);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // TikTok Live Connection State
  const [tiktokUsername, setTiktokUsername] = useState(() => {
    try {
      return localStorage.getItem('tiktok_username') || '';
    } catch {
      return '';
    }
  });
  const [tiktokStatus, setTiktokStatus] = useState({
    status: 'idle',
    message: 'Bridge offline (Jalankan npm run tiktok)'
  });
  const tiktokClientRef = useRef(null);

  // Facebook Live Polling State
  const [fbConfig, setFbConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_live_config');
      return saved ? JSON.parse(saved) : { liveVideoId: '', accessToken: '' };
    } catch {
      return { liveVideoId: '', accessToken: '' };
    }
  });
  const [fbStatus, setFbStatus] = useState({ status: 'idle', message: 'Belum terhubung' });
  const fbPollerRef = useRef(null);

  const currentWord = wordList[currentWordIndex] || wordList[0];

  // Helper untuk membuka 1 huruf acak sebagai bantuan
  const revealOneLetter = useCallback(() => {
    if (!currentWord) return;
    const word = currentWord.word;
    const unrevealed = [];

    for (let i = 0; i < word.length; i++) {
      if (word[i] !== ' ' && !revealedIndices.has(i)) {
        unrevealed.push(i);
      }
    }

    if (unrevealed.length > 0) {
      const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setRevealedIndices(prev => new Set([...prev, randomIndex]));
    }
  }, [currentWord, revealedIndices]);

  // Pindah ke kata berikutnya
  const nextWord = useCallback(() => {
    setWinner(null);
    setIsPaused(false);
    setTimeLeft(MAX_TIME);
    setRevealedIndices(new Set());
    setRound(prev => prev + 1);

    setCurrentWordIndex(prev => {
      const nextIdx = (prev + 1) % wordList.length;
      return nextIdx;
    });
  }, [wordList.length]);

  // Reset timer kata aktif
  const resetTimer = () => {
    setTimeLeft(MAX_TIME);
  };

  // Handler komentar masuk (dari TikTok Live, Facebook Live, atau Simulator)
  const handleIncomingComment = useCallback((commentData) => {
    if (!currentWord || isPaused) return;

    // Evaluasi kemiripan kata dengan target jawaban
    const match = checkWordMatch(commentData.message, currentWord.word);

    const newComment = {
      id: commentData.id || `${Date.now()}-${Math.random()}`,
      userName: commentData.userName || 'Penonton',
      message: commentData.message,
      profilePic: commentData.profilePic,
      isExact: match.isExact,
      isNear: match.isNear, // DITULIS HIJAU!
      reason: match.reason,
      source: commentData.source || 'sim',
      timestamp: Date.now()
    };

    // Tambah komentar ke live feed (simpan maks 40 pesan)
    setComments(prev => [...prev.slice(-39), newComment]);

    // Eksekusi jika BENAR (100% Juara)
    if (match.isExact) {
      soundEffects.playCorrectSound();
      soundEffects.playFanfare();

      speechService.speakComment({
        userName: newComment.userName,
        text: currentWord.word,
        isExact: true
      });

      // Buka semua huruf
      const allIndices = new Set();
      for (let i = 0; i < currentWord.word.length; i++) {
        allIndices.add(i);
      }
      setRevealedIndices(allIndices);

      // Tambah skor pemain
      setScores(prev => {
        const existing = prev.find(p => p.userName.toLowerCase() === newComment.userName.toLowerCase());
        if (existing) {
          return prev.map(p =>
            p.userName.toLowerCase() === newComment.userName.toLowerCase()
              ? { ...p, points: p.points + 100, wins: p.wins + 1, profilePic: newComment.profilePic || p.profilePic }
              : p
          );
        } else {
          return [
            ...prev,
            {
              userName: newComment.userName,
              points: 100,
              wins: 1,
              profilePic: newComment.profilePic
            }
          ];
        }
      });

      // Tampilkan selebrasi pemenang
      setWinner({
        userName: newComment.userName,
        profilePic: newComment.profilePic,
        word: currentWord.word
      });
      setIsPaused(true);

      // Otomatis lanjut ke kata berikutnya setelah 5.5 detik selebrasi
      setTimeout(() => {
        nextWord();
      }, 5500);

      return;
    }

    // Eksekusi jika MENDEKATI (HAMPIR BENAR - DITULIS HIJAU)
    if (match.isNear) {
      soundEffects.playNearSound();
      speechService.speakComment({
        userName: newComment.userName,
        text: newComment.message,
        isNear: true
      });
      return;
    }

    // Komentar biasa
    speechService.speakComment({
      userName: newComment.userName,
      text: newComment.message,
      isNear: false
    });

  }, [currentWord, isPaused, nextWord]);

  // Handler Kiriman Hadiah / Gift TikTok (LANGSUNG BUKA JAWABAN!)
  const handleIncomingGift = useCallback((giftData) => {
    if (!currentWord) return;

    // 1. Suara & Fanfare Spesial Hadiah
    soundEffects.playCorrectSound();
    soundEffects.playFanfare();

    // 2. Buka SELURUH huruf pada kata target tebak kata
    const allIndices = new Set();
    for (let i = 0; i < currentWord.word.length; i++) {
      allIndices.add(i);
    }
    setRevealedIndices(allIndices);

    // 3. Voice Over Mbak Google mengumumkan jawaban yang terbuka
    speechService.clearQueue();
    speechService.speakComment({
      userName: giftData.userName,
      text: `Terima kasih banyak atas kiriman ${giftData.giftName || 'hadiah'}! Jawaban tebak kata ini adalah ${currentWord.word}!`,
      isExact: true
    });

    // 4. Catat ke feed live chat dengan kartu hadiah berkilau
    const giftComment = {
      id: `gift-${Date.now()}-${Math.random()}`,
      userName: giftData.userName,
      profilePic: giftData.profilePic,
      isGift: true,
      giftName: giftData.giftName || 'Gift',
      count: giftData.count || 1,
      revealedAnswer: currentWord.word,
      timestamp: Date.now()
    };
    setComments(prev => [...prev.slice(-39), giftComment]);

    // 5. Tambah bonus poin sultan di leaderboard (+150 PTS)
    setScores(prev => {
      const existing = prev.find(p => p.userName.toLowerCase() === giftData.userName.toLowerCase());
      if (existing) {
        return prev.map(p =>
          p.userName.toLowerCase() === giftData.userName.toLowerCase()
            ? { ...p, points: p.points + 150, wins: p.wins + 1, profilePic: giftData.profilePic || p.profilePic }
            : p
        );
      } else {
        return [
          ...prev,
          {
            userName: giftData.userName,
            points: 150,
            wins: 1,
            profilePic: giftData.profilePic || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(giftData.userName)}`
          }
        ];
      }
    });

    // 6. Tampilkan banner selebrasi hadiah & bocoran jawaban
    setWinner({
      userName: giftData.userName,
      profilePic: giftData.profilePic,
      giftName: giftData.giftName || 'Gift',
      isGift: true,
      word: currentWord.word
    });
    setIsPaused(true);

    // 7. Otomatis lanjut ke kata berikutnya setelah 6 detik selebrasi
    setTimeout(() => {
      nextWord();
    }, 6000);

  }, [currentWord, nextWord]);

  // Setup TikTok Live WebSocket Client
  useEffect(() => {
    tiktokClientRef.current = new TikTokLiveClient({
      wsUrl: 'ws://localhost:8081',
      onCommentReceived: (comment) => {
        handleIncomingComment(comment);
      },
      onGiftReceived: (gift) => {
        handleIncomingGift(gift);
      },
      onStatusChange: (status) => {
        setTiktokStatus(status);
      }
    });

    tiktokClientRef.current.connectToBridge();

    return () => {
      if (tiktokClientRef.current) {
        tiktokClientRef.current.destroy();
      }
    };
  }, [handleIncomingComment, handleIncomingGift]);

  // Setup Poller Facebook Live
  useEffect(() => {
    fbPollerRef.current = new FacebookLivePoller({
      liveVideoId: fbConfig.liveVideoId,
      accessToken: fbConfig.accessToken,
      onCommentReceived: (comment) => {
        handleIncomingComment(comment);
      },
      onStatusChange: (status) => {
        setFbStatus(status);
      }
    });

    return () => {
      if (fbPollerRef.current) {
        fbPollerRef.current.stop();
      }
    };
  }, [handleIncomingComment]);

  // Timer Countdown Loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Waktu habis!
          soundEffects.playTimeUpSound();
          speechService.speakComment({
            userName: 'Sistem',
            text: `Waktu habis! Jawaban yang benar adalah ${currentWord.word}`,
            isNear: false
          });

          // Buka jawaban
          const allIndices = new Set();
          for (let i = 0; i < currentWord.word.length; i++) {
            allIndices.add(i);
          }
          setRevealedIndices(allIndices);
          setIsPaused(true);

          setTimeout(() => {
            nextWord();
          }, 4000);

          return 0;
        }

        // Suara detak jam di 5 detik terakhir
        if (prev <= 5) {
          soundEffects.playTickSound();
        }

        // Buka otomatis 1 huruf jika tersisa 25 detik
        if (prev === 25) {
          revealOneLetter();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, currentWord, nextWord, revealOneLetter]);

  // Handler TikTok Config
  const handleSaveTiktokUsername = (user) => {
    setTiktokUsername(user);
    try {
      localStorage.setItem('tiktok_username', user);
    } catch {
      // ignore
    }
  };

  const handleConnectTiktok = (user) => {
    handleSaveTiktokUsername(user);
    if (tiktokClientRef.current) {
      tiktokClientRef.current.sendConnect(user);
    }
  };

  const handleDisconnectTiktok = () => {
    if (tiktokClientRef.current) {
      tiktokClientRef.current.sendDisconnect();
    }
  };

  // Handler Konfigurasi Facebook
  const handleSaveFbConfig = (config) => {
    setFbConfig(config);
    try {
      localStorage.setItem('fb_live_config', JSON.stringify(config));
    } catch {
      // ignore
    }
    if (fbPollerRef.current) {
      fbPollerRef.current.updateConfig(config);
    }
  };

  const handleStartFb = () => {
    if (fbPollerRef.current) {
      fbPollerRef.current.updateConfig(fbConfig);
      fbPollerRef.current.start();
    }
  };

  const handleStopFb = () => {
    if (fbPollerRef.current) {
      fbPollerRef.current.stop();
    }
  };

  const handleToggleVoice = () => {
    const nextState = !isVoiceMuted;
    setIsVoiceMuted(nextState);
    speechService.enabled = !nextState;
  };

  const handleChangeVoiceRate = (rate) => {
    setVoiceRate(rate);
    speechService.rate = rate;
  };

  // Menentukan status koneksi stream aktif
  const activeStreamStatus = {
    isLive: tiktokStatus.status === 'connected' || fbStatus.status === 'active' || fbStatus.status === 'connected',
    label: tiktokStatus.status === 'connected'
      ? `TikTok @${tiktokUsername}`
      : fbStatus.status === 'active' || fbStatus.status === 'connected'
      ? 'FB Live'
      : 'Offline'
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4 selection:bg-indigo-500 selection:text-white">
      {/* Container Layar Game (Mendukung 9:16 Portrait TikTok atau 16:9 Landscape) */}
      <div
        className={`w-full transition-all duration-300 flex flex-col justify-between ${
          layoutMode === 'portrait'
            ? 'max-w-[480px] min-h-[92vh] sm:rounded-3xl sm:border-2 border-indigo-500/30 sm:shadow-[0_0_40px_rgba(99,102,241,0.25)] p-3 sm:p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/60'
            : 'max-w-6xl min-h-[88vh] rounded-3xl border-2 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.25)] p-5 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/60'
        }`}
      >
        {/* Header Branding Stream */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <div>
              <h1 className="text-sm sm:text-base font-game font-extrabold text-white tracking-wide uppercase leading-none">
                Tebak Kata Live
              </h1>
              <p className="text-[10px] text-indigo-400 font-sans font-semibold">
                Ketik jawabanmu di kolom komentar!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[10px] font-bold text-indigo-300 font-sans uppercase">
              {layoutMode === 'portrait' ? '📱 9:16 Mobile' : '🖥️ 16:9 PC'}
            </span>
          </div>
        </div>

        {/* Layout Mode Responsive */}
        {layoutMode === 'portrait' ? (
          // ============ MODE PORTRAIT (9:16 TikTok / FB Live Reels) ============
          <div className="flex-1 flex flex-col gap-3 my-1">
            {/* Papan Tebak Kata */}
            <GameBoard
              currentWord={currentWord}
              revealedIndices={revealedIndices}
              timeLeft={timeLeft}
              maxTime={MAX_TIME}
              round={round}
              totalRounds={wordList.length}
              isPaused={isPaused}
            />

            {/* Live Chat Feed dengan Efek Hijau Mendekati */}
            <div className="flex-1 min-h-[220px]">
              <LiveChatFeed comments={comments} />
            </div>

            {/* Leaderboard Mini */}
            <div className="w-full">
              <Leaderboard scores={scores} />
            </div>
          </div>
        ) : (
          // ============ MODE LANDSCAPE (16:9 OBS / Monitor) ============
          <div className="flex-1 grid grid-cols-12 gap-4 my-2">
            {/* Kolom Kiri: Papan Game Utama */}
            <div className="col-span-8 flex flex-col justify-between">
              <GameBoard
                currentWord={currentWord}
                revealedIndices={revealedIndices}
                timeLeft={timeLeft}
                maxTime={MAX_TIME}
                round={round}
                totalRounds={wordList.length}
                isPaused={isPaused}
              />
              <div className="mt-4">
                <Leaderboard scores={scores} />
              </div>
            </div>

            {/* Kolom Kanan: Live Chat Feed */}
            <div className="col-span-4 flex flex-col h-full">
              <LiveChatFeed comments={comments} />
            </div>
          </div>
        )}

        {/* Kontrol Bar Streamer di Bagian Bawah */}
        <div className="mt-3">
          <StreamControlBar
            onNextWord={nextWord}
            onRevealHint={revealOneLetter}
            onResetTimer={resetTimer}
            isVoiceMuted={isVoiceMuted}
            onToggleVoice={handleToggleVoice}
            layoutMode={layoutMode}
            onToggleLayout={() => setLayoutMode(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            streamStatus={activeStreamStatus}
          />
        </div>
      </div>

      {/* Selebrasi Pemenang Juara Ronde */}
      <WinnerCelebration
        winner={winner}
        targetWord={currentWord?.word || ''}
        onDismiss={nextWord}
      />

      {/* Modal Pengaturan & Simulator Komentar */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        // TikTok
        tiktokUsername={tiktokUsername}
        onSaveTiktokUsername={handleSaveTiktokUsername}
        tiktokStatus={tiktokStatus}
        onConnectTiktok={handleConnectTiktok}
        onDisconnectTiktok={handleDisconnectTiktok}
        // Facebook
        fbConfig={fbConfig}
        onSaveFbConfig={handleSaveFbConfig}
        fbStatus={fbStatus}
        onStartFb={handleStartFb}
        onStopFb={handleStopFb}
        // Voice
        isVoiceEnabled={!isVoiceMuted}
        onToggleVoice={handleToggleVoice}
        voiceRate={voiceRate}
        onChangeVoiceRate={handleChangeVoiceRate}
        // Simulator
        onSimulateComment={handleIncomingComment}
        onSimulateGift={handleIncomingGift}
        currentWord={currentWord}
      />
    </div>
  );
}
