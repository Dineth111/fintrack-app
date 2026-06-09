import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
    payment_cards?: {
      card_provider: string;
      card_number_last_4: string;
      color: string;
    } | null;
  };
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const renderRightActions = (onDelete?: () => void) => {
  return (
    <View className="bg-red-500 justify-center items-end px-6 rounded-2xl ml-2 my-1">
      <Trash2 color="white" size={24} />
    </View>
  );
};

export const TransactionItem = ({ transaction, onDelete, onEdit }: TransactionItemProps) => {
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
      <TouchableOpacity 
        activeOpacity={onEdit ? 0.7 : 1}
        onPress={() => onEdit?.(transaction.id)}
        className="bg-white dark:bg-slate-800 rounded-2xl p-4 my-1 flex-row items-center shadow-sm border border-slate-100 dark:border-slate-700/50"
      >
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: `${transaction.categories?.color || '#cbd5e1'}33` }}
        >
          <Text className="text-2xl">{transaction.categories?.emoji || '💰'}</Text>
        </View>

        <View className="flex-1 ml-4 justify-center">
          <View className="flex-row items-center flex-wrap">
            <Text className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {transaction.categories?.name || 'Uncategorized'}
            </Text>
            {transaction.payment_cards && (
              <View className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded ml-2">
                <Text className="text-[9px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider">
                  💳 {transaction.payment_cards.card_provider} (*{transaction.payment_cards.card_number_last_4})
                </Text>
              </View>
            )}
          </View>
          {transaction.description && (
            <Text className="text-sm text-slate-500 dark:text-slate-400 mt-0.5" numberOfLines={1}>
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
      </TouchableOpacity>
    </Swipeable>
  );
};
