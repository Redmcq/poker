import React, { useMemo, useState } from "react";

const POSITIONS = ["UTG","MP","CO","BTN","SB","BB"];
const STREETS = ["Preflop","Flop","Turn","River"];

function download(filename, text) {
  const el = document.createElement('a');
  el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  el.setAttribute('download', filename);
  el.style.display = 'none';
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);
}

export default function GTOReport({ goHome, solverHistory=[], drillHistory=[] }){
  const [mode, setMode] = useState("all"); // all | solver | drill
  const [pos, setPos] = useState("ALL");
  const [street, setStreet] = useState("ALL");

  const data = useMemo(()=>{
    let arr = mode==='solver' ? solverHistory : mode==='drill' ? drillHistory : [...solverHistory, ...drillHistory];
    if (pos !== 'ALL') arr = arr.filter(d=>d.position===pos);
    if (street !== 'ALL') arr = arr.filter(d=>d.street===street);
    return arr.sort((a,b)=>a.ts-b.ts);
  },[mode,pos,street,solverHistory,drillHistory]);

  const total = data.length;
  const correct = data.filter(d=>d.correct).length;
  const accuracy = total? (correct/total*100).toFixed(1) : 0;
  const avgEV = total? (data.reduce((s,d)=> s + (Number(d.ev)||0),0)/total).toFixed(3):0;

  const byAction = {};
  const byStreet = {};
  const byPosition = {};
  data.forEach(d=>{
    byAction[d.action] = (byAction[d.action]||0)+1;
    byStreet[d.street] = (byStreet[d.street]||0)+1;
    byPosition[d.position] = (byPosition[d.position]||0)+1;
  });

  function exportCSV(){
    const header = ['ts','source','position','street','action','correct','ev'];
    const rows = data.map(d=>[d.ts,d.source,d.position,d.street,d.action,d.correct,d.ev]);
    const csv = [header.join(','), ...rows.map(r=>r.join(','))].join('\n');
    download('gto_report.csv', csv);
  }

  return (
    <div className="page-container">
      <div className="main-column">
        <button className="back-btn" onClick={goHome}>← Back</button>
        <div className="kpi-row">
          <div className="kpi"><div>Total Decisions</div><h2>{total}</h2></div>
          <div className="kpi"><div>Correct</div><h2>{correct}</h2></div>
          <div className="kpi"><div>Accuracy</div><h2>{accuracy}%</h2></div>
          <div className="kpi"><div>Average EV</div><h2>{avgEV}</h2></div>
        </div>

        <div className="glass" style={{padding:12, marginBottom:12}}>
          <div className="controls">
            <label>Mode:</label>
            <select value={mode} onChange={e=>setMode(e.target.value)}>
              <option value="all">All</option>
              <option value="solver">Solver</option>
              <option value="drill">Drill</option>
            </select>
            <label>Position:</label>
            <select value={pos} onChange={e=>setPos(e.target.value)}>
              <option>ALL</option>
              {POSITIONS.map(p=><option key={p}>{p}</option>)}
            </select>
            <label>Street:</label>
            <select value={street} onChange={e=>setStreet(e.target.value)}>
              <option>ALL</option>
              {STREETS.map(s=><option key={s}>{s}</option>)}
            </select>
            <button className="pill" onClick={exportCSV}>Export CSV</button>
          </div>
        </div>

        <div className="glass" style={{padding:12}}>
          <h3>Breakdowns</h3>
          <div className="kpi-row">
            <div className="kpi" style={{minWidth:220}}>
              <div style={{marginBottom:6, color:'#c6cfdb'}}>By Action</div>
              {Object.entries(byAction).map(([k,v])=> <div key={k} className="kv"><span>{k}</span><strong>{v}</strong></div>)}
            </div>
            <div className="kpi" style={{minWidth:220}}>
              <div style={{marginBottom:6, color:'#c6cfdb'}}>By Street</div>
              {Object.entries(byStreet).map(([k,v])=> <div key={k} className="kv"><span>{k}</span><strong>{v}</strong></div>)}
            </div>
            <div className="kpi" style={{minWidth:220}}>
              <div style={{marginBottom:6, color:'#c6cfdb'}}>By Position</div>
              {Object.entries(byPosition).map(([k,v])=> <div key={k} className="kv"><span>{k}</span><strong>{v}</strong></div>)}
            </div>
          </div>
        </div>
      </div>

      <div className="side-panel">
        <div className="card-panel history-pane">
          <h3>Sample of {data.length} rows</h3>
          <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(data.slice(-15), null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
