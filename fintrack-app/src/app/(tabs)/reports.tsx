import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useCategoryBreakdown, useMonthlySummary } from '../../hooks/useSummary';
import { formatCurrency } from '../../lib/formatCurrency';
import { useSettingsStore } from '../../store/settingsStore';

// Animated horizontal bar component
const AnimatedBar = ({ percentage, color }: { percentage: number, color: string }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
      <View 
        className="h-full rounded-full" 
        style={{ 
          backgroundColor: color, 
          width: mounted ? `${percentage}%` : '0%',
          transitionProperty: 'width',
          transitionDuration: '1000ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        } as any} 
      />
    </View>
  );
};

export default function ReportsScreen() {
  const { data: breakdown, isLoading } = useCategoryBreakdown();
  const { data: summary } = useMonthlySummary();
  const { currency, monthlyBudget } = useSettingsStore();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-50 dark:bg-[#0f172a]">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const totalExpense = breakdown?.reduce((sum, item) => sum + item.total, 0) || 0;
  const budgetUsedPct = monthlyBudget ? Math.min((totalExpense / monthlyBudget) * 100, 100) : 0;

  return (
    <ScrollView 
      className="flex-1 bg-blue-50 dark:bg-[#0f172a]" 
      contentContainerStyle={{ paddingBottom: 150, paddingTop: 60 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 mb-8">
        <Text className="text-3xl font-extrabold text-slate-800 dark:text-white">Analysis</Text>
        <Text className="text-slate-500 mt-1 font-medium">Real-time spending insights</Text>
      </View>

      {/* Real-time Budget Analysis Card */}
      <View className="px-6 mb-8">
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 relative overflow-hidden">
          
          <Text className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2 text-xs">
            Monthly Budget Usage
          </Text>
          
          <View className="flex-row items-end mb-4">
            <Text className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              {Math.round(budgetUsedPct)}%
            </Text>
            <Text className="text-slate-500 ml-2 mb-1.5 font-medium">Used</Text>
          </View>
          
          <AnimatedBar percentage={budgetUsedPct} color={budgetUsedPct > 80 ? '#f43f5e' : '#3b82f6'} />
          
          <View className="flex-row justify-between mt-3">
            <Text className="text-slate-500 text-xs font-medium">Spent: {formatCurrency(totalExpense, currency)}</Text>
            <Text className="text-slate-500 text-xs font-medium">Budget: {formatCurrency(monthlyBudget || 0, currency)}</Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown */}
      <View className="px-6">
        <Text className="text-xl font-bold text-slate-800 dark:text-white mb-4">Category Breakdown</Text>
        
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50">
          {breakdown?.length ? (
            <View className="mb-6 items-center border-b border-slate-100 dark:border-slate-700/50 pb-6">
              <PieChart
                data={breakdown.map(item => ({
                  name: item.name,
                  population: item.total,
                  color: item.color || '#3b82f6',
                  legendFontColor: '#64748b',
                  legendFontSize: 12
                }))}
                width={Dimensions.get('window').width - 80}
                height={180}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"0"}
                center={[10, 0]}
                absolute
              />
            </View>
          ) : null}

          {breakdown?.length ? breakdown.map((item, index) => {
            const percentage = totalExpense > 0 ? (item.total / totalExpense) * 100 : 0;
            return (
              <View key={item.name} className={`${index < breakdown.length - 1 ? 'border-b border-slate-100 dark:border-slate-700/50 pb-5 mb-5' : ''}`}>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View 
                      className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Text className="text-2xl">{item.emoji}</Text>
                    </View>
                    <View>
                      <Text className="text-base font-bold text-slate-800 dark:text-slate-100">
                        {item.name}
                      </Text>
                      <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {Math.round(percentage)}% of total
                      </Text>
                    </View>
                  </View>
                  <Text className="text-base font-extrabold text-slate-800 dark:text-white">
                    {formatCurrency(item.total, currency)}
                  </Text>
                </View>
                
                <AnimatedBar percentage={percentage} color={item.color || '#3b82f6'} />
              </View>
            );
          }) : (
            <View className="py-8 items-center justify-center">
              <Text className="text-slate-400 font-medium">No spending data yet</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
