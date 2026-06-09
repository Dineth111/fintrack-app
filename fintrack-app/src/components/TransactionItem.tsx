import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../lib/formatCurrency';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { useSettingsStore } from '../store/settingsStore';
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2 } from 'lucide-react-native';

interface TransactionItemProps {
  transaction: {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    description: string | null;
    transaction_date: string;
    categories?: {
      name: string;
      emoji: string | null;
      color: string | null;
    } | null;
  };
  onDelete?: (id: string) => void;
}

const renderRightActions = (onDelete?: () => void) => {
  return (
    <View className="bg-red-500 justify-center items-end px-6 rounded-2xl ml-2 my-1">
      <Trash2 color="white" size={24} />
    </View>
  );
};

export const TransactionItem = ({ transaction, onDelete }: TransactionItemProps) => {
  const { currency } = useSettingsStore();
  const date = new Date(transaction.transaction_date);

  let dateLabel = '';
  if (isToday(date)) {
    dateLabel = 'Today';
  } else if (isYesterday(date)) {
    dateLabel = 'Yesterday';
  } else {
    dateLabel = format(date, 'MMM d, yyyy');
  }

  const isIncome = transaction.type === 'income';

  return (
    <Swipeable
      renderRightActions={() => renderRightActions(() => onDelete?.(transaction.id))}
      onSwipeableRightOpen={() => onDelete?.(transaction.id)}
    >
      <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 my-1 flex-row items-center shadow-sm">
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: `${transaction.categories?.color || '#cbd5e1'}33` }}
        >
          <Text className="text-2xl">{transaction.categories?.emoji || '💰'}</Text>
        </View>

        <View className="flex-1 ml-4">
          <Text className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {transaction.categories?.name || 'Uncategorized'}
          </Text>
          {transaction.description && (
            <Text className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {transaction.description}
            </Text>
          )}
        </View>

        <View className="items-end">
          <Text
            className={`text-base font-bold ${
              isIncome ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
          </Text>
          <Text className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {dateLabel}
          </Text>
        </View>
      </View>
    </Swipeable>
  );
};
