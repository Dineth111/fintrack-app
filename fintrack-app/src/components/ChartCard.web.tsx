import React from 'react';
import { View, Text } from 'react-native';

interface ChartCardProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  type: 'line' | 'bar';
  title: string;
  colors?: string[];
}

export const ChartCard = ({ data, xKey, yKeys, type, title, colors = ['#3b82f6', '#ef4444'] }: ChartCardProps) => {
  if (!data || data.length === 0) {
    return (
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm mt-4 min-h-[200px] items-center justify-center">
        <Text className="text-slate-500 font-medium">{title}</Text>
        <Text className="text-slate-400 mt-2 text-sm">No data available</Text>
      </View>
    );
  }

  // Dimensions
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find Min & Max
  const allValues = data.flatMap(item => yKeys.map(key => Number(item[key] || 0)));
  const maxValue = Math.max(...allValues, 100); // default max to 100 if all values are low
  const minValue = 0; // standard finance chart baseline

  const valueRange = maxValue - minValue;

  // Map data to coordinates
  const getCoordinates = (yKey: string) => {
    return data.map((item, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
      const val = Number(item[yKey] || 0);
      // Invert Y coordinate since SVG (0,0) is top-left
      const y = paddingTop + chartHeight - ((val - minValue) / valueRange) * chartHeight;
      return { x, y };
    });
  };

  // Generate SVG Path for Line
  const getLinePath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    return coords.reduce((acc, coord, idx) => {
      return idx === 0 ? `M ${coord.x} ${coord.y}` : `${acc} L ${coord.x} ${coord.y}`;
    }, '');
  };

  // Generate Area Path (for gradient underneath the line)
  const getAreaPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    const linePath = getLinePath(coords);
    const firstX = coords[0].x;
    const lastX = coords[coords.length - 1].x;
    const baseY = paddingTop + chartHeight;
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  // Format values shorthand (e.g. $10K, $2.5M)
  const formatValueShorthand = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${Math.round(val)}`;
  };

  // Grid Lines
  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount }).map((_, idx) => {
    const yVal = minValue + (idx / (gridCount - 1)) * valueRange;
    const y = paddingTop + chartHeight - (idx / (gridCount - 1)) * chartHeight;
    return { y, value: yVal };
  });

  return (
    <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm mt-4">
      <Text className="text-slate-500 font-medium mb-4">{title}</Text>
      
      {/* SVG Container */}
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <defs>
            {/* Color Gradients */}
            {colors.map((color, idx) => (
              <linearGradient key={`grad-${idx}`} id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid Lines */}
          {gridLines.map((line, idx) => (
            <g key={`grid-${idx}`}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={width - paddingRight}
                y2={line.y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity={0.5}
              />
              <text
                x={paddingLeft - 8}
                y={line.y + 4}
                fill="#94a3b8"
                fontSize="9"
                textAnchor="end"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {formatValueShorthand(line.value)}
              </text>
            </g>
          ))}

          {/* Render Lines / Areas */}
          {type === 'line' &&
            yKeys.map((key, idx) => {
              const coords = getCoordinates(key);
              return (
                <g key={`series-${key}`}>
                  {/* Area fill under the line */}
                  <path
                    d={getAreaPath(coords)}
                    fill={`url(#gradient-${idx})`}
                  />
                  {/* Main Line */}
                  <path
                    d={getLinePath(coords)}
                    fill="none"
                    stroke={colors[idx % colors.length]}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Dots for points */}
                  {coords.map((point, pIdx) => (
                    <circle
                      key={`dot-${key}-${pIdx}`}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={colors[idx % colors.length]}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  ))}
                </g>
              );
            })}

          {/* Render Bars */}
          {type === 'bar' &&
            yKeys.map((key, idx) => {
              const coords = getCoordinates(key);
              const barWidth = Math.max(5, (chartWidth / data.length) * 0.4);
              return (
                <g key={`series-bar-${key}`}>
                  {coords.map((point, pIdx) => {
                    const barHeight = paddingTop + chartHeight - point.y;
                    const xOffset = type === 'bar' && yKeys.length > 1 
                      ? (idx - (yKeys.length - 1) / 2) * (barWidth + 2)
                      : 0;
                    return (
                      <rect
                        key={`bar-${key}-${pIdx}`}
                        x={point.x - barWidth / 2 + xOffset}
                        y={point.y}
                        width={barWidth}
                        height={Math.max(2, barHeight)}
                        fill={colors[idx % colors.length]}
                        rx="3"
                      />
                    );
                  })}
                </g>
              );
            })}

          {/* X Axis Labels */}
          {data.map((item, index) => {
            const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
            return (
              <text
                key={`label-${index}`}
                x={x}
                y={height - 10}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="middle"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {item[xKey]}
              </text>
            );
          })}
        </svg>
      </div>
    </View>
  );
};
