import { useOutliers } from '../hooks/useSupabase';
import Card, { Skeleton } from '../components/Card';
import { ExchangeBadge, PaymentBadge } from '../components/ExchangeBadge';
import { fmtPrice, fmtPct, fmtAgo } from '../lib/format';

export default function Outliers() {
  const { data, loading } = useOutliers();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Outlier Detection</h2>
      <p className="text-sm text-muted">
        Rates that deviate more than 5% from the hourly average. These could be scam prices, data errors, or genuine arbitrage moments.
      </p>

      <Card title="Unusual Deals (24h)">
        {loading ? (
          <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} h="h-10" />)}</div>
        ) : !data?.length ? (
          <div className="text-center py-12 text-muted">
            <div className="text-4xl mb-2">{'\u2705'}</div>
            No outliers detected in the last 24 hours
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase">
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Exchange</th>
                  <th className="text-left py-2">PM</th>
                  <th className="text-right py-2">Ask</th>
                  <th className="text-right py-2">Ask Dev</th>
                  <th className="text-right py-2">Bid</th>
                  <th className="text-right py-2">Bid Dev</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i} className="border-t border-border/50 hover:bg-card-hover/50 transition-colors">
                    <td className="py-2 text-xs text-muted">{fmtAgo(d.timestamp)}</td>
                    <td className="py-2"><ExchangeBadge name={d.exchange} /></td>
                    <td className="py-2"><PaymentBadge code={d.payment_method} /></td>
                    <td className="py-2 text-right font-mono">{fmtPrice(d.ask_price)}</td>
                    <td className={`py-2 text-right font-mono font-bold ${
                      d.ask_deviation_pct > 0 ? 'text-red' : d.ask_deviation_pct < 0 ? 'text-green' : 'text-muted'
                    }`}>
                      {d.ask_deviation_pct != null ? fmtPct(d.ask_deviation_pct) : '\u2014'}
                    </td>
                    <td className="py-2 text-right font-mono">{fmtPrice(d.bid_price)}</td>
                    <td className={`py-2 text-right font-mono font-bold ${
                      d.bid_deviation_pct > 0 ? 'text-red' : d.bid_deviation_pct < 0 ? 'text-green' : 'text-muted'
                    }`}>
                      {d.bid_deviation_pct != null ? fmtPct(d.bid_deviation_pct) : '\u2014'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="text-xs text-muted">
        Outlier threshold: 5% deviation from hourly average. Positive = above average (possible scam sell), negative = below average (possible bargain).
      </div>
    </div>
  );
}
