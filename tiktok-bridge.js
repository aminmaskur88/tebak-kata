import { WebSocketServer } from 'ws';
import { TikTokLiveConnection } from 'tiktok-live-connector';

const PORT = process.env.PORT || 8081;
const wss = new WebSocketServer({ port: PORT });

let tiktokConnection = null;
let currentUsername = process.argv[2] || '';

console.log('==================================================');
console.log('🎮 TIKTOK LIVE CONNECTOR BRIDGE');
console.log(`📡 WebSocket Server aktif di ws://localhost:${PORT}`);
console.log('==================================================');

function broadcast(obj) {
  const json = JSON.stringify(obj);
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(json);
    }
  });
}

function connectToTikTok(username) {
  if (!username) {
    console.log('⚠️ Username TikTok kosong.');
    return;
  }

  // Jika sudah ada koneksi sebelumnya, putuskan dulu
  if (tiktokConnection) {
    try {
      tiktokConnection.disconnect();
    } catch {
      // ignore
    }
  }

  currentUsername = username.replace(/^@/, '').trim();
  console.log(`\n⏳ Mencoba terhubung ke siaran TikTok Live @${currentUsername}...`);

  broadcast({
    type: 'status',
    status: 'connecting',
    message: `Menghubungkan ke @${currentUsername}...`
  });

  tiktokConnection = new TikTokLiveConnection(currentUsername, {
    enableExtendedGiftInfo: true,
    processInitialData: false
  });

  tiktokConnection.connect().then(state => {
    console.log(`✅ BERHASIL TERHUBUNG ke TikTok Live @${currentUsername} (Room ID: ${state.roomId})`);
    broadcast({
      type: 'status',
      status: 'connected',
      message: `Terhubung ke @${currentUsername} (Room: ${state.roomId})`
    });
  }).catch(err => {
    console.error(`❌ Gagal terhubung ke TikTok Live @${currentUsername}:`, err.message);
    broadcast({
      type: 'status',
      status: 'error',
      message: `Gagal: ${err.message}`
    });
  });

  // Event: Komentar Obrolan (Chat)
  tiktokConnection.on('chat', data => {
    console.log(`💬 [CHAT] ${data.uniqueId} (${data.nickname}): ${data.comment}`);
    broadcast({
      type: 'chat',
      data: {
        id: data.msgId || `${Date.now()}-${Math.random()}`,
        userName: data.nickname || data.uniqueId,
        message: data.comment,
        profilePic: data.profilePictureUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.uniqueId)}`,
        source: 'tiktok'
      }
    });
  });

  // Event: Kiriman Hadiah (Gift)
  tiktokConnection.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) {
      // Streak ongoing
      return;
    }
    console.log(`🎁 [GIFT] ${data.uniqueId} mengirim ${data.giftName} x${data.repeatCount || 1}`);
    broadcast({
      type: 'gift',
      data: {
        userName: data.nickname || data.uniqueId,
        giftName: data.giftName,
        count: data.repeatCount || 1,
        source: 'tiktok'
      }
    });
  });

  // Event: Suka / Like
  tiktokConnection.on('like', data => {
    broadcast({
      type: 'like',
      data: {
        userName: data.nickname || data.uniqueId,
        likeCount: data.likeCount,
        totalLikes: data.totalLikeCount
      }
    });
  });

  // Event: Penonton Bergabung (Member)
  tiktokConnection.on('member', data => {
    broadcast({
      type: 'member',
      data: {
        userName: data.nickname || data.uniqueId
      }
    });
  });

  // Event: Terputus
  tiktokConnection.on('disconnected', () => {
    console.log(`⚠️ Terputus dari TikTok Live @${currentUsername}`);
    broadcast({
      type: 'status',
      status: 'disconnected',
      message: `Terputus dari @${currentUsername}`
    });
  });

  tiktokConnection.on('error', err => {
    console.error('❌ TikTok Error:', err);
    broadcast({
      type: 'status',
      status: 'error',
      message: `Error: ${err.message}`
    });
  });
}

// Client WebSocket Handler
wss.on('connection', ws => {
  console.log('🔗 Client baru terhubung ke bridge (OBS / Browser)');

  // Kirim status saat ini ke client yang baru buka
  if (tiktokConnection && tiktokConnection.isConnected) {
    ws.send(JSON.stringify({
      type: 'status',
      status: 'connected',
      message: `Terhubung ke @${currentUsername}`
    }));
  }

  ws.on('message', message => {
    try {
      const payload = JSON.parse(message.toString());
      if (payload.action === 'connect') {
        connectToTikTok(payload.username);
      } else if (payload.action === 'disconnect') {
        if (tiktokConnection) {
          tiktokConnection.disconnect();
          tiktokConnection = null;
        }
      }
    } catch {
      // ignore
    }
  });
});

// Jika ada username dari argumen terminal (misal: node tiktok-bridge.js nama_akun)
if (currentUsername) {
  connectToTikTok(currentUsername);
} else {
  console.log('💡 Menunggu perintah koneksi dari menu pengaturan di browser atau OBS...');
}
