import http from 'http';
import { WebSocketServer } from 'ws';
import { TikTokLiveConnection } from 'tiktok-live-connector';

const PORT = process.env.PORT || 8081;

let tiktokConnection = null;
let currentUsername = process.argv[2] || '';
let currentApiKey = process.env.SIGN_API_KEY || '';
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

function connectToTikTok(username, apiKey = '') {
  if (!username) {
    console.log('⚠️ Username TikTok kosong.');
    return;
  }

  // Putuskan koneksi sebelumnya jika ada
  if (tiktokConnection) {
    try {
      tiktokConnection.disconnect();
    } catch {
      // ignore
    }
  }

  currentUsername = username.replace(/^@/, '').trim();
  if (apiKey) currentApiKey = apiKey.trim();

  console.log(`\n⏳ Mencoba terhubung ke siaran TikTok Live @${currentUsername}...`);

  connectionStatus = {
    status: 'connecting',
    message: `Menghubungkan ke @${currentUsername}...`
  };

  broadcast({
    type: 'status',
    ...connectionStatus
  });

  const connectionOptions = {
    processInitialData: false
  };

  if (currentApiKey) {
    connectionOptions.signApiKey = currentApiKey;
  }

  tiktokConnection = new TikTokLiveConnection(currentUsername, connectionOptions);

  tiktokConnection.connect().then(state => {
    console.log(`✅ BERHASIL TERHUBUNG ke TikTok Live @${currentUsername} (Room ID: ${state.roomId})`);
    connectionStatus = {
      status: 'connected',
      message: `Terhubung ke @${currentUsername}`
    };
    broadcast({
      type: 'status',
      ...connectionStatus
    });
  }).catch(err => {
    let friendlyMsg = err.message;
    if (err.message.includes('rate_limit')) {
      friendlyMsg = 'Batas koneksi per menit tercapai. Mohon tunggu 1 menit lalu coba lagi.';
    } else if (err.message.includes("isn't online")) {
      friendlyMsg = `@${currentUsername} saat ini sedang TIDAK LIVE.`;
    }

    console.error(`❌ Gagal terhubung ke TikTok Live @${currentUsername}:`, friendlyMsg);
    connectionStatus = {
      status: 'error',
      message: friendlyMsg
    };
    broadcast({
      type: 'status',
      ...connectionStatus
    });
  });

  // Event: Komentar Obrolan (Chat)
  tiktokConnection.on('chat', data => {
    const userName = data.user?.nickname || data.user?.displayId || data.nickname || data.uniqueId || 'Penonton TikTok';
    const message = data.content || data.comment || '';
    const profilePic = data.user?.avatarThumb?.urlList?.[0] || data.profilePictureUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName)}`;
    const msgId = data.common?.msgId || data.msgId || `${Date.now()}-${Math.random()}`;

    if (!message) return;

    console.log(`💬 [CHAT] ${userName}: ${message}`);
    broadcast({
      type: 'chat',
      data: {
        id: msgId,
        userName,
        message,
        profilePic,
        source: 'tiktok'
      }
    });
  });

  // Event: Kiriman Hadiah (Gift)
  tiktokConnection.on('gift', data => {
    const userName = data.user?.nickname || data.user?.displayId || data.nickname || data.uniqueId || 'Penonton TikTok';
    const giftName = data.gift?.name || data.giftName || 'Hadiah';
    const count = data.repeatCount || data.comboCount || 1;

    console.log(`🎁 [GIFT] ${userName} mengirim ${giftName} x${count}`);
    broadcast({
      type: 'gift',
      data: {
        userName,
        giftName,
        count,
        source: 'tiktok'
      }
    });
  });

  // Event: Suka / Like
  tiktokConnection.on('like', data => {
    const userName = data.user?.nickname || data.user?.displayId || data.nickname || data.uniqueId || 'Penonton';
    broadcast({
      type: 'like',
      data: {
        userName,
        likeCount: data.likeCount || 1,
        totalLikes: data.totalLikeCount || 0
      }
    });
  });

  // Event: Penonton Bergabung (Member)
  tiktokConnection.on('member', data => {
    const userName = data.user?.nickname || data.user?.displayId || data.nickname || data.uniqueId || 'Penonton';
    broadcast({
      type: 'member',
      data: {
        userName
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
    console.error('❌ TikTok Error:', err.message);
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
        connectToTikTok(payload.username, payload.apiKey);
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
    connectToTikTok(currentUsername, currentApiKey);
  } else {
    console.log('💡 Menunggu perintah koneksi dari menu pengaturan di browser atau OBS...');
  }
});
