import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { hoursAgo } from '../lib/format';

function useQuery(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

// Latest snapshots
export function useLatestSnapshots() {
  return useQuery(async () => {
    const { data, error } = await supabase
      .from('latest_snapshots')
      .select('*');
    if (error) throw error;
    return data;
  });
}

// Best bids and asks
export function useBestDeals() {
  return useQuery(async () => {
    const [bids, asks] = await Promise.all([
      supabase.from('best_bid').select('*').limit(10),
      supabase.from('best_ask').select('*').limit(10),
    ]);
    if (bids.error) throw bids.error;
    if (asks.error) throw asks.error;
    return { bids: bids.data, asks: asks.data };
  });
}

// Arbitrage opportunities
export function useArbitrage() {
  return useQuery(async () => {
    const { data, error } = await supabase
      .from('arbitrage_opportunities')
      .select('*')
      .limit(20);
    if (error) throw error;
    return data;
  });
}

// Exchange leaderboard
export function useLeaderboard() {
  return useQuery(async () => {
    const { data, error } = await supabase
      .from('exchange_leaderboard')
      .select('*');
    if (error) throw error;
    return data;
  });
}

// Price history for charts
export function usePriceHistory(hours = 24, exchange = null) {
  return useQuery(async () => {
    let q = supabase
      .from('p2p_snapshots')
      .select('exchange, bid_price, ask_price, spread, timestamp, payment_method')
      .gte('timestamp', hoursAgo(hours))
      .order('timestamp', { ascending: true });
    if (exchange) q = q.eq('exchange', exchange);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }, [hours, exchange]);
}

// Payment method stats
export function usePaymentStats() {
  return useQuery(async () => {
    const { data, error } = await supabase
      .from('payment_method_stats')
      .select('*');
    if (error) throw error;
    return data;
  });
}

// Outlier snapshots
export function useOutliers() {
  return useQuery(async () => {
    const { data, error } = await supabase
      .from('outlier_snapshots')
      .select('*')
      .limit(50);
    if (error) throw error;
    return data;
  });
}

// Spread heatmap data (latest spread per exchange)
export function useSpreadHeatmap() {
  return useQuery(async () => {
    const { data, error } = await supabase
      .from('latest_snapshots')
      .select('exchange, payment_method, spread, bid_price, ask_price')
      .not('spread', 'is', null);
    if (error) throw error;
    return data;
  });
}
