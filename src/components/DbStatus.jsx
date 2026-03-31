import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function DbStatus() {
  const [status, setStatus] = useState('checking'); // checking | ok | error | no-config
  const [detail, setDetail] = useState('');
  const [count, setCount] = useState(null);

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key || url === 'https://your-project.supabase.co') {
      setStatus('no-config');
      setDetail('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
      return;
    }

    supabase
      .from('p2p_snapshots')
      .select('id', { count: 'exact', head: true })
      .then(({ count: c, error }) => {
        if (error) {
          setStatus('error');
          setDetail(error.message);
        } else {
          setStatus('ok');
          setCount(c);
          setDetail(`${c} snapshots`);
        }
      })
      .catch((e) => {
        setStatus('error');
        setDetail(e.message);
      });
  }, []);

  const colors = {
    checking: 'bg-yellow',
    ok: 'bg-green',
    error: 'bg-red',
    'no-config': 'bg-red',
  };

  const labels = {
    checking: 'Checking DB...',
    ok: `DB connected`,
    error: 'DB error',
    'no-config': 'DB not configured',
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${colors[status]} ${status === 'checking' ? 'animate-pulse' : ''}`} />
      <span className="text-muted">{labels[status]}</span>
      {detail && <span className="text-muted/60">({detail})</span>}
    </div>
  );
}
