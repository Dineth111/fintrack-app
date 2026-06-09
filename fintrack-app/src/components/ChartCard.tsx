import React from 'react';
import { View, Text } from 'react-native';
import { CartesianChart, Line, Bar, useChartPressState } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';

interface ChartCardProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  type: 'line' | 'bar';
  title: string;
  colors?: string[];
}

export const ChartCard = ({ data, xKey, yKeys, type, title, colors = ['#3b82f6', '#ef4444'] }: ChartCardProps) => {
  const { state } = useChartPressState({ x: 0, y: { [yKeys[0]]: 0 } });
  
  // Note: For a real production app, you'd load a custom font file using require()
  // const font = useFont(require('../../assets/fonts/Inter-Regular.ttf'), 12);
  const font = undefined; // Skia will use default font

  if (!data || data.length === 0) {
    return (
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm mt-4 min-h-[200px] items-center justify-center">
        <Text className="text-slate-500 font-medium">{title}</Text>
        <Text className="text-slate-400 mt-2 text-sm">No data available</Text>
      </View>
    );
  }

  return (
    <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm mt-4">
      <Text className="text-slate-500 font-medium mb-4">{title}</Text>
      
      <View style={{ height: 200 }}>
        <CartesianChart
          data={data}
          xKey={xKey}
          yKeys={yKeys}
          domainPadding={{ left: 20, right: 20, top: 20, bottom: 20 }}
          axisOptions={{
            font,
            tickCount: 5,
            lineColor: '#e2e8f0',
            labelColor: '#94a3b8',
          }}
          chartPressState={state}
        >
          {({ points, chartBounds }) => {
            if (type === 'line') {
              return (
                <>
                  {yKeys.map((key, idx) => (
                    <Line
                      key={key}
                      points={points[key]}
                      color={colors[idx % colors.length]}
                      strokeWidth={3}
                      animate={{ type: 'timing', duration: 500 }}
                    />
                  ))}
                </>
              );
            } else {
              return (
                <>
                  {yKeys.map((key, idx) => (
                    <Bar
                      key={key}
                      points={points[key]}
                      chartBounds={chartBounds}
                      color={colors[idx % colors.length]}
                      roundedCorners={{ topLeft: 4, topRight: 4 }}
                      animate={{ type: 'timing', duration: 500 }}
                    />
                  ))}
                </>
              );
            }
          }}
        </CartesianChart>
      </View>
    </View>
  );
};
