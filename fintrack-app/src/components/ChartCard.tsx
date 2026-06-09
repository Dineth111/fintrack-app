import React, { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';

interface ChartCardProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  type: 'line' | 'bar';
  title: string;
  colors?: string[];
}

export const ChartCard = ({ data, xKey, yKeys, type, title, colors = ['#3b82f6', '#ef4444'] }: ChartCardProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Simple mount animation delay
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!data || data.length === 0) {
    return (
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm mt-4 min-h-[200px] items-center justify-center border border-slate-100 dark:border-slate-700/50">
        <Text className="text-slate-500 font-medium">{title}</Text>
        <Text className="text-slate-400 mt-2 text-sm">No data available</Text>
      </View>
    );
  }

  // Find max value to calculate heights
  const maxValue = Math.max(...data.map(d => {
    return Math.max(...yKeys.map(k => Number(d[k]) || 0));
  }), 1); // fallback to 1 to avoid division by zero

  const primaryColor = colors[0];

  return (
    <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm mt-4 border border-slate-100 dark:border-slate-700/50">
      <Text className="text-slate-700 dark:text-slate-300 font-bold mb-6 text-base">{title}</Text>
      
      <View className="flex-row items-end justify-between h-40">
        {data.map((item, index) => {
          const val = Number(item[yKeys[0]]) || 0;
          const heightPercentage = (val / maxValue) * 100;
          
          return (
            <View key={index} className="items-center flex-1">
              {/* Tooltip/Value (only show if height > 0 to keep it clean, or always show for top value) */}
              <View className="w-full flex-row justify-center items-end h-full pb-2">
                <View 
                  className="w-full max-w-[12px] md:max-w-[16px] rounded-t-md opacity-80"
                  style={{
                    backgroundColor: primaryColor,
                    height: mounted ? `${heightPercentage}%` : '0%',
                    transitionProperty: 'height',
                    transitionDuration: '700ms',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  } as any}
                />
              </View>
              {/* X Axis Label */}
              <Text 
                className="text-[10px] text-slate-400 font-medium uppercase mt-2"
                numberOfLines={1}
              >
                {item[xKey]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
