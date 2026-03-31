import { useLeaderboard } from '../hooks/useSupabase';
import Card, { Skeleton } from '../components/Card';
import { ExchangeBadge } from '../components/ExchangeBadge';
import { fmtPrice, fmtAgo } from '../lib/format';

function ReliabilityBar({ snapshots1h, snapshots24h }) {
  // ~30 expected per hour (every 2 min), ~720 per 24h
  const pct = Math.min(100, Math.round((snapshots24h / 720) * 100));
  const color = pct > 80 ? 'bg-green' : pct > 50 ? 'bg-yellow' : 'bg-red';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-surface rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted">{pct}%</span>
    </div>
  );
}

export default function Leaderboard() {
  const { data, loading } = useLeaderboard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Exchange Leaderboard</h2>

      <Card>
        {loading ? (
          <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} h="h-12" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase">
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">Exchange</th>
                  <th className="text-right py-2">Avg Bid</th>
                  <th className="text-right py-2">Avg Ask</th>
                  <th className="text-right py-2">Avg Spread</th>
                  <th className="text-center py-2">PMs</th>
                  <th className="text-center py-2">Reliability</th>
                  <th className="text-right py-2">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((d, i) => (
                  <tr key={d.exchange} className="border-t border-border/50 hover:bg-card-hover/50 transition-colors">
                    <td className="py-3 font-bold text-muted">{i + 1}</td>
                    <td className="py-3"><ExchangeBadge name={d.exchange} /></td>
                    <td className="py-3 text-right font-mono">{fmtPrice(d.avg_bid)}</td>
                    <td className="py-3 text-right font-mono">{fmtPrice(d.avg_ask)}</td>
                    <td className="py-3 text-right font-mono text-yellow">{fmtPrice(d.avg_spread)}</td>
                    <td className="py-3 text-center">{d.payment_methods_count}</td>
                    <td className="py-3">
                      <ReliabilityBar snapshots1h={d.snapshots_1h} snapshots24h={d.snapshots_24h} />
                    </td>
                    <td className="py-3 text-right text-xs text-muted">{fmtAgo(d.last_seen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="text-xs text-muted">
        Ranked by spread (lower is better). Reliability = data points collected / expected in 24h.
      </div>
    </div>
  );
}
