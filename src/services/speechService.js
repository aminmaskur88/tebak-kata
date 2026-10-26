/**
 * Voice Over / Text-to-Speech (TTS) Service
 * Menggunakan Web Speech API dengan Speech Queue berurutan
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
    this.voice = null;
    this.rate = 1.15; // Kecepatan sedikit lebih lincah untuk live stream
    this.pitch = 1.0;
    this.volume = 1.0;
    this.mode = 'all'; // 'all' | 'near_only' | 'smart'

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
    // Prioritaskan suara bahasa Indonesia (id-ID)
    const indonesianVoice = voices.find(v => v.lang.toLowerCase().includes('id') || v.lang.toLowerCase().includes('ind'));
    if (indonesianVoice) {
      this.voice = indonesianVoice;
    } else if (voices.length > 0) {
      this.voice = voices[0];
    }
  }

  getAvailableVoices() {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  setVoice(voiceURI) {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    const found = voices.find(v => v.voiceURI === voiceURI);
    if (found) {
      this.voice = found;
    }
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
   * @param {Object} options
   * @param {string} options.userName - Nama penonton
   * @param {string} options.text - Teks komentar
   * @param {boolean} options.isNear - Apakah tebakan hampir benar
   * @param {boolean} options.isExact - Apakah tebakan tepat juara
   */
  speakComment({ userName, text, isNear = false, isExact = false }) {
    if (!this.enabled || !this.synth) return;

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
    if (this.isSpeaking || this.queue.length === 0 || !this.synth) return;

    // Batasi antrian maksimal 15 komentar agar tidak delay terlalu lama
    if (this.queue.length > 15) {
      this.queue = this.queue.slice(-5);
    }

    const textToSpeak = this.queue.shift();
    this.isSpeaking = true;

    try {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
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
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }
}

export const speechService = new SpeechService();
