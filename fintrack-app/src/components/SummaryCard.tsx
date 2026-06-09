import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '../lib/formatCurrency';
import { useSettingsStore } from '../store/settingsStore';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react-native';

interface SummaryCardProps {
  type: 'income' | 'expense' | 'balance';
  amount: number;
}

export const SummaryCard = ({ type, amount }: SummaryCardProps) => {
  const { currency } = useSettingsStore();

  const isIncome = type === 'income';
  const isBalance = type === 'balance';
  
  let bgColor = 'bg-slate-800 dark:bg-slate-900';
  let iconBgColor = 'bg-slate-700 dark:bg-slate-800';
  let Icon = Wallet;
  let iconColor = '#cbd5e1';
  let label = 'Balance';

  if (isIncome) {
    bgColor = 'bg-emerald-500';
    iconBgColor = 'bg-emerald-600';
    Icon = ArrowUpRight;
    iconColor = 'white';
    label = 'Income';
  } else if (!isBalance) {
    bgColor = 'bg-white dark:bg-slate-800';
    iconBgColor = 'bg-red-50 dark:bg-slate-700';
    Icon = ArrowDownRight;
    iconColor = '#ef4444';
    label = 'Expense';
  }

  return (
    <View className={`flex-1 rounded-3xl p-5 shadow-sm ${bgColor}`}>
      <View className="flex-row items-center justify-between mb-4">
        <View className={`w-10 h-10 rounded-full items-center justify-center ${iconBgColor}`}>
          <Icon color={iconColor} size={20} />
        </View>
      </View>
      <Text className={`text-sm font-medium mb-1 ${isIncome || isBalance ? 'text-slate-300' : 'text-slate-500'}`}>
        {label}
      </Text>
      <Text className={`text-2xl font-bold ${isIncome || isBalance ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
        {formatCurrency(amount, currency)}
      </Text>
    </View>
  );
};
