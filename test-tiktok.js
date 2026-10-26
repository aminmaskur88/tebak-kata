import { TikTokLiveConnection } from 'tiktok-live-connector';

const username = process.argv[2] || 'joabgold';

console.log(`\n🔍 Sedang mengetes koneksi ke TikTok Live: @${username}...`);

const conn = new TikTokLiveConnection(username, {
  processInitialData: false
});

conn.connect().then(state => {
  console.log(`\n✅ SUKSES! Terhubung ke siaran @${username}`);
  console.log(`📌 Room ID: ${state.roomId}`);
  console.log(`📡 Menunggu komentar masuk (akan dites selama 15 detik)...\n`);

  let count = 0;
  conn.on('chat', data => {
    count++;
    const name = data.user?.nickname || data.user?.displayId || data.nickname || data.uniqueId || 'Anonim';
    const msg = data.content || data.comment || '';
    console.log(`💬 [Komentar #${count}] ${name}: "${msg}"`);
  });

  conn.on('gift', data => {
    const name = data.user?.nickname || data.nickname || 'Penonton';
    const gift = data.gift?.name || data.giftName || 'Gift';
    console.log(`🎁 [Gift] ${name} mengirim ${gift}`);
  });

  setTimeout(() => {
    console.log(`\n🏁 Selesai! Berhasil menangkap ${count} komentar.`);
    process.exit(0);
  }, 15000);

}).catch(err => {
  console.error('\n❌ GAGAL TERHUBUNG:');
  if (err.message && err.message.includes("isn't online")) {
    console.error(`👉 Akun @${username} saat ini sedang TIDAK LIVE di TikTok.`);
    console.error('👉 Pastikan akun tersebut sudah menekan tombol "Go Live" di TikTok sebelum menghubungkan.');
  } else {
    console.error('👉 Pesan Error:', err.message);
  }
  process.exit(1);
});
