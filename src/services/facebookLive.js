/**
 * Facebook Live Comments Polling Service
 * Mendukung polling langsung atau via Vercel proxy API
 */

export class FacebookLivePoller {
  constructor({ liveVideoId = '', accessToken = '', onCommentReceived = () => {}, onStatusChange = () => {} }) {
    this.liveVideoId = liveVideoId;
    this.accessToken = accessToken;
    this.onCommentReceived = onCommentReceived;
    this.onStatusChange = onStatusChange;
    this.processedCommentIds = new Set();
    this.intervalId = null;
    this.isPolling = false;
    this.pollingIntervalMs = 2000;
    this.lastError = null;
  }

  updateConfig({ liveVideoId, accessToken, pollingIntervalMs }) {
    if (liveVideoId !== undefined) this.liveVideoId = liveVideoId.trim();
    if (accessToken !== undefined) this.accessToken = accessToken.trim();
    if (pollingIntervalMs !== undefined) this.pollingIntervalMs = pollingIntervalMs;
  }

  start() {
    if (this.isPolling) return;
    if (!this.liveVideoId || !this.accessToken) {
      this.onStatusChange({
        status: 'error',
        message: 'Video ID dan Access Token Facebook belum diisi.'
      });
      return;
    }

    this.isPolling = true;
    this.onStatusChange({ status: 'connected', message: 'Terhubung ke Facebook Live' });

    // Panggil langsung pertama kali
    this.fetchComments();

    this.intervalId = setInterval(() => {
      this.fetchComments();
    }, this.pollingIntervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPolling = false;
    this.onStatusChange({ status: 'disconnected', message: 'Polling dihentikan' });
  }

  async fetchComments() {
    if (!this.liveVideoId || !this.accessToken) return;

    try {
      // Coba fetch langsung ke Graph API
      const url = `https://graph.facebook.com/v19.0/${this.liveVideoId}/comments?order=reverse_chronological&fields=id,message,from,created_time&limit=20&access_token=${this.accessToken}`;
      
      let res;
      try {
        res = await fetch(url);
      } catch {
        // Fallback ke proxy API lokal/vercel jika terjadi CORS
        const proxyUrl = `/api/facebook-comments?videoId=${encodeURIComponent(this.liveVideoId)}&token=${encodeURIComponent(this.accessToken)}`;
        res = await fetch(proxyUrl);
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${res.status}`;
        this.lastError = errMsg;
        this.onStatusChange({
          status: 'error',
          message: `FB API: ${errMsg}`
        });
        return;
      }

      const data = await res.json();
      const comments = data.data || [];

      // Sort chronological (dari yang paling lama ke yang terbaru dari kumpulan limit)
      const sorted = [...comments].reverse();

      for (const item of sorted) {
        if (!this.processedCommentIds.has(item.id)) {
          this.processedCommentIds.add(item.id);

          // Batasi memori Set
          if (this.processedCommentIds.size > 2000) {
            const firstItems = Array.from(this.processedCommentIds).slice(0, 500);
            firstItems.forEach(id => this.processedCommentIds.delete(id));
          }

          const userName = item.from?.name || 'Penonton Facebook';
          const userId = item.from?.id || '';
          const profilePic = userId 
            ? `https://graph.facebook.com/${userId}/picture?type=square`
            : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName)}`;

          this.onCommentReceived({
            id: item.id,
            userName,
            message: item.message || '',
            profilePic,
            createdTime: item.created_time,
            source: 'facebook'
          });
        }
      }

      this.onStatusChange({
        status: 'active',
        message: `Aktif (${comments.length} komentar dipantau)`
      });

    } catch (err) {
      this.lastError = err.message;
      this.onStatusChange({
        status: 'error',
        message: `Koneksi gagal: ${err.message}`
      });
    }
  }
}
