import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportData, resetData } from '../../lib/storage';
import './CommandPalette.css';

const COMMANDS = [
  { id: 'go-home', label: 'Go: Home', action: (nav) => nav('/') },
  { id: 'go-heatmap', label: 'Go: Heatmap', action: (nav) => nav('/heatmap') },
  { id: 'go-solver', label: 'Go: Solver', action: (nav) => nav('/solver') },
  { id: 'go-practice', label: 'Go: Practice', action: (nav) => nav('/practice') },
  { id: 'go-history', label: 'Go: History', action: (nav) => nav('/history') },
  { id: 'go-data', label: 'Go: Data Inspector', action: (nav) => nav('/data') },
  { id: 'export', label: 'Export data (JSON)', action: () => exportData() },
  {
    id: 'reset',
    label: 'Reset all study data',
    action: () => {
      if (confirm('Reset all local study data?')) resetData();
    },
  },
  { id: 'theme', label: 'Toggle theme', action: (_, toggleTheme) => toggleTheme() },
];

export default function CommandPalette({ open, onClose, onToggleTheme }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const nav = useNavigate();
  const filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
    else setQuery('');
  }, [open]);

  function run(cmd) {
    cmd.action(nav, onToggleTheme);
    onClose();
  }

  return (
    <div className={'palette ' + (open ? 'open' : '')} onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command�"
        />
        <ul>
          {filtered.map((c) => (
            <li key={c.id} onClick={() => run(c)}>
              {c.label}
            </li>
          ))}
          {filtered.length === 0 && <li className="muted">No matches</li>}
        </ul>
      </div>
    </div>
  );
}
