export function fmtPrice(v) {
  if (v == null) return '\u2014';
  return Number(v).toFixed(2);
}

export function fmtPct(v) {
  if (v == null) return '\u2014';
  const n = Number(v);
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

export function fmtAgo(ts) {
  if (!ts) return '\u2014';
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function hoursAgo(h) {
  return new Date(Date.now() - h * 3600_000).toISOString();
}
