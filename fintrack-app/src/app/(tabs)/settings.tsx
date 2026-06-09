import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useCards, useDeleteCard } from '../../hooks/useCards';
import { exportTransactionsToCSV } from '../../lib/csvExport';
import { LogOut, Download, CreditCard, PieChart, Edit2, Check, X, User, Plus } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { CardMockup } from '../../components/CardMockup';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, signOut, updateDisplayName } = useAuthStore();
  const { currency, monthlyBudget, setCurrency, setMonthlyBudget } = useSettingsStore();
  
  const { data: cards, isLoading: isCardsLoading } = useCards();
  const deleteCardMutation = useDeleteCard();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.display_name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget?.toString() || '');

  useEffect(() => {
    if (profile?.display_name) {
      setNameInput(profile.display_name);
    }
  }, [profile]);

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      Toast.show({ type: 'error', text1: 'Name cannot be empty' });
      return;
    }
    setIsSavingName(true);
    try {
      await updateDisplayName(nameInput.trim());
      setIsEditingName(false);
      Toast.show({ type: 'success', text1: 'Profile updated' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Failed to update name' });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      setMonthlyBudget(val);
      Toast.show({ type: 'success', text1: 'Budget updated successfully' });
    } else if (budgetInput === '') {
      setMonthlyBudget(null);
      Toast.show({ type: 'success', text1: 'Budget cleared' });
    } else {
      Toast.show({ type: 'error', text1: 'Please enter a valid budget' });
    }
  };

  const handleDeleteCard = (id: string) => {
    deleteCardMutation.mutate(id, {
      onSuccess: () => {
        Toast.show({ type: 'success', text1: 'Card deleted' });
      },
      onError: (error) => {
        Toast.show({ type: 'error', text1: error.message });
      }
    });
  };

  return (
    <ScrollView className="flex-1 bg-blue-50 dark:bg-[#0f172a] pt-16 px-6" contentContainerStyle={{ paddingBottom: 150 }}>
      <Text className="text-3xl font-extrabold text-slate-800 dark:text-white mb-6">Settings</Text>

      {/* Premium Profile Section */}
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6">
        <View className="flex-row items-center mb-4">
          <View className="w-16 h-16 bg-blue-50 dark:bg-slate-700 rounded-full items-center justify-center border border-blue-100 dark:border-slate-600 mr-4 shadow-sm">
            <User color="#2563eb" size={32} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-xl font-bold text-slate-800 dark:text-white mr-2">
                {profile?.display_name || 'User'}
              </Text>
              <TouchableOpacity onPress={() => router.push('/modal/edit-profile')} className="bg-slate-100 dark:bg-[#0f172a] p-1.5 rounded-full border border-slate-200 dark:border-slate-800">
                <Edit2 color="#64748b" size={14} />
              </TouchableOpacity>
            </View>
            <Text className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">
              FinTrack Member
            </Text>
          </View>
        </View>
      </View>

      {/* Cards Section */}
      <View className="flex-row justify-between items-center mb-3 ml-2">
        <Text className="text-lg font-bold text-slate-800 dark:text-white">My Cards</Text>
        <TouchableOpacity 
          onPress={() => router.push('/modal/add-card')}
          className="flex-row items-center"
        >
          <Plus color="#2563eb" size={16} style={{ marginRight: 4 }} />
          <Text className="text-sm font-bold text-blue-600">Add Card</Text>
        </TouchableOpacity>
      </View>

      {/* Cards List Horizontal Scroll */}
      <View className="mb-6">
        {isCardsLoading ? (
          <ActivityIndicator color="#3b82f6" />
        ) : cards && cards.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingRight: 24, gap: 16 }}
            className="flex-row"
          >
            {cards.map(card => (
              <View key={card.id} className="w-80">
                <CardMockup
                  cardHolderName={card.card_holder_name}
                  cardProvider={card.card_provider}
                  cardNumberLast4={card.card_number_last_4}
                  expiryDate={card.expiry_date}
                  color={card.color}
                  onEdit={() => router.push({ pathname: '/modal/edit-card', params: { id: card.id } })}
                  onDelete={() => handleDeleteCard(card.id)}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <TouchableOpacity 
            onPress={() => router.push('/modal/add-card')}
            className="w-full aspect-[1.586] rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 items-center justify-center bg-white dark:bg-slate-800 p-6 shadow-sm active:opacity-75"
          >
            <View className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/30 items-center justify-center mb-3">
              <CreditCard color="#2563eb" size={24} />
            </View>
            <Text className="text-base font-bold text-slate-700 dark:text-white">Add a payment card</Text>
            <Text className="text-sm text-slate-400 text-center mt-1">
              Securely link your cards to track expenses
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Preferences Section */}
      <Text className="text-lg font-bold text-slate-800 dark:text-white mb-3 ml-2">Preferences</Text>
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6 space-y-6">
        
        {/* Currency Segment Control */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-50 dark:bg-slate-700 rounded-full items-center justify-center mr-3 border border-slate-100 dark:border-slate-600">
              <CreditCard color="#3b82f6" size={18} />
            </View>
            <Text className="text-base font-semibold text-slate-700 dark:text-slate-200">Currency</Text>
          </View>
          <View className="flex-row bg-slate-100 dark:bg-[#0f172a] p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
            {['LKR', 'USD', 'EUR'].map((cur) => (
              <TouchableOpacity
                key={cur}
                onPress={() => {
                  setCurrency(cur);
                  Toast.show({ type: 'success', text1: `Currency switched to ${cur}` });
                }}
                className={`px-3.5 py-1.5 rounded-lg ${currency === cur ? 'bg-blue-600 shadow-sm' : 'bg-transparent'}`}
              >
                <Text className={`font-bold text-xs ${currency === cur ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {cur}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="border-t border-slate-100 dark:border-slate-700/50 my-2" />

        {/* Monthly Budget Card */}
        <View>
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 bg-blue-50 dark:bg-slate-700 rounded-full items-center justify-center mr-3 border border-slate-100 dark:border-slate-600">
              <PieChart color="#3b82f6" size={18} />
            </View>
            <Text className="text-base font-semibold text-slate-700 dark:text-slate-200">Monthly Budget</Text>
          </View>
          <View className="flex-row bg-blue-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-2 items-center">
            <TextInput
              className="flex-1 px-3 py-2.5 text-base text-slate-800 dark:text-white"
              placeholder={`Amount in ${currency}`}
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              value={budgetInput}
              onChangeText={setBudgetInput}
              style={Platform.OS === 'web' ? { outlineWidth: 0 } : undefined}
            />
            <TouchableOpacity 
              onPress={handleSaveBudget}
              className="bg-blue-600 px-5 py-2.5 items-center justify-center rounded-xl shadow-sm active:bg-blue-700"
            >
              <Text className="text-white font-bold text-xs">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Data Section */}
      <Text className="text-lg font-bold text-slate-800 dark:text-white mb-3 ml-2">Data Management</Text>
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-3 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6">
        <TouchableOpacity 
          className="flex-row items-center p-3 active:opacity-75"
          onPress={exportTransactionsToCSV}
        >
          <View className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-full items-center justify-center mr-3 border border-emerald-100/30">
            <Download color="#10b981" size={18} />
          </View>
          <Text className="text-base font-semibold text-slate-700 dark:text-slate-200 flex-1">
            Export to CSV
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity 
        className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl p-5 flex-row items-center justify-center mb-6 active:opacity-75"
        onPress={signOut}
      >
        <LogOut color="#ef4444" size={18} style={{ marginRight: 8 }} />
        <Text className="text-red-500 font-bold text-base">Sign Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
