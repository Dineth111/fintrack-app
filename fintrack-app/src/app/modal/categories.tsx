import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useCategories, useAddCategory, useDeleteCategory } from '../../hooks/useCategories';
import { Trash2, Plus } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function CategoriesModal() {
  const { data: categories, isLoading } = useCategories();
  const addCategoryMutation = useAddCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [color, setColor] = useState('#3b82f6');

  const handleAdd = () => {
    if (!name.trim()) return;

    addCategoryMutation.mutate({ name: name.trim(), emoji, color }, {
      onSuccess: () => {
        setName('');
        Toast.show({ type: 'success', text1: 'Category added' });
      },
      onError: (error) => {
        Toast.show({ type: 'error', text1: error.message });
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteCategoryMutation.mutate(id, {
      onSuccess: () => Toast.show({ type: 'success', text1: 'Category deleted' }),
      onError: (error) => Toast.show({ type: 'error', text1: error.message })
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-blue-50 dark:bg-[#0f172a]"
    >
      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
        
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm mb-8">
          <Text className="text-lg font-bold text-slate-800 dark:text-white mb-4">Add Custom Category</Text>
          
          <View className="flex-row space-x-3 mb-4">
            <View className="flex-1">
              <Text className="text-sm text-slate-500 mb-1 ml-1">Name</Text>
              <TextInput
                className="bg-blue-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white"
                placeholder="e.g. Subscriptions"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View className="w-16">
              <Text className="text-sm text-slate-500 mb-1 ml-1">Emoji</Text>
              <TextInput
                className="bg-blue-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center text-slate-800 dark:text-white"
                value={emoji}
                onChangeText={setEmoji}
                maxLength={2}
              />
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row space-x-2">
              {['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
                <TouchableOpacity 
                  key={c}
                  onPress={() => setColor(c)}
                  className={`w-6 h-6 rounded-full ${color === c ? 'border-2 border-slate-800 dark:border-white' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </View>
            
            <TouchableOpacity 
              onPress={handleAdd}
              disabled={addCategoryMutation.isPending || !name.trim()}
              className={`bg-blue-600 w-10 h-10 rounded-full items-center justify-center ${(!name.trim() || addCategoryMutation.isPending) ? 'opacity-50' : ''}`}
            >
              {addCategoryMutation.isPending ? <ActivityIndicator color="white" size="small" /> : <Plus color="white" size={20} />}
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-xl font-bold text-slate-800 dark:text-white mb-4">Your Categories</Text>
        
        {isLoading ? (
          <ActivityIndicator color="#3b82f6" />
        ) : (
          <View className="space-y-3">
            {categories?.map(cat => (
              <View key={cat.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center">
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${cat.color || '#cbd5e1'}33` }}
                  >
                    <Text>{cat.emoji}</Text>
                  </View>
                  <Text className="text-base font-semibold text-slate-800 dark:text-white">{cat.name}</Text>
                  {cat.is_default && (
                    <View className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded ml-2">
                      <Text className="text-xs text-slate-500 dark:text-slate-400">Default</Text>
                    </View>
                  )}
                </View>
                
                {!cat.is_default && (
                  <TouchableOpacity onPress={() => handleDelete(cat.id)} disabled={deleteCategoryMutation.isPending}>
                    <Trash2 color="#ef4444" size={20} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
