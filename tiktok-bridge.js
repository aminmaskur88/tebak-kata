import http from 'http';
import { WebSocketServer } from 'ws';
import { TikTokLiveConnection } from 'tiktok-live-connector';

const PORT = process.env.PORT || 8081;

let tiktokConnection = null;
let currentUsername = process.argv[2] || '';
let connectionStatus = { status: 'idle', message: 'Menunggu koneksi akun TikTok' };

// Buat HTTP server untuk menangani akses browser (agar tidak muncul error 426 Upgrade Required)
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>TikTok Live Connector Bridge</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: #090d16;
          color: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
        }
        .card {
          background: #111827;
          border: 1px solid #1f2937;
          border-radius: 24px;
          padding: 32px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .badge {
          display: inline-block;
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.4);
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        h1 { margin: 0 0 10px; font-size: 22px; color: #fff; }
        p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          text-decoration: none;
          font-weight: 700;
          padding: 12px 28px;
          border-radius: 14px;
          font-size: 15px;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
          transition: all 0.2s;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(99, 102, 241, 0.5);
        }
        .info-box {
          background: #0b0f19;
          border: 1px solid #1e293b;
          border-radius: 14px;
          padding: 14px;
          margin-top: 24px;
          font-size: 12px;
          color: #64748b;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">🟢 TikTok Bridge AKTIF</span>
        <h1>Layanan Jembatan TikTok Berjalan!</h1>
        <p>
          Halaman ini adalah jembatan background (WebSocket) untuk TikTok Live.
          <br><br>
          Untuk memainkan <strong>Game Tebak Kata</strong>, silakan buka tampilan game di bawah ini:
        </p>
        <a href="http://localhost:5173" class="btn">👉 Buka Game Tebak Kata (Klik Disini)</a>
        
        <div class="info-box">
          <strong>Info Koneksi:</strong><br>
          • Status TikTok: <code>${connectionStatus.status}</code> (${connectionStatus.message})<br>
          • Akun Terpantau: <code>${currentUsername || 'Belum dihubungkan'}</code><br>
          • WebSocket: <code>ws://localhost:${PORT}</code>
        </div>
      </div>
    </body>
    </html>
  `);
});

const wss = new WebSocketServer({ server });

console.log('==================================================');
console.log('🎮 TIKTOK LIVE CONNECTOR BRIDGE');
console.log(`📡 Layanan aktif di http://localhost:${PORT} & ws://localhost:${PORT}`);
console.log('👉 Buka Tampilan Game di: http://localhost:5173');
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

  connectionStatus = {
    status: 'connecting',
    message: `Menghubungkan ke @${currentUsername}...`
  };

  broadcast({
    type: 'status',
    ...connectionStatus
  });

  tiktokConnection = new TikTokLiveConnection(currentUsername, {
    enableExtendedGiftInfo: true,
    processInitialData: false
  });

  tiktokConnection.connect().then(state => {
    console.log(`✅ BERHASIL TERHUBUNG ke TikTok Live @${currentUsername} (Room ID: ${state.roomId})`);
    connectionStatus = {
      status: 'connected',
      message: `Terhubung ke @${currentUsername} (Room: ${state.roomId})`
    };
    broadcast({
      type: 'status',
      ...connectionStatus
    });
  }).catch(err => {
    console.error(`❌ Gagal terhubung ke TikTok Live @${currentUsername}:`, err.message);
    connectionStatus = {
      status: 'error',
      message: `Gagal: ${err.message}`
    };
    broadcast({
      type: 'status',
      ...connectionStatus
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
    connectionStatus = {
      status: 'disconnected',
      message: `Terputus dari @${currentUsername}`
    };
    broadcast({
      type: 'status',
      ...connectionStatus
    });
  });

  tiktokConnection.on('error', err => {
    console.error('❌ TikTok Error:', err);
    connectionStatus = {
      status: 'error',
      message: `Error: ${err.message}`
    };
    broadcast({
      type: 'status',
      ...connectionStatus
    });
  });
}

// Client WebSocket Handler
wss.on('connection', ws => {
  console.log('🔗 Client baru terhubung ke bridge (OBS / Browser)');

  // Kirim status saat ini ke client yang baru buka
  ws.send(JSON.stringify({
    type: 'status',
    ...connectionStatus
  }));

  ws.on('message', message => {
    try {
      const payload = JSON.parse(message.toString());
      if (payload.action === 'connect') {
        connectToTikTok(payload.username);
      } else if (payload.action === 'disconnect') {
        if (tiktokConnection) {
          tiktokConnection.disconnect();
          tiktokConnection = null;
          connectionStatus = { status: 'disconnected', message: 'Koneksi diputus pengguna' };
          broadcast({ type: 'status', ...connectionStatus });
        }
      }
    } catch {
      // ignore
    }
  });
});

server.listen(PORT, () => {
  if (currentUsername) {
    connectToTikTok(currentUsername);
  } else {
    console.log('💡 Menunggu perintah koneksi dari menu pengaturan di browser atau OBS...');
  }
});
