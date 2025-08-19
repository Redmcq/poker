import { Link, useLocation } from 'react-router-dom';
import './Header.css';

export function Header() {
  const { pathname } = useLocation();
  return (
    <header className="hdr">
      <div className="hdr-left">
        <Link to="/" className="brand">
          Poker Tool
        </Link>
      </div>
      <nav className="hdr-nav">
        <Link className={pathname === '/heatmap' ? 'active' : ''} to="/heatmap">
          Heatmap
        </Link>
        <Link className={pathname === '/solver' ? 'active' : ''} to="/solver">
          Solver
        </Link>
        <Link className={pathname === '/practice' ? 'active' : ''} to="/practice">
          Practice
        </Link>
        <Link className={pathname === '/history' ? 'active' : ''} to="/history">
          History
        </Link>
        <Link className={pathname === '/data' ? 'active' : ''} to="/data">
          Data
        </Link>
      </nav>
    </header>
  );
}
