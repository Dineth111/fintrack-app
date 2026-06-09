import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useMonthlySummary } from '../../hooks/useSummary';
import { useTransactions } from '../../hooks/useTransactions';
import { useNotificationStore } from '../../store/notificationStore';
import { TransactionItem } from '../../components/TransactionItem';
import { ChartCard } from '../../components/ChartCard';
import { formatCurrency } from '../../lib/formatCurrency';
import { useSettingsStore } from '../../store/settingsStore';
import { useRouter } from 'expo-router';
import { subDays, format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Bell, Settings as SettingsIcon } from 'lucide-react-native';

export default function DashboardScreen() {
  const { profile } = useAuthStore();
  const { currency, monthlyBudget } = useSettingsStore();
  const router = useRouter();
  
  const { data: summary, isLoading: isLoadingSummary } = useMonthlySummary();
  const { data: transactions, isLoading: isLoadingTx } = useTransactions();

  const recentTransactions = transactions?.slice(0, 5) || [];

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

  const totalBalance = (summary?.income || 0) - (summary?.expense || 0);

  return (
    <ScrollView 
      className="flex-1 bg-blue-50 dark:bg-[#0f172a]" 
      contentContainerStyle={{ paddingBottom: 150 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View className="px-6 pt-16 pb-6">
        <View className="flex-row justify-between items-center mb-8">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-white dark:bg-white/10 rounded-full items-center justify-center border border-slate-200 dark:border-white/20 mr-3 shadow-sm">
              <Text className="text-blue-600 dark:text-white text-lg font-bold">
                {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Good Morning</Text>
              <Text className="text-slate-800 dark:text-white text-xl font-bold">{profile?.display_name || 'User'}</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => router.push('/modal/notifications')}
              className="w-10 h-10 bg-white dark:bg-white/5 rounded-full items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm relative"
            >
              <Bell color="#64748b" size={18} />
              {useNotificationStore().notifications.some(n => !n.read) && (
                <View className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#1e293b]" />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/settings')}
              className="w-10 h-10 bg-white dark:bg-white/5 rounded-full items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm"
            >
              <SettingsIcon color="#64748b" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Balance Card (Premium Blue) */}
        <View 
          className="bg-blue-600 dark:bg-blue-700 rounded-[32px] p-6 mb-6 overflow-hidden relative shadow-lg shadow-blue-500/30"
        >
          <View className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 dark:bg-white/5 rounded-full blur-3xl" />
          <View className="absolute -bottom-16 -left-16 w-32 h-32 bg-blue-400/20 dark:bg-blue-400/10 rounded-full blur-3xl" />
          
          <Text className="text-blue-100 font-medium mb-2 text-sm uppercase tracking-wider">Total Balance</Text>
          <Text 
            numberOfLines={1}
            adjustsFontSizeToFit
            className="text-white text-5xl font-extrabold mb-6 tracking-tight"
          >
            {formatCurrency(totalBalance, currency)}
          </Text>
          
          {monthlyBudget && (
            <View className="bg-white/15 dark:bg-black/20 rounded-2xl p-4 border border-white/10">
              <View className="flex-row justify-between mb-2">
                <Text className="text-blue-100 text-xs font-medium">Monthly Budget</Text>
                <Text className="text-white text-xs font-bold">
                  {formatCurrency(summary?.expense || 0, currency)} / {formatCurrency(monthlyBudget, currency)}
                </Text>
              </View>
              <View className="h-1.5 w-full bg-blue-800/40 rounded-full overflow-hidden">
                <View 
                  className={`h-full rounded-full ${expensePercentage > 80 ? 'bg-rose-500' : 'bg-emerald-400'}`} 
                  style={{ width: `${expensePercentage}%`, transitionProperty: 'width', transitionDuration: '500ms' } as any} 
                />
              </View>
            </View>
          )}
        </View>

        {/* Income / Expense Row */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-white dark:bg-[#1e293b] rounded-3xl p-4 border border-slate-100 dark:border-slate-700/50 relative overflow-hidden shadow-sm">
            <View className="absolute -bottom-4 -right-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
            <View className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/20 rounded-2xl items-center justify-center mb-3">
              <ArrowUpRight color="#10b981" size={20} />
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Income</Text>
            <Text className="text-slate-800 dark:text-white text-xl font-bold" numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(summary?.income || 0, currency)}
            </Text>
          </View>
          
          <View className="flex-1 bg-white dark:bg-[#1e293b] rounded-3xl p-4 border border-slate-100 dark:border-slate-700/50 relative overflow-hidden shadow-sm">
            <View className="absolute -bottom-4 -right-4 w-16 h-16 bg-rose-500/10 rounded-full blur-xl" />
            <View className="w-10 h-10 bg-rose-50 dark:bg-rose-500/20 rounded-2xl items-center justify-center mb-3">
              <ArrowDownRight color="#f43f5e" size={20} />
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Expense</Text>
            <Text className="text-slate-800 dark:text-white text-xl font-bold" numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(summary?.expense || 0, currency)}
            </Text>
          </View>
        </View>

        {/* Chart Section */}
        <View className="mb-6">
          <ChartCard 
            title="Spending Overview" 
            data={last7DaysData} 
            xKey="date" 
            yKeys={['amount']} 
            type="bar" 
            colors={['#3b82f6']}
          />
        </View>

        {/* Recent Transactions */}
        <View className="mb-6 mt-2">
          <View className="flex-row justify-between items-center px-2 mb-4">
            <Text className="text-xl font-bold text-slate-800 dark:text-white">Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')} className="bg-blue-100 dark:bg-slate-800 px-4 py-1.5 rounded-full">
              <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">See All</Text>
            </TouchableOpacity>
          </View>

          {isLoadingTx ? (
            <View className="py-8"><ActivityIndicator color="#3b82f6" /></View>
          ) : recentTransactions.length > 0 ? (
            <View className="gap-y-1">
              {recentTransactions.map((tx) => (
                <TransactionItem 
                  key={tx.id}
                  transaction={tx} 
                  onEdit={(id) => router.push({ pathname: '/modal/edit-transaction', params: { id } })}
                />
              ))}
            </View>
          ) : (
            <View className="py-10 items-center justify-center bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-white dark:border-slate-700">
              <Text className="text-slate-500 font-medium">No recent transactions</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
