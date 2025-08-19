import React, { useEffect, useState } from "react";
import "./App.css";

import GTOHeatmap from "./components/GTOHeatmap";
import Solver from "./components/Solver";
import PracticeDrills from "./components/PracticeDrills";
import HistoryStats from "./components/HistoryStats";
import GTOReport from "./components/GTOReport";

function App() {
  const [page, setPage] = useState("menu");
  const [solverHistory, setSolverHistory] = useState([]);
  const [drillHistory, setDrillHistory] = useState([]);

  const goHome = () => setPage("menu");
  const addSolverResult = (res) => setSolverHistory(prev => [...prev, { ...res, source: "solver" }]);
  const addDrillResult = (res) => setDrillHistory(prev => [...prev, { ...res, source: "drill" }]);

  useEffect(() => {
    function onKey(e) {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const key = e.key.toLowerCase();
      if (key === "h") setPage("menu");
      if (key === "g") setPage("heatmap");
      if (key === "s") setPage("solver");
      if (key === "d") setPage("drills");
      if (key === "y") setPage("history");
      if (key === "r") setPage("report");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="App">
      <div className="app-bg" />
      <div className="app-shell">
        <div className="topbar">
          <button className="brand as-button" onClick={() => setPage("menu")} title="Go Home (H)" aria-label="Go Home">
            <div className="brand-icon">♠</div>
            <div className="brand-text">Advanced Poker Trainer</div>
          </button>
          <div className="tab-buttons">
            <button className={`tab ${page==='menu'?'active':''}`} onClick={()=>setPage('menu')} title="Home (H)">Home</button>
            <button className={`tab ${page==='heatmap'?'active':''}`} onClick={()=>setPage('heatmap')} title="GTO Heatmap (G)">GTO Heatmap</button>
            <button className={`tab ${page==='solver'?'active':''}`} onClick={()=>setPage('solver')} title="Real-Time Solver (S)">Real-Time Solver</button>
            <button className={`tab ${page==='drills'?'active':''}`} onClick={()=>setPage('drills')} title="Practice Drills (D)">Practice Drills</button>
            <button className={`tab ${page==='history'?'active':''}`} onClick={()=>setPage('history')} title="History & Stats (Y)">History & Stats</button>
            <button className={`tab ${page==='report'?'active':''}`} onClick={()=>setPage('report')} title="GTOReport (R)">GTOReport</button>
          </div>
        </div>

        <div className="page">
          {page==='menu' && (
            <div className="home-grid">
              <div className="hero-card glass">
                <h1 className="hero-title">Sharpen your edge.</h1>
                <p className="hero-sub">Study GTO ranges, drill decisions, and review reports with a clean, pro layout.</p>
                <div className="hero-actions">
                  <button className="cta" onClick={()=>setPage('heatmap')}>Open GTO Heatmap</button>
                  <button className="cta secondary" onClick={()=>setPage('drills')}>Start Drills</button>
                </div>
              </div>
              <div className="quick-links">
                <div className="panel glass">
                  <h3>GTO Heatmap</h3>
                  <p>Explore 13×13 ranges by position, equity/EV layers, and action mixes.</p>
                  <button className="pill" onClick={()=>setPage('heatmap')}>Open</button>
                </div>
                <div className="panel glass">
                  <h3>Real-Time Solver</h3>
                  <p>Solve specific scenarios street by street with intuitive poker UI.</p>
                  <button className="pill" onClick={()=>setPage('solver')}>Open</button>
                </div>
                <div className="panel glass">
                  <h3>Practice Drills</h3>
                  <p>Play puzzle-style hands with streaks and performance tracking.</p>
                  <button className="pill" onClick={()=>setPage('drills')}>Open</button>
                </div>
                <div className="panel glass">
                  <h3>History & Stats</h3>
                  <p>Trends, KPIs, and decision charts across sessions.</p>
                  <button className="pill" onClick={()=>setPage('history')}>Open</button>
                </div>
                <div className="panel glass">
                  <h3>GTOReport</h3>
                  <p>Session reports: action mix, EV contribution, leaks, and recommendations.</p>
                  <button className="pill" onClick={()=>setPage('report')}>Open</button>
                </div>
              </div>
            </div>
          )}

          {page==='heatmap' && <GTOHeatmap goHome={goHome} />}
          {page==='solver' && <Solver goHome={goHome} addSolverResult={addSolverResult} />}
          {page==='drills' && <PracticeDrills goHome={goHome} addDrillResult={addDrillResult} />}
          {page==='history' && <HistoryStats goHome={goHome} solverHistory={solverHistory} drillHistory={drillHistory} />}
          {page==='report' && <GTOReport goHome={goHome} solverHistory={solverHistory} drillHistory={drillHistory} />}
        </div>
      </div>
    </div>
  );
}
export default App;
