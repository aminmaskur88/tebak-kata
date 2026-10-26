/**
 * Voice Over / Text-to-Speech (TTS) Service
 * Menjamin 100% Suara Bahasa Indonesia Asli
 * Mode 1: Google Indonesian TTS (Mbak Google Asli - Super Fasih & Natural)
 * Mode 2: Web Speech API (Browser id-ID dengan filter ketat)
 */

const BLOCKED_WORDS = [
  'anjing', 'babi', 'bangsat', 'kontol', 'memek', 'jembut', 'pantek', 'asu', 'bajingan', 'tolol', 'goblok'
];

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.queue = [];
    this.isSpeaking = false;
    this.enabled = true;
    this.engine = 'google'; // 'google' (Mbak Google Asli) | 'browser' (Web Speech API)
    this.voice = null;
    this.rate = 1.1; // Kecepatan lincah untuk live stream
    this.volume = 1.0;
    this.currentAudio = null;
    this.mode = 'all'; // 'all' | 'near_only'

    if (this.synth) {
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Cari suara spesifik Bahasa Indonesia (id-ID, Indonesian, Gadis, Ardi)
    const indonesianVoice = voices.find(v => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      return l.startsWith('id') || l.includes('ind') || n.includes('indonesia') || n.includes('gadis') || n.includes('ardi');
    });

    if (indonesianVoice) {
      this.voice = indonesianVoice;
    } else {
      // JANGAN PERNAH gunakan suara bahasa Inggris sebagai fallback!
      // Tetap null agar sistem otomatis menggunakan suara Google Indonesia
      this.voice = null;
    }
  }

  getAvailableVoices() {
    if (!this.synth) return [];
    return this.synth.getVoices().filter(v => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      return l.startsWith('id') || l.includes('ind') || n.includes('indonesia');
    });
  }

  filterText(text) {
    let clean = text;
    for (const bad of BLOCKED_WORDS) {
      const reg = new RegExp(`\\b${bad}\\b`, 'gi');
      clean = clean.replace(reg, '***');
    }
    return clean;
  }

  /**
   * Menambahkan pesan komentar ke antrian suara
   */
  speakComment({ userName, text, isNear = false, isExact = false }) {
    if (!this.enabled) return;

    if (this.mode === 'near_only' && !isNear && !isExact) {
      return;
    }

    const cleanUser = userName.slice(0, 15);
    const cleanText = this.filterText(text.slice(0, 50));

    let speechText = '';

    if (isExact) {
      speechText = `Luar biasa! ${cleanUser} berhasil menebak dengan benar! Jawabannya adalah ${cleanText}!`;
    } else if (isNear) {
      speechText = `Wah, ${cleanUser} hampir benar! Tebakannya ${cleanText}!`;
    } else {
      speechText = `${cleanUser} menebak: ${cleanText}`;
    }

    this.queue.push(speechText);
    this.processQueue();
  }

  processQueue() {
    if (this.isSpeaking || this.queue.length === 0) return;

    // Batasi antrian maksimal 15 komentar agar tidak delay terlalu lama
    if (this.queue.length > 15) {
      this.queue = this.queue.slice(-5);
    }

    const textToSpeak = this.queue.shift();
    this.isSpeaking = true;

    // Jika engine Google atau browser tidak memiliki voice Indonesia: gunakan Google TTS
    if (this.engine === 'google' || !this.voice) {
      this.speakViaGoogle(textToSpeak);
    } else {
      this.speakViaBrowser(textToSpeak);
    }
  }

  // Voice Over Google Indonesia (Mbak Google Asli - 100% Fasih)
  speakViaGoogle(text) {
    try {
      const encoded = encodeURIComponent(text);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=id&client=tw-ob`;

      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      const audio = new Audio(url);
      this.currentAudio = audio;
      audio.playbackRate = Math.min(1.3, Math.max(0.8, this.rate));
      audio.volume = this.volume;

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        setTimeout(() => this.processQueue(), 120);
      };

      audio.onerror = () => {
        // Jika gagal koneksi ke audio Google, coba browser Web Speech
        this.speakViaBrowser(text);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback ke browser jika autoplay diblokir
          this.speakViaBrowser(text);
        });
      }
    } catch {
      this.speakViaBrowser(text);
    }
  }

  // Voice Over Bawaan Browser (Web Speech API dengan lang id-ID)
  speakViaBrowser(text) {
    if (!this.synth) {
      this.isSpeaking = false;
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID'; // Wajib Bahasa Indonesia!

      if (this.voice) {
        utterance.voice = this.voice;
      }

      utterance.rate = this.rate;
      utterance.pitch = 1.0;
      utterance.volume = this.volume;

      utterance.onend = () => {
        this.isSpeaking = false;
        setTimeout(() => this.processQueue(), 120);
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        setTimeout(() => this.processQueue(), 100);
      };

      this.synth.speak(utterance);
    } catch {
      this.isSpeaking = false;
    }
  }

  clearQueue() {
    this.queue = [];
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }
}

export const speechService = new SpeechService();
