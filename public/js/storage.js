import { createDefaultSet } from './vocabData.js';

const KEY_VOCAB_SETS = 'vq_vocab_sets_v1';
const KEY_ACTIVE_SET = 'vq_active_set_v1';
const KEY_GRADE_SCALE = 'vq_grade_scale_v1';
const KEY_PUBLISH_INFO = 'vq_publish_info_v1';
const KEY_IMPORTED_REMOTE = 'vq_imported_remote_v1';

export const DEFAULT_GRADE_SCALE = [
  { maxPercent: 5, grade: '1' },
  { maxPercent: 15, grade: '2' },
  { maxPercent: 30, grade: '3' },
  { maxPercent: 45, grade: '4' },
  { maxPercent: 60, grade: '5' },
  { maxPercent: 100, grade: '6' },
];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadVocabSets() {
  const sets = readJson(KEY_VOCAB_SETS, null);
  if (sets && Array.isArray(sets) && sets.length > 0) return sets;
  const seeded = [createDefaultSet()];
  writeJson(KEY_VOCAB_SETS, seeded);
  return seeded;
}

export function saveVocabSets(sets) {
  writeJson(KEY_VOCAB_SETS, sets);
}

export function loadActiveSetId(sets) {
  const id = localStorage.getItem(KEY_ACTIVE_SET);
  if (id && sets.some((s) => s.id === id)) return id;
  const fallback = sets[0]?.id ?? null;
  if (fallback) localStorage.setItem(KEY_ACTIVE_SET, fallback);
  return fallback;
}

export function saveActiveSetId(id) {
  localStorage.setItem(KEY_ACTIVE_SET, id);
}

export function loadGradeScale() {
  const scale = readJson(KEY_GRADE_SCALE, null);
  if (scale && Array.isArray(scale) && scale.length > 0) return scale;
  writeJson(KEY_GRADE_SCALE, DEFAULT_GRADE_SCALE);
  return DEFAULT_GRADE_SCALE.map((s) => ({ ...s }));
}

export function saveGradeScale(scale) {
  writeJson(KEY_GRADE_SCALE, scale);
}

export function loadPublishInfo() {
  return readJson(KEY_PUBLISH_INFO, {});
}

export function savePublishInfo(info) {
  writeJson(KEY_PUBLISH_INFO, info);
}

export function loadImportedRemoteMap() {
  return readJson(KEY_IMPORTED_REMOTE, {});
}

export function saveImportedRemoteMap(map) {
  writeJson(KEY_IMPORTED_REMOTE, map);
}

export function resetAllData() {
  localStorage.removeItem(KEY_VOCAB_SETS);
  localStorage.removeItem(KEY_ACTIVE_SET);
  localStorage.removeItem(KEY_GRADE_SCALE);
  localStorage.removeItem(KEY_PUBLISH_INFO);
  localStorage.removeItem(KEY_IMPORTED_REMOTE);
}
