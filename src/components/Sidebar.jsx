import { NavLink } from 'react-router-dom';
import DbStatus from './DbStatus';

const NAV = [
  { to: '/',            label: 'Overview',    icon: '\u{1F4CA}' },
  { to: '/arbitrage',   label: 'Arbitrage',   icon: '\u26A1' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '\u{1F3C6}' },
  { to: '/charts',      label: 'Charts',      icon: '\u{1F4C8}' },
  { to: '/payments',    label: 'Payments',     icon: '\u{1F4B3}' },
  { to: '/outliers',    label: 'Outliers',     icon: '\u{1F6A8}' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-card border-r border-border p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">
          <span className="text-accent-light">P2P</span> Analytics
        </h1>
        <p className="text-xs text-muted mt-1">USDT/RUB Dashboard</p>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
              ${isActive ? 'bg-accent/20 text-accent-light font-medium' : 'text-muted hover:text-white hover:bg-card-hover'}`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-4 space-y-2">
        <DbStatus />
        <div className="text-xs text-muted/50">Data updates every 2 min</div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around py-2 z-50">
      {NAV.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs gap-0.5 px-2 py-1
            ${isActive ? 'text-accent-light' : 'text-muted'}`
          }
        >
          <span className="text-lg">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
