import * as storage from './storage.js';
import { createEmptyEntry, createDefaultSet } from './vocabData.js';
import { uid } from './util.js';

let vocabSets = storage.loadVocabSets();
let activeSetId = storage.loadActiveSetId(vocabSets);
let gradeScale = storage.loadGradeScale();
let publishInfo = storage.loadPublishInfo();
let importedRemoteMap = storage.loadImportedRemoteMap();

function normalizeEntry(e) {
  return {
    id: uid(),
    en: e.en || '',
    de: e.de || '',
    example: e.example || '',
    synonyms: Array.isArray(e.synonyms) ? e.synonyms : [],
    antonyms: Array.isArray(e.antonyms) ? e.antonyms : [],
    definition: e.definition || '',
  };
}

const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function getVocabSets() {
  return vocabSets;
}

export function getActiveSet() {
  return vocabSets.find((s) => s.id === activeSetId) ?? vocabSets[0] ?? null;
}

export function getActiveSetId() {
  return activeSetId;
}

export function setActiveSetId(id) {
  activeSetId = id;
  storage.saveActiveSetId(id);
  notify();
}

export function getGradeScale() {
  return gradeScale;
}

export function setGradeScale(scale) {
  gradeScale = scale;
  storage.saveGradeScale(scale);
  notify();
}

function persistSets() {
  storage.saveVocabSets(vocabSets);
  notify();
}

export function addVocabSet(name) {
  const set = { id: uid(), name: name || 'Neue Vokabelliste', entries: [] };
  vocabSets = [...vocabSets, set];
  persistSets();
  setActiveSetId(set.id);
  return set;
}

export function duplicateVocabSet(setId) {
  const source = vocabSets.find((s) => s.id === setId);
  if (!source) return null;
  const copy = {
    id: uid(),
    name: source.name + ' (Kopie)',
    entries: source.entries.map((e) => ({ ...e, id: uid() })),
  };
  vocabSets = [...vocabSets, copy];
  persistSets();
  setActiveSetId(copy.id);
  return copy;
}

export function renameVocabSet(setId, name) {
  vocabSets = vocabSets.map((s) => (s.id === setId ? { ...s, name } : s));
  persistSets();
}

export function deleteVocabSet(setId) {
  if (vocabSets.length <= 1) return false;
  vocabSets = vocabSets.filter((s) => s.id !== setId);
  if (activeSetId === setId) {
    activeSetId = vocabSets[0].id;
    storage.saveActiveSetId(activeSetId);
  }
  if (publishInfo[setId]) {
    const { [setId]: _drop, ...rest } = publishInfo;
    publishInfo = rest;
    storage.savePublishInfo(publishInfo);
  }
  persistSets();
  return true;
}

export function addEntry(setId) {
  vocabSets = vocabSets.map((s) =>
    s.id === setId ? { ...s, entries: [...s.entries, createEmptyEntry()] } : s
  );
  persistSets();
}

export function updateEntry(setId, entryId, patch) {
  vocabSets = vocabSets.map((s) =>
    s.id === setId
      ? { ...s, entries: s.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e)) }
      : s
  );
  persistSets();
}

export function removeEntry(setId, entryId) {
  vocabSets = vocabSets.map((s) =>
    s.id === setId ? { ...s, entries: s.entries.filter((e) => e.id !== entryId) } : s
  );
  persistSets();
}

export function importVocabSets(newSets, { replace } = { replace: false }) {
  const normalized = newSets.map((s) => ({
    id: uid(),
    name: s.name || 'Importierte Liste',
    entries: (s.entries || []).map(normalizeEntry),
  }));
  vocabSets = replace ? normalized : [...vocabSets, ...normalized];
  if (vocabSets.length === 0) vocabSets = [createDefaultSet()];
  persistSets();
  setActiveSetId(vocabSets[0].id);
}

export function getPublishInfo(setId) {
  return publishInfo[setId] || null;
}

export function setPublishInfo(setId, info) {
  publishInfo = { ...publishInfo, [setId]: info };
  storage.savePublishInfo(publishInfo);
  notify();
}

export function importRemoteSet(remoteRecord) {
  const existingLocalId = importedRemoteMap[remoteRecord.id];
  const existingSet = existingLocalId && vocabSets.find((s) => s.id === existingLocalId);
  const entries = (remoteRecord.entries || []).map(normalizeEntry);

  if (existingSet) {
    vocabSets = vocabSets.map((s) =>
      s.id === existingSet.id ? { ...s, name: remoteRecord.name, entries } : s
    );
    persistSets();
    setActiveSetId(existingSet.id);
    return existingSet.id;
  }

  const newSet = { id: uid(), name: remoteRecord.name, entries };
  vocabSets = [...vocabSets, newSet];
  importedRemoteMap = { ...importedRemoteMap, [remoteRecord.id]: newSet.id };
  storage.saveImportedRemoteMap(importedRemoteMap);
  persistSets();
  setActiveSetId(newSet.id);
  return newSet.id;
}

export function resetToDefaults() {
  storage.resetAllData();
  vocabSets = storage.loadVocabSets();
  activeSetId = storage.loadActiveSetId(vocabSets);
  gradeScale = storage.loadGradeScale();
  publishInfo = storage.loadPublishInfo();
  importedRemoteMap = storage.loadImportedRemoteMap();
  notify();
}
