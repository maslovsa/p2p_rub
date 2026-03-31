import { EXCHANGE_META, PAYMENT_META } from '../lib/constants';

export function ExchangeBadge({ name }) {
  const meta = EXCHANGE_META[name] || { emoji: '\u{1F4B1}', color: '#888' };
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span>{meta.emoji}</span>
      <span style={{ color: meta.color }} className="font-medium">{name}</span>
    </span>
  );
}

export function PaymentBadge({ code }) {
  const meta = PAYMENT_META[code] || { emoji: '\u{1F4B3}', label: code };
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-surface px-2 py-0.5 rounded-full">
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
    </span>
  );
}
