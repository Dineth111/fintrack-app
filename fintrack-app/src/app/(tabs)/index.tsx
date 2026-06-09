import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useMonthlySummary } from '../../hooks/useSummary';
import { useTransactions } from '../../hooks/useTransactions';
import { SummaryCard } from '../../components/SummaryCard';
import { TransactionItem } from '../../components/TransactionItem';
import { ChartCard } from '../../components/ChartCard';
import { formatCurrency } from '../../lib/formatCurrency';
import { useSettingsStore } from '../../store/settingsStore';
import { useRouter } from 'expo-router';
import { subDays, format } from 'date-fns';

export default function DashboardScreen() {
  const { profile } = useAuthStore();
  const { currency, monthlyBudget } = useSettingsStore();
  const router = useRouter();
  
  const { data: summary, isLoading: isLoadingSummary } = useMonthlySummary();
  const { data: transactions, isLoading: isLoadingTx } = useTransactions();

  const recentTransactions = transactions?.slice(0, 5) || [];

  // Prepare chart data for the last 7 days
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayTransactions = transactions?.filter(t => t.transaction_date === dateStr && t.type === 'expense') || [];
    const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    return {
      date: format(d, 'EEE'),
      amount: total,
    };
  });

  const expensePercentage = summary && monthlyBudget 
    ? Math.min((summary.expense / monthlyBudget) * 100, 100) 
    : 0;

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900" contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Premium Gradient Header */}
      <View className="px-6 pt-16 pb-8 bg-blue-600 dark:bg-slate-900 rounded-b-[40px] shadow-lg" style={{ backgroundColor: '#1e40af' }}>
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-blue-200 text-xs font-semibold uppercase tracking-wider">Good Morning,</Text>
            <Text className="text-white text-3xl font-extrabold mt-0.5">{profile?.display_name || 'User'}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/settings')}
            className="w-12 h-12 bg-white/10 dark:bg-slate-800 rounded-full items-center justify-center border border-white/20"
          >
            <Text className="text-white text-lg font-bold">
              {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Total Balance Card */}
        <View className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
          <Text className="text-blue-100 font-medium mb-1 text-sm opacity-90">Total Balance</Text>
          <Text 
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            className="text-white text-4xl font-extrabold mb-4"
          >
            {formatCurrency((summary?.income || 0) - (summary?.expense || 0), currency)}
          </Text>
          
          {monthlyBudget && (
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-blue-100 text-xs opacity-90">Monthly Budget</Text>
                <Text 
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="text-white text-xs font-bold"
                >
                  {formatCurrency(summary?.expense || 0, currency)} / {formatCurrency(monthlyBudget, currency)}
                </Text>
              </View>
              <View className="h-2.5 w-full bg-blue-950/40 rounded-full overflow-hidden">
                <View 
                  className={`h-full rounded-full ${expensePercentage > 80 ? 'bg-red-400' : 'bg-emerald-400'}`} 
                  style={{ width: `${expensePercentage}%` }} 
                />
              </View>
            </View>
          )}
        </View>
      </View>

      <View className="px-6 -mt-6">
        <View className="flex-row space-x-4 mb-6">
          <SummaryCard type="income" amount={summary?.income || 0} />
          <View className="w-4" />
          <SummaryCard type="expense" amount={summary?.expense || 0} />
        </View>

        <ChartCard 
          title="Last 7 Days Spending" 
          data={last7DaysData} 
          xKey="date" 
          yKeys={['amount']} 
          type="line" 
          colors={['#3b82f6']}
        />

        <View className="mt-8 mb-4 flex-row justify-between items-center">
          <Text className="text-xl font-bold text-slate-800 dark:text-white">Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <Text className="text-blue-600 font-medium">See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingTx ? (
          <ActivityIndicator color="#3b82f6" />
        ) : recentTransactions.length > 0 ? (
          recentTransactions.map(tx => (
            <TransactionItem key={tx.id} transaction={tx} />
          ))
        ) : (
          <View className="py-8 items-center justify-center">
            <Text className="text-slate-400">No recent transactions</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
