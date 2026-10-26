/**
 * TikTok Live Client Service
 * Mendukung:
 * 1. Cloud Provider Langsung (tik.tools: wss://api.tik.tools/?uniqueId=...&apiKey=...)
 * 2. Dedicated Cloud Bridge (Render / Railway / VPS: wss://...)
 * 3. Localhost Bridge (JALANKAN_TIKTOK.bat: ws://localhost:8081)
 */

export class TikTokLiveClient {
  constructor({ 
    wsUrl = 'ws://localhost:8081', 
    initialUsername = '',
    apiKey = '',
    onCommentReceived = () => {}, 
    onGiftReceived = () => {},
    onStatusChange = () => {} 
  }) {
    this.wsUrl = wsUrl;
    this.username = initialUsername.replace(/^@/, '').trim();
    this.apiKey = apiKey.trim();
    this.onCommentReceived = onCommentReceived;
    this.onGiftReceived = onGiftReceived;
    this.onStatusChange = onStatusChange;
    this.ws = null;
    this.isConnectedToBridge = false;
    this.autoReconnect = true;
    this.reconnectTimer = null;
    this.endpoints = ['ws://localhost:8081', 'ws://127.0.0.1:8081'];
    this.currentEndpointIndex = 0;
  }

  updateConfig({ wsUrl, username, apiKey }) {
    if (username !== undefined) this.username = username.replace(/^@/, '').trim();
    if (apiKey !== undefined) this.apiKey = apiKey.trim();
    if (wsUrl !== undefined && wsUrl !== this.wsUrl) {
      this.wsUrl = wsUrl.trim();
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      this.connect();
    }
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    let targetUrl = this.wsUrl;

    // Jika menggunakan provider TikTools Cloud API
    if (this.wsUrl.includes('tik.tools')) {
      if (!this.username) {
        this.onStatusChange({
          status: 'idle',
          message: 'Masukkan Username TikTok untuk menghubungkan ke TikTools Cloud'
        });
        return;
      }
      const keyParam = this.apiKey ? `&apiKey=${encodeURIComponent(this.apiKey)}` : '';
      targetUrl = `wss://api.tik.tools/?uniqueId=${encodeURIComponent(this.username)}${keyParam}`;
    } else if (this.wsUrl.includes('localhost') || this.wsUrl.includes('127.0.0.1')) {
      targetUrl = this.endpoints[this.currentEndpointIndex % this.endpoints.length];
    }

    try {
      this.ws = new WebSocket(targetUrl);

      this.ws.onopen = () => {
        this.isConnectedToBridge = true;
        
        if (targetUrl.includes('tik.tools')) {
          this.onStatusChange({
            status: 'connected',
            message: `Terhubung via TikTools Cloud API ke @${this.username} 🌐`
          });
        } else {
          this.onStatusChange({
            status: 'bridge_connected',
            message: 'Server Bridge Terhubung! 🟢'
          });

          // Kirim perintah koneksi ke bridge
          if (this.username) {
            this.sendConnect(this.username);
          }
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          // Handle Status
          if (payload.type === 'status') {
            this.onStatusChange(payload);
          } 
          // Handle Chat Comments (Kompatibel dengan Format TikTools & Format Bridge Lokal)
          else if (payload.type === 'chat' || payload.event === 'chat') {
            const userName = payload.data?.userName || payload.user?.nickname || payload.user?.uniqueId || 'Penonton TikTok';
            const message = payload.data?.message || payload.comment || payload.text || '';
            const profilePic = payload.data?.profilePic || payload.user?.profilePictureUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName)}`;
            const msgId = payload.data?.id || payload.createTime || `${Date.now()}-${Math.random()}`;

            if (message) {
              this.onCommentReceived({
                id: msgId,
                userName,
                message,
                profilePic,
                source: 'tiktok'
              });
            }
          } 
          // Handle Gifts (Kompatibel dengan Format TikTools & Format Bridge Lokal)
          else if (payload.type === 'gift' || payload.event === 'gift') {
            const userName = payload.data?.userName || payload.user?.nickname || payload.user?.uniqueId || 'Penonton';
            const giftName = payload.data?.giftName || payload.gift?.name || payload.giftName || 'Gift';
            const count = payload.data?.count || payload.repeatCount || payload.diamondCount || 1;

            this.onGiftReceived({
              userName,
              giftName,
              count,
              source: 'tiktok'
            });
          }
        } catch {
          // ignore parsing error
        }
      };

      this.ws.onclose = () => {
        this.isConnectedToBridge = false;
        
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        if (isHttps && targetUrl.startsWith('ws://')) {
          this.onStatusChange({
            status: 'mixed_content_warning',
            message: 'Perlu Izin Chrome: Klik gembok 🔒 di URL -> Site Settings -> Ubah "Insecure content" ke Allow'
          });
        } else if (targetUrl.includes('tik.tools')) {
          this.onStatusChange({
            status: 'error',
            message: 'TikTools Cloud terputus. Pastikan username sedang live atau cek API Key.'
          });
        } else {
          this.onStatusChange({
            status: 'bridge_disconnected',
            message: 'Mencari koneksi server bridge...'
          });
        }

        this.currentEndpointIndex++;

        if (this.autoReconnect) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, 3500);
        }
      };

      this.ws.onerror = () => {
        this.isConnectedToBridge = false;
      };

    } catch (err) {
      this.isConnectedToBridge = false;
      if (this.autoReconnect) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.connect();
        }, 3500);
      }
    }
  }

  sendConnect(username) {
    this.username = username.replace(/^@/, '').trim();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'connect',
        username: this.username
      }));
    } else {
      this.connect();
    }
  }

  sendDisconnect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'disconnect' }));
    }
    this.username = '';
  }

  destroy() {
    this.autoReconnect = false;
    clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
