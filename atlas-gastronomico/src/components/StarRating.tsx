export function StarRating({
  value,
  count,
  showCount = true,
}: {
  value: number;
  count: number;
  showCount?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm"
      aria-label={`${value.toFixed(1)} de 5 estrellas${showCount ? `, ${count} valoraciones` : ""}`}
    >
      <span className="relative inline-block leading-none" aria-hidden>
        <span className="tracking-[0.12em] text-line">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden tracking-[0.12em] text-dorado"
          style={{ width: `${pct}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className="font-semibold text-ink">{value.toFixed(1)}</span>
      {showCount && <span className="text-ink-faint">({count})</span>}
    </span>
  );
}
