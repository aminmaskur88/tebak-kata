/**
 * Web Audio API Sound Effects Generator
 * Zero dependency, 100% reliable, no missing MP3 files.
 */

class SoundEffectsManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  getAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  playTone(freq, type = 'sine', duration = 0.15, startTime = 0, volume = 0.25) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    } catch {
      // Audio context might be blocked prior to user interaction
    }
  }

  // Suara saat komentar MENDEKATI (HIJAU)
  playNearSound() {
    if (this.isMuted) return;
    this.playTone(523.25, 'sine', 0.12, 0, 0.2); // C5
    this.playTone(659.25, 'triangle', 0.18, 0.08, 0.25); // E5
  }

  // Suara saat jawaban BENAR (MENANG!)
  playCorrectSound() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.2, idx * 0.08, 0.3);
    });
  }

  // Suara detak detik jam
  playTickSound() {
    if (this.isMuted) return;
    this.playTone(800, 'square', 0.03, 0, 0.05);
  }

  // Suara waktu habis
  playTimeUpSound() {
    if (this.isMuted) return;
    this.playTone(280, 'sawtooth', 0.2, 0, 0.25);
    this.playTone(220, 'sawtooth', 0.35, 0.15, 0.3);
  }

  // Suara fanfare selebrasi juara
  playFanfare() {
    if (this.isMuted) return;
    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 523.25, d: 0.12, t: 0.12 },
      { f: 523.25, d: 0.12, t: 0.24 },
      { f: 659.25, d: 0.35, t: 0.36 },
      { f: 587.33, d: 0.15, t: 0.72 },
      { f: 659.25, d: 0.15, t: 0.88 },
      { f: 783.99, d: 0.5, t: 1.05 },
    ];
    notes.forEach(n => {
      this.playTone(n.f, 'triangle', n.d, n.t, 0.3);
    });
  }
}

export const soundEffects = new SoundEffectsManager();
