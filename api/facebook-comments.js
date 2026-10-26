export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { videoId, token } = req.query;

  if (!videoId || !token) {
    return res.status(400).json({ error: { message: 'Parameter videoId dan token wajib diisi.' } });
  }

  try {
    const fbResponse = await fetch(
      `https://graph.facebook.com/v19.0/${videoId}/comments?order=reverse_chronological&fields=id,message,from,created_time&limit=25&access_token=${token}`
    );

    const data = await fbResponse.json();
    return res.status(fbResponse.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: 'Gagal mengambil komentar dari Facebook: ' + err.message } });
  }
}
