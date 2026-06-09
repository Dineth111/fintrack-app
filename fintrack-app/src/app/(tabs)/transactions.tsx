import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTransactions, useDeleteTransaction } from '../../hooks/useTransactions';
import { TransactionItem } from '../../components/TransactionItem';
import { Search, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function TransactionsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const { data: transactions, isLoading } = useTransactions({
    searchQuery: searchQuery || undefined,
    type: filterType !== 'all' ? filterType : undefined,
  });

  const deleteTxMutation = useDeleteTransaction();

  const handleDelete = (id: string) => {
    deleteTxMutation.mutate(id);
  };

  const FilterButton = ({ type, label }: { type: 'all' | 'income' | 'expense', label: string }) => (
    <TouchableOpacity
      onPress={() => setFilterType(type)}
      className={`px-4 py-2 rounded-full mr-2 ${
        filterType === type 
          ? 'bg-blue-600' 
          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
      }`}
    >
      <Text className={`font-medium ${
        filterType === type ? 'text-white' : 'text-slate-600 dark:text-slate-300'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-blue-50 dark:bg-[#0f172a] pt-16 px-6">
      <Text className="text-3xl font-extrabold text-slate-800 dark:text-white mb-6">Transactions</Text>

      <View className="flex-row items-center bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 mb-4 shadow-sm">
        <Search color="#94a3b8" size={20} />
        <TextInput
          className="flex-1 ml-3 text-base text-slate-800 dark:text-white"
          placeholder="Search descriptions..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Filter color="#94a3b8" size={20} />
      </View>

      <View className="flex-row mb-6">
        <FilterButton type="all" label="All" />
        <FilterButton type="income" label="Income" />
        <FilterButton type="expense" label="Expense" />
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem 
              transaction={item} 
              onDelete={handleDelete} 
              onEdit={(id) => router.push({ pathname: '/modal/edit-transaction', params: { id } })}
            />
          )}
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Text className="text-slate-400 text-lg">No transactions found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
