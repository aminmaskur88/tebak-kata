/**
 * TikTok Live Client Service
 * Menghubungkan game frontend ke WebSocket bridge lokal (ws://localhost:8081)
 */

export class TikTokLiveClient {
  constructor({ 
    wsUrl = 'ws://localhost:8081', 
    onCommentReceived = () => {}, 
    onGiftReceived = () => {},
    onStatusChange = () => {} 
  }) {
    this.wsUrl = wsUrl;
    this.onCommentReceived = onCommentReceived;
    this.onGiftReceived = onGiftReceived;
    this.onStatusChange = onStatusChange;
    this.ws = null;
    this.username = '';
    this.isConnectedToBridge = false;
    this.autoReconnect = true;
    this.reconnectTimer = null;
  }

  connectToBridge() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.isConnectedToBridge = true;
        this.onStatusChange({
          status: 'bridge_connected',
          message: 'Bridge Lokal Aktif. Siap menghubungkan akun TikTok.'
        });

        // Jika username sudah ada, kirim perintah koneksi
        if (this.username) {
          this.sendConnect(this.username);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'status') {
            this.onStatusChange(payload);
          } else if (payload.type === 'chat') {
            this.onCommentReceived(payload.data);
          } else if (payload.type === 'gift') {
            this.onGiftReceived(payload.data);
          }
        } catch {
          // ignore parsing error
        }
      };

      this.ws.onclose = () => {
        this.isConnectedToBridge = false;
        this.onStatusChange({
          status: 'bridge_disconnected',
          message: 'Bridge lokal belum dijalankan. Jalankan "npm run tiktok" di terminal.'
        });

        if (this.autoReconnect) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            this.connectToBridge();
          }, 3500);
        }
      };

      this.ws.onerror = () => {
        this.isConnectedToBridge = false;
      };

    } catch (err) {
      this.isConnectedToBridge = false;
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
      this.connectToBridge();
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
