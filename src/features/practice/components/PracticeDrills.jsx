import './PracticeDrills.css';
import Button from '../../../components/ui/Button';
import { useMemo, useState } from 'react';
import { useHotkeys } from '../../../hooks/useHotkeys';

function loadDeck() {
  try {
    const s = localStorage.getItem('srq.deck');
    if (s) return JSON.parse(s);
  } catch {}
  const seed = [
    { id: 'BTNvsBB_open_range', text: 'BTN open vs BB: ~45-55%?', box: 1 },
    { id: 'SB_complete_freq', text: 'SB complete freq vs raise: >25%?', box: 1 },
    { id: 'CO_3bet_call_SC', text: 'CO call 3b suited connectors?', box: 1 },
  ];
  localStorage.setItem('srq.deck', JSON.stringify(seed));
  return seed;
}
function saveDeck(d) {
  try {
    localStorage.setItem('srq.deck', JSON.stringify(d));
  } catch {}
}

export default function PracticeDrills() {
  const [deck, setDeck] = useState(loadDeck);
  const due = useMemo(
    () => deck.filter((c) => c.box <= 3).concat(deck.filter((c) => c.box > 3)),
    [deck],
  );
  const [idx, setIdx] = useState(0);
  const card = due[idx % due.length];

  function mark(correct) {
    setDeck((d) => {
      const copy = d.map((c) => ({ ...c }));
      const i = copy.findIndex((c) => c.id === card.id);
      if (i >= 0) copy[i].box = Math.max(1, Math.min(5, copy[i].box + (correct ? +1 : -1)));
      saveDeck(copy);
      try {
        const h = JSON.parse(localStorage.getItem('history.practice') || '[]');
        h.push({ id: card.id, correct, box: copy[i].box, ts: Date.now() });
        localStorage.setItem('history.practice', JSON.stringify(h));
      } catch {}
      return copy;
    });
    setIdx((i) => i + 1);
  }

  useHotkeys({ y: () => mark(true), n: () => mark(false) });

  return (
    <section className="practice">
      <h1>Practice Drills (Spaced)</h1>
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ opacity: 0.8 }}>Card Box: {card.box}</div>
        <div style={{ fontSize: 18, margin: '8px 0' }}>{card.text}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => mark(true)}>Y � Correct</Button>
          <Button onClick={() => mark(false)}>N � Incorrect</Button>
        </div>
      </div>
    </section>
  );
}
