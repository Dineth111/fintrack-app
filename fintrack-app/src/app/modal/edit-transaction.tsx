import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateTransaction, useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { useCards } from '../../hooks/useCards';
import { AmountInput } from '../../components/AmountInput';
import { CategoryBadge } from '../../components/CategoryBadge';
import Toast from 'react-native-toast-message';

export default function EditTransactionModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const { data: transactions } = useTransactions();
  const transactionToEdit = transactions?.find(t => t.id === id);

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const { data: categories } = useCategories();
  const { data: cards } = useCards();
  const updateTransactionMutation = useUpdateTransaction();

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type as 'expense' | 'income');
      setAmount(transactionToEdit.amount);
      setCategoryId(transactionToEdit.category_id);
      setSelectedCardId(transactionToEdit.card_id);
      setDescription(transactionToEdit.description || '');
    }
  }, [transactionToEdit]);

  const handleSave = () => {
    if (amount <= 0) {
      Toast.show({ type: 'error', text1: 'Amount must be greater than 0' });
      return;
    }
    if (!categoryId) {
      Toast.show({ type: 'error', text1: 'Please select a category' });
      return;
    }
    if (!id || typeof id !== 'string') {
      Toast.show({ type: 'error', text1: 'Transaction ID is missing' });
      return;
    }

    updateTransactionMutation.mutate({
      id,
      amount,
      type,
      category_id: categoryId,
      card_id: selectedCardId,
      description: description.trim() || undefined,
    }, {
      onSuccess: () => {
        Toast.show({ type: 'success', text1: 'Transaction updated' });
        router.back();
      },
      onError: (error) => {
        Toast.show({ type: 'error', text1: error.message });
      }
    });
  };

  if (!transactionToEdit) {
    return (
      <View className="flex-1 items-center justify-center bg-blue-50 dark:bg-[#0f172a]">
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-blue-50 dark:bg-[#0f172a]"
    >
      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Type Selector */}
        <View className="flex-row bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl mb-6">
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-xl items-center ${type === 'expense' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            onPress={() => setType('expense')}
          >
            <Text className={`font-bold ${type === 'expense' ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-3 rounded-xl items-center ${type === 'income' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            onPress={() => setType('income')}
          >
            <Text className={`font-bold ${type === 'income' ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>Income</Text>
          </TouchableOpacity>
        </View>

        <AmountInput value={amount} onChange={setAmount} type={type} />

        <View className="mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-800 dark:text-white">Category</Text>
            <TouchableOpacity onPress={() => router.push('/modal/categories')}>
              <Text className="text-blue-600 font-medium">Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            {categories?.map(cat => (
              <CategoryBadge 
                key={cat.id} 
                category={cat} 
                isSelected={categoryId === cat.id}
                onPress={() => setCategoryId(cat.id)}
              />
            ))}
          </View>
        </View>

        {/* Payment Method Selector */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-800 dark:text-white">Payment Method</Text>
            {cards && cards.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/modal/add-card')}>
                <Text className="text-blue-600 font-medium">Add Card</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ gap: 8 }}
            className="flex-row"
          >
            <TouchableOpacity
              onPress={() => setSelectedCardId(null)}
              className={`px-4 py-3 rounded-2xl border flex-row items-center ${
                selectedCardId === null
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Text className="text-base mr-2">💵</Text>
              <Text className={`font-semibold text-sm ${
                selectedCardId === null ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
              }`}>
                Cash / Default
              </Text>
            </TouchableOpacity>

            {cards?.map((card) => {
              const isSelected = selectedCardId === card.id;
              return (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => setSelectedCardId(card.id)}
                  className={`px-4 py-3 rounded-2xl border flex-row items-center ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Text className="text-base mr-2">💳</Text>
                  <Text className={`font-semibold text-sm ${
                    isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {card.card_provider} (*{card.card_number_last_4})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="mt-6">
          <Text className="text-lg font-bold text-slate-800 dark:text-white mb-4">Note (Optional)</Text>
          <TextInput
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-800 dark:text-white"
            placeholder="What was this for?"
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <TouchableOpacity 
          className={`w-full bg-blue-600 rounded-3xl p-4 items-center justify-center mt-10 shadow-md ${updateTransactionMutation.isPending ? 'opacity-70' : ''}`}
          onPress={handleSave}
          disabled={updateTransactionMutation.isPending}
          style={{ backgroundColor: '#2563eb' }}
        >
          {updateTransactionMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Update Transaction</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
