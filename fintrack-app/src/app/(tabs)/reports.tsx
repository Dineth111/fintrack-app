import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useCategoryBreakdown } from '../../hooks/useSummary';
import { ChartCard } from '../../components/ChartCard';
import { formatCurrency } from '../../lib/formatCurrency';
import { useSettingsStore } from '../../store/settingsStore';

export default function ReportsScreen() {
  const { data: breakdown, isLoading } = useCategoryBreakdown();
  const { currency } = useSettingsStore();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const totalExpense = breakdown?.reduce((sum, item) => sum + item.total, 0) || 0;

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 pt-16 px-6" contentContainerStyle={{ paddingBottom: 120 }}>
      <Text className="text-3xl font-extrabold text-slate-800 dark:text-white mb-6">Reports</Text>

      <ChartCard 
        title="Spending by Category" 
        data={breakdown || []} 
        xKey="name" 
        yKeys={['total']} 
        type="bar" 
        colors={breakdown?.map(b => b.color) || []}
      />

      <View className="mt-8">
        <Text className="text-xl font-bold text-slate-800 dark:text-white mb-4">Top Expenses</Text>
        
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm">
          {breakdown?.length ? breakdown.map((item, index) => {
            const percentage = totalExpense > 0 ? (item.total / totalExpense) * 100 : 0;
            return (
              <View key={item.name} className={`${index < breakdown.length - 1 ? 'border-b border-slate-100 dark:border-slate-700 pb-4 mb-4' : ''}`}>
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${item.color}33` }}
                    >
                      <Text className="text-lg">{item.emoji}</Text>
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-slate-800 dark:text-slate-100">
                        {item.name}
                      </Text>
                      <Text className="text-xs text-slate-400 dark:text-slate-500">
                        {Math.round(percentage)}% of expenses
                      </Text>
                    </View>
                  </View>
                  <Text className="text-base font-bold text-slate-800 dark:text-white">
                    {formatCurrency(item.total, currency)}
                  </Text>
                </View>
                {/* Horizontal Share Indicator */}
                <View style={{ paddingLeft: 52 }}>
                  <View className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <View 
                      className="h-full rounded-full" 
                      style={{ backgroundColor: item.color || '#3b82f6', width: `${percentage}%` }} 
                    />
                  </View>
                </View>
              </View>
            );
          }) : (
            <Text className="text-slate-400 text-center py-4">No data for this month</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
