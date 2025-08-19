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

function generatePuzzle(deck){
  const used = new Set();
  const hole = drawUnique(deck, 2, used);
  const flop = drawUnique(deck, 3, used);
  const turn = drawUnique(deck, 1, used);
  const river = drawUnique(deck, 1, used);
  const mixRaw = { Fold: Math.random(), Check: Math.random(), Call: Math.random(), Bet: Math.random(), Raise: Math.random() };
  const sum = Object.values(mixRaw).reduce((a,b)=>a+b,0);
  const mix = Object.fromEntries(Object.entries(mixRaw).map(([k,v])=>[k, Math.round(v/sum*100)]));
  const optimal = Object.keys(mix).reduce((a,b)=> mix[a] >= mix[b] ? a : b);
  return { hole, board: {Flop:flop, Turn:[...flop, ...turn], River:[...flop, ...turn, ...river]}, mix, optimal };
}

export default function PracticeDrills({ goHome, addDrillResult }) {
  const deck = useDeck();
  const [position, setPosition] = useState("BTN");
  const [streetIdx, setStreetIdx] = useState(0);
  const [puzzle, setPuzzle] = useState(()=>generatePuzzle(deck));
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const street = STREETS[streetIdx];

  function nextAction(action){
    setLastAction(action);
    const correct = action === puzzle.optimal;
    setFeedback(correct ? "Correct" : `Optimal: ${puzzle.optimal}`);
    setRevealed(!correct);
    setStreak(s => correct ? s+1 : 0);
    addDrillResult({ ts: Date.now(), position, street, action, correct });

    if (streetIdx < STREETS.length-1) setStreetIdx(streetIdx+1);
    else {
      setPuzzle(generatePuzzle(deck));
      setStreetIdx(0);
      setFeedback(null);
      setRevealed(false);
      setLastAction(null);
    }
  }

  useEffect(()=>{
    function onKey(e){
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const key = e.key.toLowerCase();
      if (key === " ") { e.preventDefault(); setRevealed(r=>!r); return; }
      if (key === "1") return nextAction("Fold");
      if (key === "2") return nextAction("Check");
      if (key === "3") return nextAction("Call");
      if (key === "4") return nextAction("Bet");
      if (key === "5") return nextAction("Raise");
      if (key === "f") return nextAction("Fold");
      if (key === "k") return nextAction("Check");
      if (key === "c") return nextAction("Call");
      if (key === "b") return nextAction("Bet");
      if (key === "r") return nextAction("Raise");
    }
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  }, [puzzle, streetIdx, position]);

  const boardCards = street === "Preflop" ? [] : puzzle.board[street];

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
            <div className="badge">Keys: 1–5 or F/K/C/B/R · Space = Reveal</div>
          </div>

          <div className="community-cards">
            {boardCards.map((c,i)=><div key={i}>{toPretty(c)}</div>)}
          </div>
          <div className="player-hand">
            {puzzle.hole.map((c,i)=><div key={i}>{toPretty(c)}</div>)}
          </div>

          <div className="hud-row">
            <button className="pill" onClick={()=>setRevealed(r=>!r)}>
              {revealed ? "Hide Solution (Space)" : "Reveal Solution (Space)"}
            </button>
            <div className="badge">Mock puzzle data</div>
          </div>
        </div>

        <div className="decision-buttons">
          {ACTIONS.map(a=>(
            <button
              key={a}
              onClick={()=>nextAction(a)}
              title={`Shortcut: ${["Fold","Check","Call","Bet","Raise"].indexOf(a)+1} or ${a[0].toUpperCase()}`}
              style={{
                boxShadow: a===lastAction ? "0 0 0 3px rgba(255,255,255,0.15) inset" : "none",
                borderColor: revealed && a===puzzle.optimal ? "#52d273" : "rgba(255,255,255,0.15)"
              }}
            >
              {a}
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`feedback ${feedback==="Correct"?"good":"bad"}`}>{feedback}</div>
        )}
      </div>

      <div className="side-panel">
        <div className="card-panel">
          <h3>Strategy Mix</h3>
          {!revealed && <p style={{color:"#9fb2c6"}}>Press <strong>Space</strong> or click “Reveal Solution”.</p>}
          {revealed && (
            <>
              {Object.entries(puzzle.mix).map(([k,v])=>(
                <div key={k} className="kv"><span>{k}</span><strong>{v}%</strong></div>
              ))}
              <div className="kv"><span>Optimal</span><strong>{puzzle.optimal}</strong></div>
              <div style={{marginTop:10}}>
                <button className="pill" onClick={()=>setRevealed(false)}>Hide</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
