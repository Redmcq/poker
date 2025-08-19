import React, { useMemo, useState } from "react";
import "../App.css";

const RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
const POSITIONS = ["UTG","MP","CO","BTN","SB","BB"];
const STREETS = ["Preflop","Flop","Turn","River"];
const ACTIONS = ["Fold","Check","Call","Bet","Raise"];
const RANK_WEIGHT = { A:10, K:8.5, Q:7.2, J:6.0, T:5.0, "9":4.2, "8":3.6, "7":3.1, "6":2.7, "5":2.4, "4":2.1, "3":1.9, "2":1.8 };
const POS_OPEN = { UTG:0.35, MP:0.42, CO:0.60, BTN:0.82, SB:0.65, BB:0.28 };

function scoreCombo(r1, r2, suited, pair) {
  const base = (RANK_WEIGHT[r1] + RANK_WEIGHT[r2]) / 2;
  const suitedBonus = suited ? 1.0 : 0.0;
  const gap = Math.abs(RANKS.indexOf(r1) - RANKS.indexOf(r2));
  const connBonus = gap === 0 ? 0 : Math.max(0, 1.2 - 0.25 * gap);
  const pairBonus = pair ? (0.7 + RANK_WEIGHT[r1] * 0.12) : 0;
  const smallGapPenalty = (!suited && gap >= 3) ? 0.3 : 0;
  return base + suitedBonus + connBonus + pairBonus - smallGapPenalty;
}
function raiseTendency(score, openness) {
  const t = 1 / (1 + Math.exp(-(score - 7.5)));
  return Math.min(1, Math.max(0, t * (0.55 + 0.7 * openness)));
}
function evFromScore(score, pos) {
  const center = 7.2;
  const span = (pos === "BTN" || pos === "CO") ? 3.2 : (pos === "SB" ? 3.0 : 2.6);
  const raw = (score - center) / span;
  return Math.max(-1.2, Math.min(1.2, raw));
}
function equityFromScore(score) {
  const eq = 0.25 + (score - 3) / 12 * 0.65;
  return Math.max(0.20, Math.min(0.95, eq));
}
function handKey(i, j) {
  const pair = i === j;
  const suited = i < j;
  return pair ? `${RANKS[i]}${RANKS[j]}` : `${RANKS[i]}${RANKS[j]}${suited ? "s" : "o"}`;
}
function colorForEV(val) {
  const t = (val + 1.2) / 2.4;
  const r = Math.round(255 * (1 - t));
  const g = Math.round(60 + 180 * t);
  const b = 70;
  return `rgb(${r},${g},${b})`;
}
function colorForEquity(val) {
  const r = 36;
  const g = Math.round(120 + 135 * val);
  const b = Math.round(160 + 70 * (1 - val));
  return `rgb(${r},${g},${b})`;
}
function colorForFreq(pct) {
  const t = pct / 100;
  const r = Math.round(60 + 120 * t);
  const g = Math.round(90 + 140 * t);
  const b = Math.round(140 + 80 * (1 - t));
  return `rgb(${r},${g},${b})`;
}

function buildPreflopGridForPosition(position) {
  const grid = {};
  const openness = POS_OPEN[position];
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      const pair = i === j;
      const suited = i < j;
      const r1 = RANKS[i], r2 = RANKS[j];
      const key = handKey(i, j);
      const score = scoreCombo(r1, r2, suited, pair);
      const equity = equityFromScore(score);
      let ev = evFromScore(score, position);

      let raise = raiseTendency(score, openness);
      let call = 0, check = 0, fold = 1 - raise;

      if (position === "BTN") {
        if (suited && !pair && score > 6.0 && score < 7.4) call += 0.18;
        if (pair && score < 7.2) call += 0.08;
      } else if (position === "CO") {
        if (suited && !pair && score > 6.2 && score < 7.0) call += 0.08;
      } else if (position === "MP") {
        if (pair && score < 7.0) call += 0.05;
      } else if (position === "UTG") {
        call *= 0.4;
      } else if (position === "SB") {
        if (score > 6.2 && score < 8.0) call += 0.22;
        raise *= 0.92;
      } else if (position === "BB") {
        call = Math.min(0.75, 0.25 + (score - 6.0) * 0.08);
        raise = Math.max(0, Math.min(0.35, (score - 8.0) * 0.16));
        fold = Math.max(0, 1 - call - raise);
        ev *= 0.85;
      }

      let sum = raise + call + fold + check;
      if (sum <= 0) { raise = 0; call = 0; fold = 1; check = 0; sum = 1; }
      raise /= sum; call /= sum; fold /= sum; check /= sum;

      const mix = {
        Fold: Math.round(fold * 100),
        Check: Math.round(check * 100),
        Call : Math.round(call * 100),
        Bet  : 0,
        Raise: Math.round(raise * 100)
      };
      const total = mix.Fold + mix.Check + mix.Call + mix.Bet + mix.Raise;
      if (total !== 100) {
        const diff = 100 - total;
        if (mix.Raise + diff >= 0) mix.Raise += diff;
        else mix.Fold += diff;
      }
      const order = ["Raise","Call","Check","Fold","Bet"];
      const optimal = order.reduce((best, k) => (mix[k] > mix[best] ? k : best), "Fold");

      grid[key] = { equity, ev, mix, optimal };
    }
  }
  return grid;
}

function useRanges() {
  return useMemo(() => {
    const data = {};
    for (const pos of POSITIONS) {
      data[pos] = {};
      for (const street of STREETS) {
        if (street === "Preflop") {
          data[pos][street] = buildPreflopGridForPosition(pos);
        } else {
          const layer = {};
          for (let i = 0; i < 13; i++) {
            for (let j = 0; j < 13; j++) {
              const key = handKey(i, j);
              const equity = Math.random() * 0.6 + 0.2;
              const ev = (Math.random() - 0.5) * 1.8;
              const mixRaw = { Fold: Math.random(), Check: Math.random(), Call: Math.random(), Bet: Math.random(), Raise: Math.random() };
              const sum = Object.values(mixRaw).reduce((a,b)=>a+b,0);
              const mix = Object.fromEntries(Object.entries(mixRaw).map(([k,v])=>[k, Math.round(v/sum*100)]));
              const optimal = Object.keys(mix).reduce((a,b)=> mix[a] >= mix[b] ? a : b);
              layer[key] = { equity, ev, mix, optimal };
            }
          }
          data[pos][street] = layer;
        }
      }
    }
    return data;
  }, []);
}

export default function GTOHeatmap({ goHome }) {
  const ranges = useRanges();
  const [position, setPosition] = useState("BTN");
  const [street, setStreet] = useState("Preflop");
  const [layer, setLayer] = useState("Equity");
  const [freqAction, setFreqAction] = useState("Raise");
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);

  const grid = ranges[position][street];
  const detail = selected || hover;

  function cellBg(data) {
    if (layer === "Equity") return colorForEquity(data.equity);
    if (layer === "EV") return colorForEV(data.ev);
    if (layer === "Frequency") return colorForFreq(data.mix[freqAction] || 0);
    return "#3a3f51";
  }

  return (
    <div className="page-container">
      <div className="main-column">
        <button className="back-btn" onClick={goHome}>← Back</button>
        <div className="glass" style={{padding:12}}>
          <div className="heatmap-header">
            <div className="controls">
              <label>Position:</label>
              <select value={position} onChange={e=>{ setPosition(e.target.value); setSelected(null); }}>
                {POSITIONS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
              <label>Street:</label>
              <select value={street} onChange={e=>{ setStreet(e.target.value); setSelected(null); }}>
                {STREETS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="segment" role="tablist" aria-label="Heatmap Layer">
              {["Equity","EV","Frequency","Strategy"].map(l=>(
                <button
                  key={l}
                  className={layer===l?"active":""}
                  onClick={()=>{ setLayer(l); setSelected(null); }}
                  role="tab"
                  aria-selected={layer===l}
                >{l}</button>
              ))}
            </div>
            {layer==="Frequency" && (
              <div className="controls">
                <label>Action:</label>
                <select value={freqAction} onChange={e=>{ setFreqAction(e.target.value); setSelected(null); }}>
                  {ACTIONS.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="heatmap-grid">
            {RANKS.map((r1,i)=> RANKS.map((r2,j)=>{
              const key = handKey(i,j);
              const data = grid[key];
              const pinned = selected?.hand === key;

              const title = `${key}
Equity: ${(data.equity*100).toFixed(1)}%
EV: ${data.ev.toFixed(2)}
Mix: F${data.mix.Fold}% / Ck${data.mix.Check}% / C${data.mix.Call}% / B${data.mix.Bet}% / R${data.mix.Raise}%
Optimal: ${data.optimal}
(Click to ${pinned ? "unpin" : "pin"} details)`;

              return (
                <div
                  key={key}
                  className="heatmap-cell"
                  title={title}
                  style={{
                    backgroundColor: cellBg(data),
                    outline: pinned ? "2px solid rgba(255,255,255,0.85)" : "none",
                  }}
                  onMouseEnter={()=>!selected && setHover({hand:key,data})}
                  onMouseLeave={()=>!selected && setHover(null)}
                  onClick={()=>{
                    if (selected?.hand === key) { setSelected(null); setHover({hand:key,data}); }
                    else setSelected({hand:key,data});
                  }}
                >
                  <div>{key}</div>
                  {layer==="Strategy" && (
                    <div className="cell-bars">
                      <div className="bar-f" style={{width: (data.mix.Fold||0)+"%"}} />
                      <div className="bar-c" style={{width: (data.mix.Call||0)+"%"}} />
                      <div className="bar-b" style={{width: (data.mix.Bet||0)+"%"}} />
                      <div className="bar-k" style={{width: (data.mix.Check||0)+"%"}} />
                      <div className="bar-r" style={{width: (data.mix.Raise||0)+"%"}} />
                    </div>
                  )}
                </div>
              );
            }))}
          </div>

          <div className="heatmap-legend">
            <span className="badge">Layer: {layer}{layer==="Frequency" ? ` (${freqAction})` : ""}</span>
            <span className="badge">{position} · {street}</span>
            <span className="badge">Approx. Free Preflop Model</span>
          </div>
        </div>
      </div>

      <div className="side-panel">
        <div className="card-panel">
          <h3>Details</h3>
          {!detail && <p style={{color:"#9fb2c6"}}>Hover a combo or click to pin.</p>}
          {detail && (
            <div>
              <div className="kv"><span>Hand</span><strong>{detail.hand}</strong></div>
              <div className="kv"><span>Equity</span><strong>{(detail.data.equity*100).toFixed(1)}%</strong></div>
              <div className="kv"><span>EV</span><strong>{detail.data.ev.toFixed(3)}</strong></div>
              <div className="kv"><span>Optimal</span><strong>{detail.data.optimal}</strong></div>
              <hr style={{borderColor:"rgba(255,255,255,0.08)"}}/>
              <div className="kv"><span>Fold</span><strong>{detail.data.mix.Fold}%</strong></div>
              <div className="kv"><span>Check</span><strong>{detail.data.mix.Check}%</strong></div>
              <div className="kv"><span>Call</span><strong>{detail.data.mix.Call}%</strong></div>
              <div className="kv"><span>Bet</span><strong>{detail.data.mix.Bet}%</strong></div>
              <div className="kv"><span>Raise</span><strong>{detail.data.mix.Raise}%</strong></div>
              {selected && (
                <div style={{marginTop:10, display:"flex", gap:8}}>
                  <button className="pill" onClick={()=>setSelected(null)}>Unpin</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
