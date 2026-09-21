import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSet, getSet, updateSet } from './store.js';
import { validateSetPayload, sanitizeSetPayload } from './validate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const PORT = process.env.PORT || 3000;
const ID_PATTERN = /^[0-9A-Za-z_-]{4,32}$/;

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));

app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

app.post('/api/sets', async (req, res, next) => {
  try {
    const error = validateSetPayload(req.body);
    if (error) return res.status(400).json({ error });
    const clean = sanitizeSetPayload(req.body);
    const { id, editToken } = await createSet(clean);
    res.status(201).json({ id, editToken });
  } catch (err) {
    next(err);
  }
});

app.get('/api/sets/:id', async (req, res, next) => {
  try {
    if (!ID_PATTERN.test(req.params.id)) return res.status(400).json({ error: 'invalid_id' });
    const record = await getSet(req.params.id);
    if (!record) return res.status(404).json({ error: 'not_found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
});

app.put('/api/sets/:id', async (req, res, next) => {
  try {
    if (!ID_PATTERN.test(req.params.id)) return res.status(400).json({ error: 'invalid_id' });
    const { editToken, ...payload } = req.body || {};
    if (typeof editToken !== 'string' || !editToken) {
      return res.status(400).json({ error: 'missing_edit_token' });
    }
    const error = validateSetPayload(payload);
    if (error) return res.status(400).json({ error });
    const clean = sanitizeSetPayload(payload);
    const result = await updateSet(req.params.id, editToken, clean);
    if (result.error === 'not_found') return res.status(404).json({ error: 'not_found' });
    if (result.error === 'forbidden') return res.status(403).json({ error: 'forbidden' });
    res.json(result.record);
  } catch (err) {
    next(err);
  }
});

app.use(express.static(PUBLIC_DIR));

app.get('/s/:id', (req, res) => {
  if (!ID_PATTERN.test(req.params.id)) return res.status(400).send('Invalid link');
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

app.listen(PORT, () => {
  console.log(`Vokabeltrainer server listening on port ${PORT}`);
});
