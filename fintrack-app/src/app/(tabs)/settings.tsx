import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { exportTransactionsToCSV } from '../../lib/csvExport';
import { LogOut, Download, CreditCard, PieChart } from 'lucide-react-native';

export default function SettingsScreen() {
  const { profile, signOut } = useAuthStore();
  const { currency, monthlyBudget, setCurrency, setMonthlyBudget } = useSettingsStore();
  
  const [budgetInput, setBudgetInput] = useState(monthlyBudget?.toString() || '');

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      setMonthlyBudget(val);
    } else if (budgetInput === '') {
      setMonthlyBudget(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 pt-16 px-6" contentContainerStyle={{ paddingBottom: 120 }}>
      <Text className="text-3xl font-extrabold text-slate-800 dark:text-white mb-6">Settings</Text>

      {/* Profile Section */}
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm mb-6 flex-row items-center">
        <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full items-center justify-center border-2 border-blue-500 mr-4">
          <Text className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
            {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View>
          <Text className="text-xl font-bold text-slate-800 dark:text-white">
            {profile?.display_name || 'User'}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 mt-1">
            FinTrack Member
          </Text>
        </View>
      </View>

      {/* Preferences Section */}
      <Text className="text-lg font-bold text-slate-800 dark:text-white mb-3 ml-2">Preferences</Text>
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm mb-6 space-y-6">
        
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full items-center justify-center mr-3">
              <CreditCard color="#64748b" size={20} />
            </View>
            <Text className="text-base font-semibold text-slate-700 dark:text-slate-200">Currency</Text>
          </View>
          <View className="flex-row space-x-2">
            {['LKR', 'USD', 'EUR'].map((cur) => (
              <TouchableOpacity
                key={cur}
                onPress={() => setCurrency(cur)}
                className={`px-3 py-1.5 rounded-lg ${currency === cur ? 'bg-blue-600' : 'bg-slate-100 dark:bg-slate-700'}`}
              >
                <Text className={`font-bold ${currency === cur ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {cur}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="border-t border-slate-100 dark:border-slate-700 my-2" />

        <View>
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full items-center justify-center mr-3">
              <PieChart color="#64748b" size={20} />
            </View>
            <Text className="text-base font-semibold text-slate-700 dark:text-slate-200">Monthly Budget</Text>
          </View>
          <View className="flex-row">
            <TextInput
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white mr-2"
              placeholder={`Amount in ${currency}`}
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              value={budgetInput}
              onChangeText={setBudgetInput}
              onBlur={handleSaveBudget}
            />
            <TouchableOpacity 
              onPress={handleSaveBudget}
              className="bg-blue-600 px-4 items-center justify-center rounded-xl"
            >
              <Text className="text-white font-bold">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Data Section */}
      <Text className="text-lg font-bold text-slate-800 dark:text-white mb-3 ml-2">Data Management</Text>
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-sm mb-6">
        <TouchableOpacity 
          className="flex-row items-center p-3"
          onPress={exportTransactionsToCSV}
        >
          <View className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-full items-center justify-center mr-3">
            <Download color="#10b981" size={20} />
          </View>
          <Text className="text-base font-semibold text-slate-700 dark:text-slate-200 flex-1">
            Export to CSV
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity 
        className="bg-red-50 dark:bg-red-900/20 rounded-3xl p-5 flex-row items-center justify-center mb-6"
        onPress={signOut}
      >
        <LogOut color="#ef4444" size={20} className="mr-2" />
        <Text className="text-red-500 font-bold text-lg">Sign Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
