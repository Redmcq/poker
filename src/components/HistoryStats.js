import React, { useMemo } from "react";

function BarChart({ data, width=520, height=180, color="#4dabf7" }){
  const max = Math.max(1, ...data.map(d=>d.value));
  const bw = Math.floor(width / Math.max(1, data.length));
  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      {data.map((d,i)=>{
        const h = Math.round((d.value / max) * (height-20));
        const x = i*bw + 6, y = height - h - 10;
        return <g key={i}>
          <rect x={x} y={y} width={Math.max(8,bw-12)} height={h} fill={color} rx="4" />
          <text x={x + Math.max(8,bw-12)/2} y={height-2} fontSize="10" fill="#c6cfdb" textAnchor="middle">{d.label}</text>
        </g>;
      })}
    </svg>
  );
}

function LineChart({ data, width=520, height=180, color="#52d273" }){
  const max = Math.max(1, ...data.map(d=>d.value));
  const min = Math.min(0, ...data.map(d=>d.value));
  const dx = (width-20) / Math.max(1,data.length-1);
  const scaleY = v => height-10 - ( (v-min)/(max-min||1) * (height-20) );
  const path = data.map((d,i)=> `${i===0?'M':'L'} ${10+i*dx} ${scaleY(d.value)}`).join(" ");
  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      <path d={path} stroke={color} strokeWidth="2" fill="none" />
      {data.map((d,i)=>(
        <circle key={i} cx={10+i*dx} cy={scaleY(d.value)} r="2.5" fill={color} />
      ))}
    </svg>
  );
}

export default function HistoryStats({ goHome, solverHistory=[], drillHistory=[] }){
  const all = useMemo(()=>[...solverHistory, ...drillHistory].sort((a,b)=>a.ts-b.ts),[solverHistory, drillHistory]);
  const total = all.length;
  const correct = all.filter(d=>d.correct).length;
  const accuracy = total? (correct/total*100).toFixed(1):0;
  const avgEV = total? (all.reduce((s,d)=> s + (Number(d.ev)||0),0)/total).toFixed(3):0;

  const actionMap = {};
  all.forEach(d=>{ actionMap[d.action] = (actionMap[d.action]||0)+1; });
  const barData = Object.entries(actionMap).map(([label,value])=>({label,value}));
  const lineData = all.map((d,i)=>({label: i+1, value: Number(d.ev)||0}));

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
        <div className="chart-card" style={{marginBottom:12}}>
          <h3>EV over time</h3>
          <LineChart data={lineData} />
        </div>
        <div className="chart-card">
          <h3>Action frequency</h3>
          <BarChart data={barData} />
        </div>
      </div>
      <div className="side-panel">
        <div className="card-panel history-pane">
          <h3>Recent</h3>
          <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(all.slice(-10), null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
