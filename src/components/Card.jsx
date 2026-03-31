export default function Card({ title, children, className = '', action }) {
  return (
    <div className={`glass glow p-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="glass glow p-4 text-center">
      <div className="text-xs text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}

export function Skeleton({ h = 'h-4', w = 'w-full', className = '' }) {
  return <div className={`skeleton ${h} ${w} ${className}`} />;
}
