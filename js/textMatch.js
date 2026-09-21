function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array(n + 1);
  const curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

function normalize(str) {
  return String(str ?? '')
    .trim()
    .toLowerCase()
    .replace(/^to\s+/, '')
    .replace(/[.!?]+$/, '')
    .replace(/\s+/g, ' ');
}

function spellingThreshold(word) {
  if (word.length <= 4) return 1;
  if (word.length <= 8) return 2;
  return 3;
}

export const ERROR_POINTS = {
  correct: 0,
  spelling: 1 / 3,
  wrong: 1,
};

export function classifyAnswer(userAnswer, acceptedAnswers) {
  const normalizedUser = normalize(userAnswer);
  const accepted = acceptedAnswers.map((a) => ({ raw: a, norm: normalize(a) }));

  if (!normalizedUser) {
    return { status: 'wrong', errorPoints: ERROR_POINTS.wrong, closestMatch: accepted[0]?.raw ?? '' };
  }

  for (const a of accepted) {
    if (a.norm === normalizedUser) {
      return { status: 'correct', errorPoints: ERROR_POINTS.correct, closestMatch: a.raw };
    }
  }

  let best = null;
  for (const a of accepted) {
    const distance = levenshtein(normalizedUser, a.norm);
    const ratio = distance / Math.max(a.norm.length, 1);
    if (!best || distance < best.distance) {
      best = { distance, ratio, raw: a.raw };
    }
  }

  if (best && best.distance <= spellingThreshold(best.raw.replace(/^to\s+/, '')) && best.ratio <= 0.34) {
    return { status: 'spelling', errorPoints: ERROR_POINTS.spelling, closestMatch: best.raw };
  }

  return { status: 'wrong', errorPoints: ERROR_POINTS.wrong, closestMatch: best?.raw ?? accepted[0]?.raw ?? '' };
}
