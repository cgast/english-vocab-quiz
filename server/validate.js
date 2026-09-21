const MAX_NAME = 200;
const MAX_ENTRIES = 500;
const MAX_FIELD = 500;
const MAX_LIST_ITEMS = 20;
const MAX_LIST_ITEM = 100;

function isString(v) {
  return typeof v === 'string';
}

function isValidStringField(v, maxLen) {
  return isString(v) && v.length <= maxLen;
}

function isValidStringList(list, maxItems, maxItemLen) {
  if (!Array.isArray(list) || list.length > maxItems) return false;
  return list.every((item) => isString(item) && item.length <= maxItemLen);
}

export function validateSetPayload(body) {
  if (!body || typeof body !== 'object') return 'Invalid payload';
  if (!isString(body.name) || !body.name.trim() || body.name.length > MAX_NAME) {
    return 'Invalid or missing name';
  }
  if (!Array.isArray(body.entries) || body.entries.length === 0 || body.entries.length > MAX_ENTRIES) {
    return `entries must be an array with 1-${MAX_ENTRIES} items`;
  }
  for (const entry of body.entries) {
    if (!entry || typeof entry !== 'object') return 'Invalid entry';
    if (!isValidStringField(entry.en, MAX_FIELD) || !entry.en.trim()) return 'Invalid entry.en';
    if (!isValidStringField(entry.de, MAX_FIELD) || !entry.de.trim()) return 'Invalid entry.de';
    if (entry.example !== undefined && !isValidStringField(entry.example, MAX_FIELD)) {
      return 'Invalid entry.example';
    }
    if (entry.definition !== undefined && !isValidStringField(entry.definition, MAX_FIELD)) {
      return 'Invalid entry.definition';
    }
    if (entry.synonyms !== undefined && !isValidStringList(entry.synonyms, MAX_LIST_ITEMS, MAX_LIST_ITEM)) {
      return 'Invalid entry.synonyms';
    }
    if (entry.antonyms !== undefined && !isValidStringList(entry.antonyms, MAX_LIST_ITEMS, MAX_LIST_ITEM)) {
      return 'Invalid entry.antonyms';
    }
  }
  return null;
}

export function sanitizeSetPayload(body) {
  return {
    name: body.name.trim(),
    entries: body.entries.map((e) => ({
      en: e.en.trim(),
      de: e.de.trim(),
      example: (e.example || '').trim(),
      definition: (e.definition || '').trim(),
      synonyms: Array.isArray(e.synonyms) ? e.synonyms.map((s) => s.trim()).filter(Boolean) : [],
      antonyms: Array.isArray(e.antonyms) ? e.antonyms.map((s) => s.trim()).filter(Boolean) : [],
    })),
  };
}
