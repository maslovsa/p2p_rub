-- ============================================
-- Dashboard Analytics Views (add to Supabase SQL editor)
-- ============================================

-- 1. Latest snapshot per exchange + payment_method (already exists, included for completeness)
CREATE OR REPLACE VIEW latest_snapshots AS
SELECT DISTINCT ON (exchange, payment_method) *
FROM p2p_snapshots
ORDER BY exchange, payment_method, timestamp DESC;

-- 2. Best bid (highest price to sell USDT)
CREATE OR REPLACE VIEW best_bid AS
SELECT * FROM latest_snapshots
WHERE bid_price IS NOT NULL
ORDER BY bid_price DESC;

-- 3. Best ask (lowest price to buy USDT)
CREATE OR REPLACE VIEW best_ask AS
SELECT * FROM latest_snapshots
WHERE ask_price IS NOT NULL
ORDER BY ask_price ASC;

-- 4. Arbitrage opportunities: best ask vs best bid across different exchanges
CREATE OR REPLACE VIEW arbitrage_opportunities AS
WITH best AS (
    SELECT * FROM latest_snapshots
    WHERE bid_price IS NOT NULL AND ask_price IS NOT NULL
)
SELECT
    a.exchange   AS buy_exchange,
    a.payment_method AS buy_pm,
    a.ask_price  AS buy_price,
    b.exchange   AS sell_exchange,
    b.payment_method AS sell_pm,
    b.bid_price  AS sell_price,
    ROUND(((b.bid_price - a.ask_price) / a.ask_price * 100)::numeric, 2) AS profit_pct,
    ROUND((b.bid_price - a.ask_price)::numeric, 2) AS profit_rub
FROM best a
CROSS JOIN best b
WHERE a.exchange <> b.exchange
  AND b.bid_price > a.ask_price
ORDER BY profit_pct DESC;

-- 5. Exchange leaderboard: avg prices + data freshness
CREATE OR REPLACE VIEW exchange_leaderboard AS
SELECT
    exchange,
    ROUND(AVG(bid_price)::numeric, 2) AS avg_bid,
    ROUND(AVG(ask_price)::numeric, 2) AS avg_ask,
    ROUND(AVG(spread)::numeric, 2) AS avg_spread,
    COUNT(DISTINCT payment_method) AS payment_methods_count,
    MAX(timestamp) AS last_seen,
    COUNT(*) FILTER (WHERE timestamp > NOW() - INTERVAL '1 hour') AS snapshots_1h,
    COUNT(*) FILTER (WHERE timestamp > NOW() - INTERVAL '24 hours') AS snapshots_24h
FROM p2p_snapshots
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY exchange
ORDER BY avg_spread ASC NULLS LAST;

-- 6. Price history (hourly aggregates for charts)
CREATE OR REPLACE VIEW price_history_hourly AS
SELECT
    exchange,
    payment_method,
    date_trunc('hour', timestamp) AS hour,
    ROUND(AVG(bid_price)::numeric, 2) AS avg_bid,
    ROUND(AVG(ask_price)::numeric, 2) AS avg_ask,
    ROUND(MIN(bid_price)::numeric, 2) AS min_bid,
    ROUND(MAX(bid_price)::numeric, 2) AS max_bid,
    ROUND(MIN(ask_price)::numeric, 2) AS min_ask,
    ROUND(MAX(ask_price)::numeric, 2) AS max_ask,
    ROUND(AVG(spread)::numeric, 2) AS avg_spread,
    COUNT(*) AS samples
FROM p2p_snapshots
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY exchange, payment_method, date_trunc('hour', timestamp)
ORDER BY hour DESC;

-- 7. Payment method comparison
CREATE OR REPLACE VIEW payment_method_stats AS
SELECT
    payment_method,
    COUNT(DISTINCT exchange) AS exchange_count,
    ROUND(AVG(bid_price)::numeric, 2) AS avg_bid,
    ROUND(AVG(ask_price)::numeric, 2) AS avg_ask,
    ROUND(AVG(spread)::numeric, 2) AS avg_spread,
    ROUND(MIN(ask_price)::numeric, 2) AS best_ask,
    ROUND(MAX(bid_price)::numeric, 2) AS best_bid
FROM p2p_snapshots
WHERE timestamp > NOW() - INTERVAL '24 hours'
  AND (bid_price IS NOT NULL OR ask_price IS NOT NULL)
GROUP BY payment_method
ORDER BY avg_spread ASC NULLS LAST;

-- 8. Outlier detection: snapshots >5% from hourly average
CREATE OR REPLACE VIEW outlier_snapshots AS
WITH hourly_avg AS (
    SELECT
        date_trunc('hour', timestamp) AS hour,
        AVG(ask_price) FILTER (WHERE ask_price IS NOT NULL) AS avg_ask,
        AVG(bid_price) FILTER (WHERE bid_price IS NOT NULL) AS avg_bid
    FROM p2p_snapshots
    WHERE timestamp > NOW() - INTERVAL '24 hours'
    GROUP BY date_trunc('hour', timestamp)
)
SELECT
    s.*,
    ROUND(((s.ask_price - h.avg_ask) / NULLIF(h.avg_ask, 0) * 100)::numeric, 2) AS ask_deviation_pct,
    ROUND(((s.bid_price - h.avg_bid) / NULLIF(h.avg_bid, 0) * 100)::numeric, 2) AS bid_deviation_pct
FROM p2p_snapshots s
JOIN hourly_avg h ON date_trunc('hour', s.timestamp) = h.hour
WHERE s.timestamp > NOW() - INTERVAL '24 hours'
  AND (
    ABS((s.ask_price - h.avg_ask) / NULLIF(h.avg_ask, 0)) > 0.05
    OR ABS((s.bid_price - h.avg_bid) / NULLIF(h.avg_bid, 0)) > 0.05
  )
ORDER BY s.timestamp DESC;

-- 9. Average spread by exchange (last 24h) - already exists, included for completeness
CREATE OR REPLACE VIEW avg_spread_24h AS
SELECT
    exchange,
    payment_method,
    ROUND(AVG(spread)::numeric, 2) AS avg_spread,
    ROUND(AVG(bid_price)::numeric, 2) AS avg_bid,
    ROUND(AVG(ask_price)::numeric, 2) AS avg_ask,
    COUNT(*) AS sample_count
FROM p2p_snapshots
WHERE timestamp > NOW() - INTERVAL '24 hours'
  AND spread IS NOT NULL
GROUP BY exchange, payment_method
ORDER BY avg_spread ASC;

-- 10. RLS: allow public read access
ALTER TABLE p2p_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON p2p_snapshots;
CREATE POLICY "Allow public read" ON p2p_snapshots
    FOR SELECT USING (true);

ALTER TABLE exchanges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON exchanges;
CREATE POLICY "Allow public read" ON exchanges
    FOR SELECT USING (true);
