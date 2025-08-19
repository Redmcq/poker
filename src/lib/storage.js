const KEYS = [
  'solver.heroPos',
  'solver.villainPos',
  'solver.pot',
  'solver.stack',
  'solver.lastResult',
  'history.solves',
  'history.practice',
  'practice.seconds',
  'practice.score',
  'practice.running',
  'srq.deck',
  'ui.theme',
];

export function exportData() {
  const out = {};
  for (const k of KEYS) {
    try {
      const v = localStorage.getItem(k);
      if (v !== null) out[k] = JSON.parse(v);
    } catch (e) {
      /* noop */
    }
  }
  const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'poker-study-data.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function importDataJSON(json) {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    for (const [k, v] of Object.entries(data)) localStorage.setItem(k, JSON.stringify(v));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export function resetData() {
  for (const k of KEYS) localStorage.removeItem(k);
}
