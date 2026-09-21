async function parseError(res, fallback) {
  try {
    const body = await res.json();
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

export async function fetchRemoteSet(id) {
  const res = await fetch(`/api/sets/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Diese Vokabelliste wurde nicht gefunden. Der Link ist möglicherweise falsch oder veraltet.');
    throw new Error(await parseError(res, 'Die Vokabelliste konnte nicht geladen werden.'));
  }
  return res.json();
}

export async function publishSet({ name, entries }) {
  const res = await fetch('/api/sets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, entries }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Veröffentlichen fehlgeschlagen.'));
  return res.json();
}

export async function updateRemoteSet(id, editToken, { name, entries }) {
  const res = await fetch(`/api/sets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editToken, name, entries }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Aktualisieren fehlgeschlagen.'));
  return res.json();
}
