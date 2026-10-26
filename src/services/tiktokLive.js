/**
 * TikTok Live Client Service
 * Deteksi otomatis localhost:8081 dan 127.0.0.1:8081
 * Auto-connect saat JALANKAN_TIKTOK.bat aktif
 */

export class TikTokLiveClient {
  constructor({ 
    wsUrl = 'ws://localhost:8081', 
    initialUsername = '',
    onCommentReceived = () => {}, 
    onGiftReceived = () => {},
    onStatusChange = () => {} 
  }) {
    this.wsUrl = wsUrl;
    this.username = initialUsername.replace(/^@/, '').trim();
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

  updateBridgeUrl(newUrl) {
    if (!newUrl || newUrl === this.wsUrl) return;
    this.wsUrl = newUrl.trim();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectToBridge();
  }

  connectToBridge() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // Tentukan URL yang dicoba (prioritas URL custom, atau fallback localhost / 127.0.0.1)
    let targetUrl = this.wsUrl;
    if (this.wsUrl.includes('localhost') || this.wsUrl.includes('127.0.0.1')) {
      targetUrl = this.endpoints[this.currentEndpointIndex % this.endpoints.length];
    }

    try {
      this.ws = new WebSocket(targetUrl);

      this.ws.onopen = () => {
        this.isConnectedToBridge = true;
        this.onStatusChange({
          status: 'bridge_connected',
          message: 'Bridge Lokal Terdeteksi & Terhubung Otomatis! 🟢'
        });

        // AUTO-CONNECT: Jika sudah ada username tersimpan, langsung hubungkan ke siaran TikTok!
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
        
        // Deteksi jika berjalan di Vercel (HTTPS) dan browser memblokir mixed content
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        if (isHttps && targetUrl.startsWith('ws://')) {
          this.onStatusChange({
            status: 'mixed_content_warning',
            message: 'Perlu Izin Chrome: Klik gembok 🔒 di URL -> Site Settings -> Ubah "Insecure content" ke Allow'
          });
        } else {
          this.onStatusChange({
            status: 'bridge_disconnected',
            message: 'Mencari JALANKAN_TIKTOK.bat di latar belakang...'
          });
        }

        // Coba endpoint alternatif (rotasi localhost <-> 127.0.0.1)
        this.currentEndpointIndex++;

        // Auto-reconnect berkala: Begitu bat file dibuka, langsung tersambung otomatis!
        if (this.autoReconnect) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            this.connectToBridge();
          }, 2500);
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
          this.connectToBridge();
        }, 3000);
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
