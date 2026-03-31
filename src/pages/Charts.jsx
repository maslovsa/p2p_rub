import { useState, useMemo } from 'react';
import { usePriceHistory } from '../hooks/useSupabase';
import Card, { Skeleton } from '../components/Card';
import TimeFilter from '../components/TimeFilter';
import { TIME_RANGES, EXCHANGE_META } from '../lib/constants';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const chartOptions = (title) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
    title: { display: !!title, text: title, color: '#e2e8f0', font: { size: 14 } },
    tooltip: { backgroundColor: '#1a1a2e', titleColor: '#a78bfa', bodyColor: '#e2e8f0', borderColor: '#7c3aed', borderWidth: 1 },
  },
  scales: {
    x: { ticks: { color: '#64748b', maxTicksLimit: 12, font: { size: 10 } }, grid: { color: '#1e1e3a' } },
    y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e1e3a' } },
  },
});

function buildChartData(rawData, field, groupByExchange = true) {
  if (!rawData?.length) return null;

  // Bucket by exchange, pick median per time slot
  const exchanges = [...new Set(rawData.map(d => d.exchange))];
  const timeBuckets = {};

  rawData.forEach(d => {
    const t = new Date(d.timestamp);
    // Round to 10-min intervals
    t.setMinutes(Math.floor(t.getMinutes() / 10) * 10, 0, 0);
    const key = t.toISOString();
    if (!timeBuckets[key]) timeBuckets[key] = {};
    if (!timeBuckets[key][d.exchange]) timeBuckets[key][d.exchange] = [];
    if (d[field] != null) timeBuckets[key][d.exchange].push(d[field]);
  });

  const sortedTimes = Object.keys(timeBuckets).sort();
  const labels = sortedTimes.map(t => {
    const d = new Date(t);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });

  if (groupByExchange) {
    const datasets = exchanges.map(ex => {
      const meta = EXCHANGE_META[ex] || { color: '#888' };
      return {
        label: ex,
        data: sortedTimes.map(t => {
          const vals = timeBuckets[t]?.[ex];
          if (!vals?.length) return null;
          return vals.reduce((a, b) => a + b, 0) / vals.length;
        }),
        borderColor: meta.color,
        backgroundColor: meta.color + '20',
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
      };
    });
    return { labels, datasets };
  }

  // Aggregate across all exchanges
  const avgData = sortedTimes.map(t => {
    const allVals = Object.values(timeBuckets[t]).flat();
    return allVals.length ? allVals.reduce((a, b) => a + b, 0) / allVals.length : null;
  });
  return {
    labels,
    datasets: [{
      label: field === 'ask_price' ? 'Avg Ask' : field === 'bid_price' ? 'Avg Bid' : 'Avg Spread',
      data: avgData,
      borderColor: '#a78bfa',
      backgroundColor: '#7c3aed20',
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 2,
    }],
  };
}

export default function Charts() {
  const [range, setRange] = useState('24h');
  const hours = TIME_RANGES.find(r => r.label === range)?.hours || 24;
  const { data: rawData, loading } = usePriceHistory(hours);

  const askChart = useMemo(() => buildChartData(rawData, 'ask_price'), [rawData]);
  const bidChart = useMemo(() => buildChartData(rawData, 'bid_price'), [rawData]);
  const spreadChart = useMemo(() => buildChartData(rawData, 'spread', false), [rawData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Price History</h2>
        <TimeFilter value={range} onChange={setRange} />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} h="h-64" />)}
        </div>
      ) : (
        <>
          <Card title="Ask Prices (Buy USDT)">
            <div className="h-72">
              {askChart ? <Line data={askChart} options={chartOptions()} /> : <div className="text-muted text-center py-16">No data</div>}
            </div>
          </Card>

          <Card title="Bid Prices (Sell USDT)">
            <div className="h-72">
              {bidChart ? <Line data={bidChart} options={chartOptions()} /> : <div className="text-muted text-center py-16">No data</div>}
            </div>
          </Card>

          <Card title="Average Spread">
            <div className="h-64">
              {spreadChart ? <Line data={spreadChart} options={chartOptions()} /> : <div className="text-muted text-center py-16">No data</div>}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
