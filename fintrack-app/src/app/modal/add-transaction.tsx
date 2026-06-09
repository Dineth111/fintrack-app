import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAddTransaction } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { AmountInput } from '../../components/AmountInput';
import { CategoryBadge } from '../../components/CategoryBadge';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';

export default function AddTransactionModal() {
  const router = useRouter();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  
  // Minimal date handling for native without extra packages: just use today
  // In a full app, you'd add @react-native-community/datetimepicker here.
  const [date] = useState(new Date());

  const { data: categories } = useCategories();
  const addTransactionMutation = useAddTransaction();

  const handleSave = () => {
    if (amount <= 0) {
      Toast.show({ type: 'error', text1: 'Amount must be greater than 0' });
      return;
    }
    if (!categoryId) {
      Toast.show({ type: 'error', text1: 'Please select a category' });
      return;
    }

    addTransactionMutation.mutate({
      amount,
      type,
      category_id: categoryId,
      description: description.trim() || undefined,
      transaction_date: format(date, 'yyyy-MM-dd'),
    }, {
      onSuccess: () => {
        Toast.show({ type: 'success', text1: 'Transaction added' });
        router.back();
      },
      onError: (error) => {
        Toast.show({ type: 'error', text1: error.message });
      }
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
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
          className={`w-full bg-blue-600 rounded-3xl p-4 items-center justify-center mt-10 shadow-md ${addTransactionMutation.isPending ? 'opacity-70' : ''}`}
          onPress={handleSave}
          disabled={addTransactionMutation.isPending}
          style={{ backgroundColor: '#2563eb' }}
        >
          {addTransactionMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Save Transaction</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
