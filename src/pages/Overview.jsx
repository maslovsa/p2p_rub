import { useBestDeals, useSpreadHeatmap, useLatestSnapshots } from '../hooks/useSupabase';
import Card, { StatCard, Skeleton } from '../components/Card';
import { ExchangeBadge, PaymentBadge } from '../components/ExchangeBadge';
import ShareButton from '../components/ShareButton';
import { fmtPrice, fmtPct, fmtAgo } from '../lib/format';
import { EXCHANGE_META } from '../lib/constants';

function SpreadHeatmap({ data }) {
  if (!data?.length) return <div className="text-muted text-sm">No spread data</div>;
  const maxSpread = Math.max(...data.map(d => d.spread || 0));
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {data.map((d, i) => {
        const intensity = maxSpread > 0 ? (d.spread / maxSpread) : 0;
        const bg = `rgba(124, 58, 237, ${0.1 + intensity * 0.5})`;
        return (
          <div key={i} className="rounded-lg p-3 text-center" style={{ background: bg }}>
            <ExchangeBadge name={d.exchange} />
            <div className="text-lg font-bold mt-1">{fmtPrice(d.spread)}</div>
            <div className="text-xs text-muted">{d.payment_method}</div>
          </div>
        );
      })}
    </div>
  );
}

function DealsTable({ deals, side }) {
  const isBuy = side === 'buy';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted text-xs uppercase">
            <th className="text-left py-2">Exchange</th>
            <th className="text-left py-2">Payment</th>
            <th className="text-right py-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {deals?.slice(0, 5).map((d, i) => (
            <tr key={i} className="border-t border-border/50 hover:bg-card-hover/50 transition-colors">
              <td className="py-2"><ExchangeBadge name={d.exchange} /></td>
              <td className="py-2"><PaymentBadge code={d.payment_method} /></td>
              <td className={`py-2 text-right font-mono font-bold ${isBuy ? 'text-green' : 'text-red'}`}>
                {fmtPrice(isBuy ? d.ask_price : d.bid_price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Overview() {
  const { data: deals, loading: dealsLoading } = useBestDeals();
  const { data: heatmap, loading: heatLoading } = useSpreadHeatmap();
  const { data: latest } = useLatestSnapshots();

  // Compute market stats
  const allAsks = latest?.filter(d => d.ask_price > 0).map(d => d.ask_price) || [];
  const allBids = latest?.filter(d => d.bid_price > 0).map(d => d.bid_price) || [];
  const avgAsk = allAsks.length ? (allAsks.reduce((a, b) => a + b, 0) / allAsks.length) : null;
  const avgBid = allBids.length ? (allBids.reduce((a, b) => a + b, 0) / allBids.length) : null;
  const bestAsk = allAsks.length ? Math.min(...allAsks) : null;
  const bestBid = allBids.length ? Math.max(...allBids) : null;
  const bestSpread = bestAsk && bestBid ? bestAsk - bestBid : null;

  // Arb teaser
  const arbPct = bestAsk && bestBid && bestBid > bestAsk
    ? ((bestBid - bestAsk) / bestAsk * 100) : null;

  return (
    <div className="space-y-6">
      {/* Viral banner */}
      {arbPct != null && arbPct > 0 && (
        <div className="glass border-accent/30 p-4 flex items-center justify-between">
          <div>
            <span className="text-accent-light font-bold">Arbitrage opportunity: {fmtPct(arbPct)}</span>
            <span className="text-muted text-sm ml-2">profit right now</span>
          </div>
          <ShareButton text={`USDT/RUB arbitrage ${fmtPct(arbPct)} profit right now!`} />
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Best Buy (Ask)" value={fmtPrice(bestAsk)} color="text-green" sub="lowest price" />
        <StatCard label="Best Sell (Bid)" value={fmtPrice(bestBid)} color="text-red" sub="highest price" />
        <StatCard label="P2P Avg Ask" value={fmtPrice(avgAsk)} color="text-accent-light" />
        <StatCard label="Best Spread" value={fmtPrice(bestSpread)} color="text-yellow" sub="ask - bid" />
      </div>

      {/* Spread heatmap */}
      <Card title="Spread Heatmap">
        {heatLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} h="h-16" />)}
          </div>
        ) : (
          <SpreadHeatmap data={heatmap} />
        )}
      </Card>

      {/* Best deals */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Top 5 Buy Deals (lowest ask)">
          {dealsLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} h="h-8" />)}</div>
          ) : (
            <DealsTable deals={deals?.asks} side="buy" />
          )}
        </Card>
        <Card title="Top 5 Sell Deals (highest bid)">
          {dealsLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} h="h-8" />)}</div>
          ) : (
            <DealsTable deals={deals?.bids} side="sell" />
          )}
        </Card>
      </div>

      {/* Live status */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <div className="pulse-dot" />
        <span>Live — updates every 2 minutes</span>
        {latest?.[0] && <span>| Last data: {fmtAgo(latest[0].timestamp)}</span>}
      </div>
    </div>
  );
}
