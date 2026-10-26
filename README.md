# 🎯 Game Interaktif Tebak Kata - Live Streaming (Facebook & TikTok)

Aplikasi game interaktif **Tebak Kata** yang dirancang khusus untuk siaran langsung (Live Streaming di Facebook Live, TikTok Live, atau OBS Studio). Dibuat dengan **React + Tailwind CSS** dan siap dideploy langsung ke **Vercel**.

---

## ✨ Fitur Unggulan

1. **Deteksi Komentar Otomatis (Facebook Live Graph API)**
   - Terintegrasi dengan endpoint Facebook Live Comments.
   - Dilengkapi serverless proxy API (`/api/facebook-comments`) untuk kelancaran akses tanpa kendala CORS di Vercel.
2. **Komentar Mendekati DITULIS HIJAU (Neon Green Highlight)**
   - Setiap kali penonton mengetik jawaban yang hampir benar (typo 1 huruf atau kemiripan > 70%), komentar mereka otomatis **berwarna hijau menyala** dengan lencana `🟢 HAMPIR BENAR!` dan animasi glow.
3. **Voice Over (TTS - Text-to-Speech) Otomatis**
   - Tiap komentar yang masuk otomatis dibacakan oleh suara AI berbahasa Indonesia (`id-ID`).
   - Sistem antrian pintar (*Queue*) sehingga komentar dibaca berurutan tanpa saling tabrak.
   - Pilihan pengaturan kecepatan baca, volume, dan filter kata kasar.
4. **Selebrasi Juara & Leaderboard Realtime**
   - Efek ledakan confetti, musik fanfare, dan popup profil pemenang saat jawaban benar tertebak.
   - Papan klasemen (*Leaderboard Top 5*) penghitung poin dan total kemenangan penonton.
5. **Mode Layar Fleksibel (Portrait 9:16 & Landscape 16:9)**
   - Format **9:16 Portrait** untuk siaran live vertikal dari HP (TikTok / Facebook Reels).
   - Format **16:9 Landscape** untuk siaran monitor penuh di OBS Studio.
6. **Simulator Komentar Bawaan (Test Mode)**
   - Anda bisa menguji coba game, suara voice over, dan efek warna hijau mendekati langsung dari tombol simulator di dalam game tanpa harus sedang live.

---

## 🚀 Cara Menjalankan Secara Lokal

1. Buka folder proyek di terminal / PowerShell:
   ```bash
   npm run dev
   ```
2. Buka browser di alamat `http://localhost:5173`.

---

## 🌐 Cara Deploy ke Vercel (1-Click Deploy)

### Cara 1: Menggunakan Vercel CLI
```bash
npm install -g vercel
vercel
```
Ikuti petunjuk di terminal, tekan `Enter` untuk opsi default. Selesai!

### Cara 2: Hubungkan via GitHub / GitLab
1. Unggah folder ini ke repository GitHub Anda.
2. Buka dashboard [Vercel](https://vercel.com) -> **Add New Project**.
3. Pilih repository `tebak-kata`.
4. Framework Preset akan otomatis terdeteksi sebagai **Vite**.
5. Klik **Deploy**!

---

## 📺 Cara Memasukkan ke OBS Studio (Browser Source)

1. Buka **OBS Studio**.
2. Pada panel **Sources**, klik tombol `+` lalu pilih **Browser**.
3. Beri nama (misalnya: *Game Tebak Kata*).
4. Masukkan **URL** hasil deploy Vercel Anda (misal: `https://tebak-kata-xxx.vercel.app`).
5. Atur resolusi:
   - Jika live vertikal (TikTok/FB): **Width: 1080**, **Height: 1920** (atau 720 x 1280).
   - Jika live horizontal biasa: **Width: 1920**, **Height: 1080**.
6. Centang pilihan **"Control audio via OBS"** jika ingin volume game masuk ke mixer OBS.
7. Klik **OK**. Game siap tayang di live stream Anda!

---

## ⚙️ Cara Menghubungkan Facebook Live

1. Buka menu **Pengaturan (ikon gear ⚙️)** di game.
2. Masukkan **Facebook Live Video ID** (bisa dilihat di URL Facebook Live Producer saat mulai siaran).
3. Masukkan **Access Token** Facebook Anda.
4. Klik **Mulai Deteksi Live**. Komentar dari penonton live akan langsung masuk secara realtime ke layar dan dibacakan oleh Voice Over!
