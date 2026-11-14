"use client";

import { useId } from "react";

export interface TrendPoint {
  date: string;
  score: number;
  label: string;
}

interface TrendChartProps {
  points: TrendPoint[];
  color?: string;
  height?: number;
}

function formatAxisDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

export function TrendChart({
  points,
  color = "#17181C",
  height = 250,
}: TrendChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const width = 760;
  const padding = { left: 34, right: 18, top: 18, bottom: 34 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const minY = 45;
  const maxY = 100;

  const coords = points.map((point, index) => ({
    ...point,
    x:
      padding.left +
      (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth),
    y:
      padding.top +
      ((maxY - Math.max(minY, Math.min(maxY, point.score))) / (maxY - minY)) *
        plotHeight,
  }));

  const line = smoothPath(coords);
  const area =
    coords.length > 0
      ? `${line} L ${coords[coords.length - 1].x} ${padding.top + plotHeight} L ${coords[0].x} ${padding.top + plotHeight} Z`
      : "";

  const gridValues = [60, 75, 90];
  const labelEvery = points.length > 7 ? Math.ceil(points.length / 6) : 1;

  if (points.length === 0) {
    return (
      <div
        className="grid place-items-center rounded-2xl border border-dashed border-line bg-white/30"
        style={{ height }}
      >
        <p className="text-[11px] text-muted">Your trend starts with your first room.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Score trend across past interviews"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridValues.map((value) => {
          const y =
            padding.top + ((maxY - value) / (maxY - minY)) * plotHeight;
          return (
            <g key={value}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#DDD7C8"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              <text
                x={padding.left - 10}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill="#8B877D"
                fontFamily="var(--font-manrope), sans-serif"
              >
                {value}
              </text>
            </g>
          );
        })}

        {area && <path d={area} fill={`url(#${gradientId})`} />}
        {line && (
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {coords.map((point, index) => (
          <g key={`${point.date}-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="7"
              fill={color}
              opacity="0.09"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="3.5"
              fill="#FBF9F3"
              stroke={color}
              strokeWidth="2.2"
            >
              <title>{`${point.label}: ${point.score}`}</title>
            </circle>
            {(index % labelEvery === 0 || index === points.length - 1) && (
              <text
                x={point.x}
                y={height - 10}
                textAnchor="middle"
                fontSize="8.5"
                fill="#8B877D"
                fontFamily="var(--font-manrope), sans-serif"
              >
                {formatAxisDate(point.date)}
              </text>
            )}
          </g>
        ))}

        {coords.length === 1 && (
          <text
            x={coords[0].x}
            y={coords[0].y - 13}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={color}
            fontFamily="var(--font-manrope), sans-serif"
          >
            {coords[0].score}
          </text>
        )}
      </svg>
    </div>
  );
}
