export function sentenceErrorPoints(wordGrammarErrors, spellingErrors) {
  const points = (wordGrammarErrors || 0) * 1 + (spellingErrors || 0) * (1 / 3);
  return Math.min(2, Math.max(0, points));
}

export function maxPointsFor(question) {
  return question.type === 'sentence' ? 2 : 1;
}

export function computeMaxPoints(questions) {
  return questions.reduce((sum, q) => sum + maxPointsFor(q), 0);
}

export function gradeForPercent(percent, scale) {
  const sorted = [...scale].sort((a, b) => a.maxPercent - b.maxPercent);
  for (const row of sorted) {
    if (percent <= row.maxPercent) return row.grade;
  }
  return sorted[sorted.length - 1]?.grade ?? '-';
}

export function computeSummary(totalErrorPoints, maxPoints, scale) {
  const percent = maxPoints > 0 ? (totalErrorPoints / maxPoints) * 100 : 0;
  const grade = gradeForPercent(percent, scale);
  return { totalErrorPoints, maxPoints, percent, grade };
}
