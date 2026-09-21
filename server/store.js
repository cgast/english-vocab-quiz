import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const SETS_DIR = path.join(DATA_DIR, 'sets');

const ID_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
const ID_LENGTH = 8;

function generateId() {
  const bytes = crypto.randomBytes(ID_LENGTH);
  let id = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    id += ID_ALPHABET[bytes[i] % ID_ALPHABET.length];
  }
  return id;
}

function generateEditToken() {
  return crypto.randomBytes(24).toString('hex');
}

function tokensMatch(a, b) {
  if (!isString(a) || !isString(b)) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function isString(v) {
  return typeof v === 'string';
}

async function ensureDir() {
  await fs.mkdir(SETS_DIR, { recursive: true });
}

function filePathFor(id) {
  return path.join(SETS_DIR, `${id}.json`);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function createSet({ name, entries }) {
  await ensureDir();

  let id = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateId();
    if (!(await fileExists(filePathFor(candidate)))) {
      id = candidate;
      break;
    }
  }
  if (!id) throw new Error('Could not allocate a unique set id');

  const now = new Date().toISOString();
  const editToken = generateEditToken();
  const record = { id, editToken, name, entries, createdAt: now, updatedAt: now };
  await fs.writeFile(filePathFor(id), JSON.stringify(record, null, 2), 'utf8');
  return { id, editToken };
}

export async function getSet(id) {
  try {
    const raw = await fs.readFile(filePathFor(id), 'utf8');
    const { editToken, ...publicRecord } = JSON.parse(raw);
    return publicRecord;
  } catch {
    return null;
  }
}

export async function updateSet(id, editToken, { name, entries }) {
  let record;
  try {
    const raw = await fs.readFile(filePathFor(id), 'utf8');
    record = JSON.parse(raw);
  } catch {
    return { error: 'not_found' };
  }

  if (!tokensMatch(record.editToken, editToken)) {
    return { error: 'forbidden' };
  }

  record.name = name;
  record.entries = entries;
  record.updatedAt = new Date().toISOString();
  await fs.writeFile(filePathFor(id), JSON.stringify(record, null, 2), 'utf8');
  const { editToken: _drop, ...publicRecord } = record;
  return { record: publicRecord };
}
