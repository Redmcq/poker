import './Solver.css';
import Button from '../../../components/ui/Button';
import { Select } from '../../../components/forms/Select';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useHotkeys } from '../../../hooks/useHotkeys';

const positions = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'].map((p) => ({ value: p, label: p }));

export default function Solver() {
  const [heroPos, setHeroPos] = useLocalStorage('solver.heroPos', 'BTN');
  const [villainPos, setVillainPos] = useLocalStorage('solver.villainPos', 'BB');
  const [pot, setPot] = useLocalStorage('solver.pot', 2.5);
  const [stack, setStack] = useLocalStorage('solver.stack', 100);
  const [result, setResult] = useLocalStorage('solver.lastResult', null);

  function runToySolve() {
    const ev = +((Math.random() - 0.3) * (stack / 100) + pot / 10).toFixed(2);
    const action = ev > 0.15 ? 'Bet' : ev < -0.05 ? 'Check/Fold' : 'Check/Call';
    const out = { heroPos, villainPos, pot, stack, ev, action, ts: Date.now() };
    setResult(out);
    try {
      const h = JSON.parse(localStorage.getItem('history.solves') || '[]');
      h.push(out);
      localStorage.setItem('history.solves', JSON.stringify(h));
    } catch {}
  }
  useHotkeys({ s: () => runToySolve() });

  return (
    <section className="solver">
      <h1>Toy Solver</h1>
      <div className="row">
        <label>Hero</label>
        <Select value={heroPos} onChange={setHeroPos} options={positions} />
        <label>Villain</label>
        <Select value={villainPos} onChange={setVillainPos} options={positions} />
        <label>Pot</label>
        <input type="number" value={pot} onChange={(e) => setPot(+e.target.value)} />
        <label>Stack</label>
        <input type="number" value={stack} onChange={(e) => setStack(+e.target.value)} />
        <Button onClick={runToySolve}>Solve (S)</Button>
      </div>
      {result && (
        <div className="card" style={{ marginTop: 12 }}>
          <div>
            <b>Action:</b> {result.action}
          </div>
          <div>
            <b>EV:</b> {result.ev}
          </div>
          <div>
            <b>Hero:</b> {result.heroPos} vs <b>Villain:</b> {result.villainPos}
          </div>
        </div>
      )}
    </section>
  );
}
