/**
 * Utility untuk menghitung kemiripan kata (Levenshtein Distance)
 * Digunakan untuk mendeteksi apakah komentar penonton:
 * 1. BENAR (100% tepat)
 * 2. MENDEKATI (Hampir benar - DITULIS HIJAU)
 * 3. SALAH (Komentar biasa)
 */

export function normalizeText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s]/gi, '') // hapus tanda baca & emoji
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Menghitung jarak Levenshtein antara dua string
 */
export function levenshteinDistance(a, b) {
  const matrix = [];
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  for (let i = 0; i <= lenB; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= lenA; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitusi
          matrix[i][j - 1] + 1,     // penyisipan
          matrix[i - 1][j] + 1      // penghapusan
        );
      }
    }
  }

  return matrix[lenB][lenA];
}

/**
 * Mengecek kecocokan komentar terhadap kata target
 * @param {string} comment - Teks komentar dari penonton
 * @param {string} targetWord - Kata jawaban tebak kata saat ini
 * @returns {{ isExact: boolean, isNear: boolean, similarity: number, candidate: string, reason: string }}
 */
export function checkWordMatch(comment, targetWord) {
  const normComment = normalizeText(comment);
  const normTarget = normalizeText(targetWord);

  if (!normComment || !normTarget) {
    return { isExact: false, isNear: false, similarity: 0, candidate: '', reason: '' };
  }

  // 1. Cek kecocokan langsung seluruh kalimat komentar
  if (normComment === normTarget) {
    return { isExact: true, isNear: false, similarity: 1, candidate: normComment, reason: 'Tepat 100%' };
  }

  // Siapkan daftar kandidat frasa dari komentar (kata tunggal & n-gram)
  const commentWords = normComment.split(' ');
  const targetWordsCount = normTarget.split(' ').length;
  const candidates = [];

  // Seluruh komentar sebagai satu kandidat
  candidates.push(normComment);

  // Kata per kata
  for (const w of commentWords) {
    if (w.length >= 2) candidates.push(w);
  }

  // Jika target terdiri dari beberapa kata (misal: "BADAK JAWA" atau "KANGGURU POHON")
  if (targetWordsCount > 1) {
    for (let i = 0; i <= commentWords.length - targetWordsCount; i++) {
      const slice = commentWords.slice(i, i + targetWordsCount).join(' ');
      candidates.push(slice);
    }
  }

  let bestExact = false;
  let bestNear = false;
  let highestSimilarity = 0;
  let bestCandidate = '';
  let reason = '';

  for (const cand of candidates) {
    if (cand === normTarget) {
      return { isExact: true, isNear: false, similarity: 1, candidate: cand, reason: 'Tepat 100%' };
    }

    const dist = levenshteinDistance(cand, normTarget);
    const maxLen = Math.max(cand.length, normTarget.length);
    const similarity = maxLen > 0 ? (1 - dist / maxLen) : 0;

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestCandidate = cand;
    }

    // Aturan Mendekati (DITULIS HIJAU):
    // - Kata pendek (<= 4 huruf): beda 1 karakter (contoh: "ano" vs "anoa")
    // - Kata sedang (5-7 huruf): beda <= 2 karakter atau similarity >= 0.70
    // - Kata panjang (>= 8 huruf): beda <= 3 karakter atau similarity >= 0.70
    // - Atau jika komentar merupakan substring panjang dari target (misal target "CENDRAWASIH", diketik "cendrawas")
    const len = normTarget.length;
    let isNearMatch = false;

    if (len <= 4 && dist === 1 && cand.length >= 3) {
      isNearMatch = true;
      reason = 'Kurang 1 huruf!';
    } else if (len >= 5 && len <= 7 && (dist <= 2 || similarity >= 0.72) && cand.length >= 4) {
      isNearMatch = true;
      reason = dist === 1 ? 'Typo 1 huruf!' : 'Hampir tepat!';
    } else if (len >= 8 && (dist <= 3 || similarity >= 0.70) && cand.length >= 5) {
      isNearMatch = true;
      reason = 'Sangat mendekati!';
    } else if (cand.length >= 4 && normTarget.includes(cand) && (normTarget.length - cand.length <= 3)) {
      isNearMatch = true;
      reason = 'Tinggal sedikit lagi!';
    }

    if (isNearMatch) {
      bestNear = true;
    }
  }

  return {
    isExact: bestExact,
    isNear: bestNear,
    similarity: highestSimilarity,
    candidate: bestCandidate,
    reason: bestNear ? reason : ''
  };
}
