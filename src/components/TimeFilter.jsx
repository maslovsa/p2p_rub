import { TIME_RANGES } from '../lib/constants';

export default function TimeFilter({ value, onChange }) {
  return (
    <div className="flex gap-1 bg-surface rounded-lg p-1">
      {TIME_RANGES.map(({ label }) => (
        <button
          key={label}
          onClick={() => onChange(label)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors
            ${value === label
              ? 'bg-accent text-white'
              : 'text-muted hover:text-white'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
