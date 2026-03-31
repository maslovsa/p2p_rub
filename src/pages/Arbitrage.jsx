import { useArbitrage } from '../hooks/useSupabase';
import Card, { Skeleton } from '../components/Card';
import { ExchangeBadge, PaymentBadge } from '../components/ExchangeBadge';
import ShareButton from '../components/ShareButton';
import { fmtPrice, fmtPct } from '../lib/format';

export default function Arbitrage() {
  const { data: arbs, loading } = useArbitrage();

  const topArb = arbs?.[0];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Arbitrage Opportunities</h2>

      {/* Top opportunity banner */}
      {topArb && topArb.profit_pct > 0 && (
        <div className="glass p-5 border-green/30">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-muted uppercase mb-1">Best Opportunity</div>
              <div className="text-3xl font-bold text-green">{fmtPct(topArb.profit_pct)}</div>
              <div className="text-sm text-muted mt-1">
                Buy on <span className="text-white font-medium">{topArb.buy_exchange}</span> at {fmtPrice(topArb.buy_price)}
                {' \u2192 '}
                Sell on <span className="text-white font-medium">{topArb.sell_exchange}</span> at {fmtPrice(topArb.sell_price)}
              </div>
              <div className="text-sm text-yellow font-medium mt-1">
                Profit: {fmtPrice(topArb.profit_rub)} RUB per USDT
              </div>
            </div>
            <ShareButton text={`USDT/RUB arb ${fmtPct(topArb.profit_pct)} right now! ${topArb.buy_exchange}\u2192${topArb.sell_exchange}`} />
          </div>
        </div>
      )}

      {/* Arb table */}
      <Card title="All Opportunities">
        {loading ? (
          <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} h="h-10" />)}</div>
        ) : !arbs?.length ? (
          <div className="text-muted text-center py-8">No arbitrage opportunities right now</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase">
                  <th className="text-left py-2">Buy From</th>
                  <th className="text-left py-2">PM</th>
                  <th className="text-right py-2">Buy Price</th>
                  <th className="text-center py-2">\u2192</th>
                  <th className="text-left py-2">Sell To</th>
                  <th className="text-left py-2">PM</th>
                  <th className="text-right py-2">Sell Price</th>
                  <th className="text-right py-2">Profit</th>
                  <th className="text-right py-2">%</th>
                </tr>
              </thead>
              <tbody>
                {arbs.map((a, i) => (
                  <tr key={i} className="border-t border-border/50 hover:bg-card-hover/50 transition-colors">
                    <td className="py-2"><ExchangeBadge name={a.buy_exchange} /></td>
                    <td className="py-2"><PaymentBadge code={a.buy_pm} /></td>
                    <td className="py-2 text-right font-mono text-green">{fmtPrice(a.buy_price)}</td>
                    <td className="py-2 text-center text-muted">\u2192</td>
                    <td className="py-2"><ExchangeBadge name={a.sell_exchange} /></td>
                    <td className="py-2"><PaymentBadge code={a.sell_pm} /></td>
                    <td className="py-2 text-right font-mono text-red">{fmtPrice(a.sell_price)}</td>
                    <td className="py-2 text-right font-mono text-yellow font-bold">{fmtPrice(a.profit_rub)}</td>
                    <td className="py-2 text-right font-mono text-green font-bold">{fmtPct(a.profit_pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="text-xs text-muted">
        Arbitrage profit = (sell_price - buy_price) / buy_price * 100%. Does not account for fees or transfer time.
      </div>
    </div>
  );
}
