import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAddCard } from '../../hooks/useCards';
import { CardMockup } from '../../components/CardMockup';
import Toast from 'react-native-toast-message';

export default function AddCardModal() {
  const router = useRouter();
  const addCardMutation = useAddCard();

  const [cardHolderName, setCardHolderName] = useState('');
  const [cardProvider, setCardProvider] = useState('Visa');
  const [cardNumberLast4, setCardNumberLast4] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [color, setColor] = useState('blue');

  const providers = ['Visa', 'Mastercard', 'Amex', 'Discover'];
  const colors = [
    { name: 'blue', label: 'Deep Blue', code: '#2563eb' },
    { name: 'emerald', label: 'Emerald', code: '#10b981' },
    { name: 'purple', label: 'Royal Violet', code: '#8b5cf6' },
    { name: 'rose', label: 'Rose Red', code: '#f43f5e' },
    { name: 'amber', label: 'Amber Gold', code: '#f59e0b' },
    { name: 'slate', label: 'Dark Slate', code: '#475569' },
  ];

  const handleExpiryChange = (text: string) => {
    // Keep only numbers
    const cleanText = text.replace(/[^0-9]/g, '');
    if (cleanText.length <= 2) {
      setExpiryDate(cleanText);
    } else {
      setExpiryDate(`${cleanText.slice(0, 2)}/${cleanText.slice(2, 4)}`);
    }
  };

  const handleLast4Change = (text: string) => {
    // Keep only numbers and max 4 digits
    const cleanText = text.replace(/[^0-9]/g, '');
    setCardNumberLast4(cleanText.slice(0, 4));
  };

  const handleSave = () => {
    if (!cardHolderName.trim()) {
      Toast.show({ type: 'error', text1: 'Cardholder name is required' });
      return;
    }
    if (cardNumberLast4.length !== 4) {
      Toast.show({ type: 'error', text1: 'Last 4 digits must be exactly 4 digits' });
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      Toast.show({ type: 'error', text1: 'Expiry date must be in MM/YY format' });
      return;
    }

    // Validate month
    const month = parseInt(expiryDate.split('/')[0], 10);
    if (month < 1 || month > 12) {
      Toast.show({ type: 'error', text1: 'Invalid expiry month' });
      return;
    }

    addCardMutation.mutate(
      {
        card_holder_name: cardHolderName.trim(),
        card_provider: cardProvider,
        card_number_last_4: cardNumberLast4,
        expiry_date: expiryDate,
        color,
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Card added successfully' });
          router.back();
        },
        onError: (error) => {
          Toast.show({ type: 'error', text1: error.message });
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-blue-50 dark:bg-[#0f172a]"
    >
      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Real-time Card Preview */}
        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Card Preview</Text>
        <View className="mb-8 items-center">
          <CardMockup
            cardHolderName={cardHolderName.trim() || 'Your Name'}
            cardProvider={cardProvider}
            cardNumberLast4={cardNumberLast4.padEnd(4, '•')}
            expiryDate={expiryDate || 'MM/YY'}
            color={color}
          />
        </View>

        {/* Card Form */}
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm mb-6 space-y-4">
          
          {/* Cardholder Name */}
          <View>
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Cardholder Name</Text>
            <TextInput
              className="bg-blue-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white font-medium"
              placeholder="e.g. John Doe"
              placeholderTextColor="#94a3b8"
              value={cardHolderName}
              onChangeText={setCardHolderName}
              autoCapitalize="characters"
            />
          </View>

          {/* Row of Last 4 Digits & Expiry Date */}
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Last 4 Digits</Text>
              <TextInput
                className="bg-blue-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white font-medium"
                placeholder="4321"
                placeholderTextColor="#94a3b8"
                value={cardNumberLast4}
                onChangeText={handleLast4Change}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Expiry Date</Text>
              <TextInput
                className="bg-blue-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white font-medium"
                placeholder="MM/YY"
                placeholderTextColor="#94a3b8"
                value={expiryDate}
                onChangeText={handleExpiryChange}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>

          {/* Card Provider */}
          <View>
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Card Provider</Text>
            <View className="flex-row flex-wrap gap-2">
              {providers.map((prov) => {
                const isSelected = cardProvider === prov;
                return (
                  <TouchableOpacity
                    key={prov}
                    onPress={() => setCardProvider(prov)}
                    className={`px-4 py-2.5 rounded-xl border ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500'
                        : 'bg-blue-50 dark:bg-[#0f172a] border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Text
                      className={`font-semibold text-xs ${
                        isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {prov}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Card Gradient Color */}
          <View>
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2.5">Card Theme</Text>
            <View className="flex-row flex-wrap gap-2">
              {colors.map((c) => {
                const isSelected = color === c.name;
                return (
                  <TouchableOpacity
                    key={c.name}
                    onPress={() => setColor(c.name)}
                    className={`p-1 rounded-full border-2 ${
                      isSelected ? 'border-slate-800 dark:border-white' : 'border-transparent'
                    }`}
                  >
                    <View
                      className="w-7 h-7 rounded-full"
                      style={{ backgroundColor: c.code }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </View>

        {/* Save Button */}
        <TouchableOpacity
          className={`w-full bg-blue-600 rounded-3xl p-4 items-center justify-center shadow-md ${
            addCardMutation.isPending ? 'opacity-70' : ''
          }`}
          onPress={handleSave}
          disabled={addCardMutation.isPending}
          style={{ backgroundColor: '#2563eb' }}
        >
          {addCardMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Save Card</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
