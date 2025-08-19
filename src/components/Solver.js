import React, { useEffect, useMemo, useState } from "react";

const RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
const SUITS = ["h","d","c","s"];
const ACTIONS = ["Fold","Check","Call","Bet","Raise"];
const STREETS = ["Preflop","Flop","Turn","River"];
const POSITIONS = ["UTG","MP","CO","BTN","SB","BB"];

function useDeck() {
  return useMemo(()=>{
    const deck = [];
    for (const r of RANKS) for (const s of SUITS) deck.push(r+s);
    return deck;
  },[]);
}
function drawUnique(deck, n, used){
  const out = [];
  while(out.length<n){
    const card = deck[Math.floor(Math.random()*deck.length)];
    if (!used.has(card)) { used.add(card); out.push(card); }
  }
  return out;
}
function toPretty(card){
  const r = card[0], s = card[1];
  const map = {h:"♥", d:"♦", c:"♣", s:"♠"};
  const red = (s==='h'||s==='d');
  return <div className={`card ${red?"red":"black"}`}>{r}{map[s]}</div>;
}

function genScenario(deck){
  const used = new Set();
  const hole = drawUnique(deck, 2, used);
  const flop = drawUnique(deck, 3, used);
  const turn = drawUnique(deck, 1, used);
  const river = drawUnique(deck, 1, used);
  const mixRaw = { Fold: Math.random(), Check: Math.random(), Call: Math.random(), Bet: Math.random(), Raise: Math.random() };
  const sum = Object.values(mixRaw).reduce((a,b)=>a+b,0);
  const mix = Object.fromEntries(Object.entries(mixRaw).map(([k,v])=>[k, Math.round(v/sum*100)]));
  const ev = Object.fromEntries(Object.keys(mix).map(k=>[k, (Math.random()*2 -1).toFixed(2)]));
  const optimal = Object.keys(mix).reduce((a,b)=> mix[a] >= mix[b] ? a : b);
  return { hole, board: {Flop:flop, Turn:[...flop, ...turn], River:[...flop, ...turn, ...river]}, mix, ev, optimal };
}

export default function Solver({ goHome, addSolverResult }) {
  const deck = useDeck();
  const [position, setPosition] = useState("BTN");
  const [streetIdx, setStreetIdx] = useState(0);
  const [scenario, setScenario] = useState(()=>genScenario(deck));
  const [lastAction, setLastAction] = useState(null);
  const street = STREETS[streetIdx];

  function act(action){
    setLastAction(action);
    const correct = action === scenario.optimal;
    const ev = Number(scenario.ev[action]||0);
    addSolverResult({ ts: Date.now(), position, street, action, correct, ev });
    if (streetIdx < STREETS.length-1) setStreetIdx(streetIdx+1);
    else { setScenario(genScenario(deck)); setStreetIdx(0); setLastAction(null); }
  }

  useEffect(()=>{
    function onKey(e){
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const key = e.key.toLowerCase();
      if (key === "1") return act("Fold");
      if (key === "2") return act("Check");
      if (key === "3") return act("Call");
      if (key === "4") return act("Bet");
      if (key === "5") return act("Raise");
      if (key === "f") return act("Fold");
      if (key === "k") return act("Check");
      if (key === "c") return act("Call");
      if (key === "b") return act("Bet");
      if (key === "r") return act("Raise");
    }
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  }, [scenario, streetIdx, position]);

  const boardCards = street === "Preflop" ? [] : scenario.board[street];

  return (
    <div className="page-container">
      <div className="main-column">
        <button className="back-btn" onClick={goHome}>← Back</button>

        <div className="poker-table">
          <div className="table-hud">
            <div>
              Position:&nbsp;
              <select value={position} onChange={e=>setPosition(e.target.value)}>
                {POSITIONS.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div>Street: <strong>{street}</strong></div>
            <div className="badge">Keys: 1–5 or F/K/C/B/R</div>
          </div>

          <div className="community-cards">
            {boardCards.map((c,i)=><div key={i}>{toPretty(c)}</div>)}
          </div>
          <div className="player-hand">
            {scenario.hole.map((c,i)=><div key={i}>{toPretty(c)}</div>)}
          </div>
        </div>

        <div className="decision-buttons">
          {ACTIONS.map(a=>{
            const e = scenario.ev[a];
            const isBest = a===scenario.optimal;
            const isLast = a===lastAction;
            return (
              <button
                key={a}
                onClick={()=>act(a)}
                title={`Shortcut: ${["Fold","Check","Call","Bet","Raise"].indexOf(a)+1} or ${a[0].toUpperCase()}`}
                style={{
                  borderColor: isBest ? "#52d273" : "rgba(255,255,255,0.15)",
                  boxShadow: isLast ? "0 0 0 3px rgba(255,255,255,0.15) inset" : "none"
                }}
              >
                {a} {typeof e!=="undefined"?`(EV ${e})`:""}
              </button>
            );
          })}
        </div>
      </div>

      <div className="side-panel">
        <div className="card-panel">
          <h3>Action Mix</h3>
          {Object.entries(scenario.mix).map(([k,v])=>(
            <div key={k} className="kv"><span>{k}</span><strong>{v}%</strong></div>
          ))}
          <div className="kv"><span>Optimal</span><strong>{scenario.optimal}</strong></div>
        </div>
      </div>
    </div>
  );
}
