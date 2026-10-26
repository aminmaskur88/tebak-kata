import React, { useState, useEffect } from 'react';
import { 
  X, 
  Radio, 
  Volume2, 
  Play, 
  Sparkles, 
  Send, 
  HelpCircle, 
  CheckCircle2, 
  Info,
  Sliders,
  Video,
  Terminal
} from 'lucide-react';
import { speechService } from '../services/speechService';

export function SettingsModal({
  isOpen,
  onClose,
  // TikTok Props
  tiktokUsername,
  onSaveTiktokUsername,
  tiktokWsUrl,
  onSaveTiktokWsUrl,
  tiktokApiKey,
  onSaveTiktokApiKey,
  tiktokStatus,
  onConnectTiktok,
  onDisconnectTiktok,
  // Facebook Props
  fbConfig,
  onSaveFbConfig,
  fbStatus,
  onStartFb,
  onStopFb,
  // Voice Props
  isVoiceEnabled,
  onToggleVoice,
  voiceRate,
  onChangeVoiceRate,
  // Simulator Props
  onSimulateComment,
  onSimulateGift,
  currentWord
}) {
  const [activeTab, setActiveTab] = useState('tiktok'); // 'tiktok' | 'facebook' | 'voice' | 'simulator'
  
  // TikTok state
  const [ttUser, setTtUser] = useState(tiktokUsername || '');
  const [bridgeUrl, setBridgeUrl] = useState(tiktokWsUrl || 'ws://localhost:8081');
  const [apiKey, setApiKey] = useState(tiktokApiKey || '');

  // Facebook state
  const [videoId, setVideoId] = useState(fbConfig.liveVideoId || '');
  const [token, setToken] = useState(fbConfig.accessToken || '');

  // Simulator state
  const [simName, setSimName] = useState('Budi Gaming');
  const [simComment, setSimComment] = useState('');

  // Voice state
  const [voiceEngine, setVoiceEngine] = useState(speechService.engine || 'google');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');

  useEffect(() => {
    setTtUser(tiktokUsername || '');
    setBridgeUrl(tiktokWsUrl || 'ws://localhost:8081');
    setApiKey(tiktokApiKey || '');
  }, [tiktokUsername, tiktokWsUrl, tiktokApiKey]);

  useEffect(() => {
    setVideoId(fbConfig.liveVideoId || '');
    setToken(fbConfig.accessToken || '');
  }, [fbConfig]);

  useEffect(() => {
    const voices = speechService.getAvailableVoices();
    setAvailableVoices(voices);
    if (speechService.voice) {
      setSelectedVoiceURI(speechService.voice.voiceURI);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectTiktok = (e) => {
    e.preventDefault();
    if (!ttUser.trim()) return;
    onSaveTiktokUsername(ttUser.trim());
    onConnectTiktok(ttUser.trim());
  };

  const handleSaveFb = (e) => {
    e.preventDefault();
    onSaveFbConfig({ liveVideoId: videoId, accessToken: token });
  };

  const handleEngineChange = (e) => {
    const eng = e.target.value;
    setVoiceEngine(eng);
    speechService.engine = eng;
  };

  const handleVoiceChange = (e) => {
    const uri = e.target.value;
    setSelectedVoiceURI(uri);
    speechService.setVoice(uri);
  };

  const handleTestVoice = () => {
    speechService.clearQueue();
    speechService.speakComment({
      userName: 'Siti',
      text: 'Halo penonton! Ini adalah suara bahasa Indonesia asli untuk live stream tebak kata.',
      isNear: false
    });
  };

  const handleSendSimulated = (e) => {
    e.preventDefault();
    if (!simComment.trim()) return;
    onSimulateComment({
      userName: simName.trim() || 'Penonton',
      message: simComment.trim()
    });
    setSimComment('');
  };

  // Helper untuk membuat komentar mendekati dari kata target
  const handleTestNearWord = () => {
    if (!currentWord) return;
    const target = currentWord.word.toLowerCase();
    let nearWord = target.slice(0, -1);
    if (nearWord.length < 3) nearWord = target + 'h';

    onSimulateComment({
      userName: 'Ahmad_Gamer',
      message: nearWord
    });
  };

  // Helper untuk tes menang langsung
  const handleTestExactWord = () => {
    if (!currentWord) return;
    onSimulateComment({
      userName: 'Rina_Pintar',
      message: currentWord.word
    });
  };

  // Helper untuk tes kirim gift (langsung buka jawaban!)
  const handleTestGift = () => {
    if (!currentWord || !onSimulateGift) return;
    onSimulateGift({
      userName: simName.trim() || 'Sultan_TikTok',
      giftName: 'Mawar Merah 🌹',
      count: 1,
      profilePic: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(simName.trim() || 'Sultan_TikTok')}`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="px-5 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="font-game font-bold text-lg text-white">
              Pengaturan Game Stream
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1 gap-1">
          <button
            onClick={() => setActiveTab('tiktok')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'tiktok'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>TikTok Live</span>
          </button>

          <button
            onClick={() => setActiveTab('facebook')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'facebook'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Facebook</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'voice'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice Over</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulator</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: TIKTOK LIVE */}
          {activeTab === 'tiktok' && (
            <div className="space-y-4">
              <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-200 font-sans leading-relaxed">
                <div className="flex items-center gap-2 font-bold mb-1.5 text-rose-300">
                  <Terminal className="w-4 h-4 text-rose-400" />
                  <span>Cara Menghubungkan TikTok Live:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                  <li>
                    Jalankan konektor TikTok di terminal komputer Anda:
                    <div className="bg-slate-950 px-2 py-1.5 rounded-lg text-rose-300 font-mono text-[11px] my-1 border border-rose-900/40">
                      npm run tiktok
                    </div>
                  </li>
                  <li>Masukkan <strong>Username Akun TikTok</strong> Anda yang sedang Live di bawah.</li>
                  <li>Klik tombol <strong>Hubungkan TikTok Live</strong>. Komentar dan gift akan otomatis masuk!</li>
                </ol>
              </div>

              <form onSubmit={handleConnectTiktok} className="space-y-3">
                {/* Mode Pilihan Koneksi */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 font-sans">
                    Pilih Metode Koneksi TikTok:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = 'wss://api.tik.tools';
                        setBridgeUrl(url);
                        onSaveTiktokWsUrl(url);
                      }}
                      className={`p-2 rounded-xl border text-left text-xs font-bold font-sans transition-all cursor-pointer ${
                        bridgeUrl.includes('tik.tools')
                          ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md ring-1 ring-rose-400'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-[11px] font-extrabold text-rose-300">🌐 100% Full Vercel Cloud</p>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">Via API Publik (tik.tools) tanpa buka laptop</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const url = 'ws://localhost:8081';
                        setBridgeUrl(url);
                        onSaveTiktokWsUrl(url);
                      }}
                      className={`p-2 rounded-xl border text-left text-xs font-bold font-sans transition-all cursor-pointer ${
                        bridgeUrl.includes('localhost') || bridgeUrl.includes('127.0.0.1')
                          ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md ring-1 ring-rose-400'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-[11px] font-extrabold text-rose-300">💻 Jembatan Laptop</p>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">Via JALANKAN_TIKTOK.bat di PC</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 font-sans">
                    Username TikTok (Sedang Live)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm font-bold">@</span>
                    <input
                      type="text"
                      placeholder="contoh: akun_live_kamu"
                      value={ttUser}
                      onChange={(e) => setTtUser(e.target.value.replace(/^@/, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500 font-sans"
                    />
                  </div>
                </div>

                {bridgeUrl.includes('tik.tools') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 font-sans">
                      TikTools API Key (Dapatkan gratis di <a href="https://tik.tools" target="_blank" rel="noreferrer" className="text-rose-400 underline">tik.tools</a>)
                    </label>
                    <input
                      type="text"
                      placeholder="Paste API Key TikTools Anda di sini"
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        onSaveTiktokApiKey(e.target.value);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300 font-sans">
                      Alamat WebSocket Server (Aktif)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Otomatis / Custom</span>
                  </div>
                  <input
                    type="text"
                    value={bridgeUrl}
                    onChange={(e) => {
                      setBridgeUrl(e.target.value);
                      onSaveTiktokWsUrl(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                {/* Status TikTok Bridge */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs font-sans">
                    <span className="text-slate-400">Status: </span>
                    <span className={`font-bold ${
                      tiktokStatus.status === 'connected'
                        ? 'text-emerald-400'
                        : tiktokStatus.status === 'error'
                        ? 'text-rose-400'
                        : tiktokStatus.status === 'bridge_connected'
                        ? 'text-amber-300'
                        : 'text-slate-400'
                    }`}>
                      {tiktokStatus.message || 'Bridge offline (Jalankan npm run tiktok)'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {tiktokStatus.status === 'connected' ? (
                      <button
                        type="button"
                        onClick={onDisconnectTiktok}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-900/40 rounded-xl text-xs font-bold cursor-pointer font-sans"
                      >
                        Putuskan
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer font-sans shadow-md"
                      >
                        Hubungkan TikTok Live
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: FACEBOOK LIVE */}
          {activeTab === 'facebook' && (
            <form onSubmit={handleSaveFb} className="space-y-4">
              <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-3.5 text-xs text-indigo-200 font-sans leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Panduan Facebook Live Comments:</p>
                  <p>1. Buka Facebook Live Producer saat memulai siaran.</p>
                  <p>2. Salin <strong>Live Video ID</strong> dari URL siaran.</p>
                  <p>3. Dapatkan <strong>Page Access Token</strong> dengan izin <code>pages_read_engagement</code>.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-sans">
                  Facebook Live Video ID
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 1022938475819203"
                  value={videoId}
                  onChange={(e) => setVideoId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-sans">
                  Facebook Access Token
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste Access Token Facebook Anda di sini (EAA...)"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Status & Kontrol Polling */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs font-sans">
                  <span className="text-slate-400">Status: </span>
                  <span className={`font-bold ${
                    fbStatus.status === 'connected' || fbStatus.status === 'active'
                      ? 'text-emerald-400'
                      : fbStatus.status === 'error'
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}>
                    {fbStatus.message || 'Belum Terhubung'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer font-sans"
                  >
                    Simpan
                  </button>
                  {fbStatus.status === 'active' || fbStatus.status === 'connected' ? (
                    <button
                      type="button"
                      onClick={onStopFb}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer font-sans"
                    >
                      Stop Polling
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onStartFb}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer font-sans"
                    >
                      Mulai Deteksi FB
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: VOICE OVER (TTS) */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <p className="text-sm font-bold text-slate-200 font-sans">Voice Over Tiap Komentar</p>
                  <p className="text-xs text-slate-400 font-sans">Membaca nama dan komentar penonton secara realtime</p>
                </div>
                <input
                  type="checkbox"
                  checked={isVoiceEnabled}
                  onChange={onToggleVoice}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-sans">
                  Pilihan Mesin Suara (Voice Engine)
                </label>
                <select
                  value={voiceEngine}
                  onChange={handleEngineChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                >
                  <option value="google">🌟 Google TTS Indonesia (Mbak Google Asli - Super Fasih & 100% Bahasa Indonesia)</option>
                  <option value="browser">💻 Browser Web Speech (id-ID Offline)</option>
                </select>
                <p className="text-[11px] text-emerald-400 mt-1 font-sans">
                  ✓ Menggunakan suara khas Mbak Google berbahasa Indonesia asli, tidak akan membaca dalam aksen bahasa Inggris.
                </p>
              </div>

              {voiceEngine === 'browser' && availableVoices.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 font-sans">
                    Suara Browser Indonesia
                  </label>
                  <select
                    value={selectedVoiceURI}
                    onChange={handleVoiceChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                  >
                    {availableVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5 font-sans">
                  <span>Kecepatan Suara (Rate)</span>
                  <span className="text-indigo-400">{voiceRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.05"
                  value={voiceRate}
                  onChange={(e) => onChangeVoiceRate(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  1.1x - 1.2x direkomendasikan agar pembacaan komentar gesit saat live ramai.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestVoice}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-xl text-xs font-bold font-sans cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Uji Suara Voice Over (Test TTS)</span>
              </button>
            </div>
          )}

          {/* TAB 4: SIMULATOR (TEST KOMENTAR) */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3 text-xs text-emerald-200 font-sans flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">Fitur Tes Langsung Tanpa Perlu Live Dulu!</p>
                  <p>Gunakan tombol cepat di bawah untuk melihat efek komentar <strong>Mendekati (HIJAU)</strong> dan selebrasi <strong>Juara</strong>.</p>
                </div>
              </div>

              {/* Quick Action Test Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleTestNearWord}
                  className="p-3 bg-emerald-950/60 hover:bg-emerald-900/80 border-2 border-emerald-500 text-emerald-200 rounded-2xl text-left transition-all cursor-pointer shadow-md"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    🟢 Mendekati (Hijau)
                  </p>
                  <p className="text-[10px] text-emerald-400/80 mt-1">
                    Komentar typo ditulis hijau!
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handleTestExactWord}
                  className="p-3 bg-amber-950/60 hover:bg-amber-900/80 border-2 border-amber-500 text-amber-200 rounded-2xl text-left transition-all cursor-pointer shadow-md"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                    🏆 Jawaban Tepat
                  </p>
                  <p className="text-[10px] text-amber-400/80 mt-1">
                    Menang & confetti!
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handleTestGift}
                  className="p-3 bg-rose-950/60 hover:bg-rose-900/80 border-2 border-rose-500 text-rose-200 rounded-2xl text-left transition-all cursor-pointer shadow-md"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                    🎁 Kirim Gift (Buka)
                  </p>
                  <p className="text-[10px] text-rose-400/80 mt-1">
                    Langsung bocorkan jawaban!
                  </p>
                </button>
              </div>

              {/* Form Input Komentar Custom */}
              <form onSubmit={handleSendSimulated} className="space-y-3 pt-2 border-t border-slate-800">
                <p className="text-xs font-bold text-slate-300 font-sans">
                  Kirim Komentar Manual Bebas:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <input
                      type="text"
                      placeholder="Nama Akun"
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-sans"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder={`Ketik tebakanmu (Target: ${currentWord?.word || ''})`}
                      value={simComment}
                      onChange={(e) => setSimComment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-sans cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Komentar ke Live Chat</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/70 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
