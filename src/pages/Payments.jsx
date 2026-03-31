import { usePaymentStats } from '../hooks/useSupabase';
import Card, { Skeleton } from '../components/Card';
import { PaymentBadge } from '../components/ExchangeBadge';
import { fmtPrice } from '../lib/format';

export default function Payments() {
  const { data, loading } = usePaymentStats();

  // Find best overall
  const bestAskPm = data?.reduce((best, d) => (!best || (d.best_ask && d.best_ask < best.best_ask)) ? d : best, null);
  const bestBidPm = data?.reduce((best, d) => (!best || (d.best_bid && d.best_bid > best.best_bid)) ? d : best, null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payment Method Analytics</h2>

      {/* Insight banners */}
      {bestAskPm && bestBidPm && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass p-4 border-green/20">
            <div className="text-xs text-muted uppercase">Best to Buy USDT</div>
            <div className="flex items-center gap-2 mt-1">
              <PaymentBadge code={bestAskPm.payment_method} />
              <span className="text-green font-bold text-lg">{fmtPrice(bestAskPm.best_ask)}</span>
            </div>
          </div>
          <div className="glass p-4 border-red/20">
            <div className="text-xs text-muted uppercase">Best to Sell USDT</div>
            <div className="flex items-center gap-2 mt-1">
              <PaymentBadge code={bestBidPm.payment_method} />
              <span className="text-red font-bold text-lg">{fmtPrice(bestBidPm.best_bid)}</span>
            </div>
          </div>
        </div>
      )}

      <Card title="Payment Method Comparison (24h)">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} h="h-10" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase">
                  <th className="text-left py-2">Method</th>
                  <th className="text-center py-2">Exchanges</th>
                  <th className="text-right py-2">Avg Bid</th>
                  <th className="text-right py-2">Avg Ask</th>
                  <th className="text-right py-2">Best Bid</th>
                  <th className="text-right py-2">Best Ask</th>
                  <th className="text-right py-2">Avg Spread</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((d, i) => (
                  <tr key={i} className="border-t border-border/50 hover:bg-card-hover/50 transition-colors">
                    <td className="py-3"><PaymentBadge code={d.payment_method} /></td>
                    <td className="py-3 text-center">{d.exchange_count}</td>
                    <td className="py-3 text-right font-mono">{fmtPrice(d.avg_bid)}</td>
                    <td className="py-3 text-right font-mono">{fmtPrice(d.avg_ask)}</td>
                    <td className="py-3 text-right font-mono text-red font-bold">{fmtPrice(d.best_bid)}</td>
                    <td className="py-3 text-right font-mono text-green font-bold">{fmtPrice(d.best_ask)}</td>
                    <td className="py-3 text-right font-mono text-yellow">{fmtPrice(d.avg_spread)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
