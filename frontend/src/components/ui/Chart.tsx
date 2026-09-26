'use client';
import { useId } from 'react';

interface AreaChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  formatValue?: (value: number) => string;
}

/** Lightweight dependency-free area chart used for revenue trends. */
export function AreaChart({ data, height = 200, color = 'var(--primary)', formatValue }: AreaChartProps) {
  const gradientId = useId();
  const width = 600;
  const padding = { top: 12, right: 8, bottom: 22, left: 8 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(...data.map((d) => d.value), 1);
  const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW;

  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + innerH - (d.value / max) * innerH,
    ...d,
  }));

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${(padding.left + innerW).toFixed(1)},${padding.top + innerH} L${padding.left},${
    padding.top + innerH
  } Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none" role="img">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={padding.left}
          x2={padding.left + innerW}
          y1={padding.top + innerH * t}
          y2={padding.top + innerH * t}
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}

      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="3" fill="var(--card)" stroke={color} strokeWidth="2" />
          <title>{`${p.label}: ${formatValue ? formatValue(p.value) : p.value}`}</title>
        </g>
      ))}

      {points.map((p, i) =>
        i % Math.ceil(points.length / 7 || 1) === 0 ? (
          <text
            key={`label-${p.label}`}
            x={p.x}
            y={height - 6}
            textAnchor="middle"
            fontSize="10"
            fill="var(--text-subtle)"
          >
            {p.label}
          </text>
        ) : null
      )}
    </svg>
  );
}

interface BarListProps {
  items: { label: string; value: number; hint?: string }[];
  formatValue?: (value: number) => string;
}

export function BarList({ items, formatValue }: BarListProps) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] font-medium">{item.label}</span>
            <span className="flex-shrink-0 text-[12.5px] font-semibold tabular-nums">
              {formatValue ? formatValue(item.value) : item.value}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--input-bg)' }}>
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${Math.max((item.value / max) * 100, 3)}%`,
                background: 'linear-gradient(90deg, var(--primary), var(--accent))',
              }}
            />
          </div>
          {item.hint && <div className="mt-1 text-[11px] text-subtle">{item.hint}</div>}
        </li>
      ))}
    </ul>
  );
}
