import { useRef, useState } from 'react';
import { exportData, importDataJSON, resetData } from '../lib/storage';

export default function DataInspectorPage() {
  const areaRef = useRef(null);
  const [msg, setMsg] = useState('');

  function handleExport() {
    exportData();
    setMsg('Exported current study data.');
  }
  function handleImport() {
    const txt = areaRef.current.value.trim();
    const res = importDataJSON(txt);
    setMsg(
      res.ok
        ? 'Imported successfully. Refresh pages to see changes.'
        : 'Import failed: ' + res.error,
    );
  }
  function handleReset() {
    if (confirm('Reset all local study data?')) {
      resetData();
      setMsg('Data cleared.');
    }
  }

  const snapshot = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    try {
      snapshot[k] = JSON.parse(localStorage.getItem(k));
    } catch {
      snapshot[k] = localStorage.getItem(k);
    }
  }

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <h1>Data Inspector</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" onClick={handleExport}>
          Export JSON
        </button>
        <button className="btn" onClick={handleReset}>
          Reset All
        </button>
      </div>
      <textarea
        ref={areaRef}
        placeholder="Paste JSON here to import�"
        style={{ minHeight: 160, width: '100%' }}
      />
      <button className="btn" onClick={handleImport}>
        Import from textarea
      </button>
      {msg && <div style={{ opacity: 0.8 }}>{msg}</div>}
      <pre style={{ background: '#0f1320', padding: 12, borderRadius: 8, overflow: 'auto' }}>
        {JSON.stringify(snapshot, null, 2)}
      </pre>
    </section>
  );
}
