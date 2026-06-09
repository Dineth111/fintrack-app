import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCards, useUpdateCard } from '../../hooks/useCards';
import { CardMockup } from '../../components/CardMockup';
import Toast from 'react-native-toast-message';

export default function EditCardModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { data: cards, isLoading } = useCards();
  const updateCardMutation = useUpdateCard();

  const [cardHolderName, setCardHolderName] = useState('');
  const [cardProvider, setCardProvider] = useState('Visa');
  const [cardNumberLast4, setCardNumberLast4] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [color, setColor] = useState('blue');

  // Pre-fill data when cards are loaded
  useEffect(() => {
    if (cards && id) {
      const card = cards.find(c => c.id === id);
      if (card) {
        setCardHolderName(card.card_holder_name);
        setCardProvider(card.card_provider);
        setCardNumberLast4(card.card_number_last_4);
        setExpiryDate(card.expiry_date);
        setColor(card.color);
      }
    }
  }, [cards, id]);

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
    const cleanText = text.replace(/[^0-9]/g, '');
    if (cleanText.length <= 2) {
      setExpiryDate(cleanText);
    } else {
      setExpiryDate(`${cleanText.slice(0, 2)}/${cleanText.slice(2, 4)}`);
    }
  };

  const handleLast4Change = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setCardNumberLast4(cleanText.slice(0, 4));
  };

  const handleSave = () => {
    if (!id) return;
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

    const month = parseInt(expiryDate.split('/')[0], 10);
    if (month < 1 || month > 12) {
      Toast.show({ type: 'error', text1: 'Invalid expiry month' });
      return;
    }

    updateCardMutation.mutate(
      {
        id,
        card_holder_name: cardHolderName.trim(),
        card_provider: cardProvider,
        card_number_last_4: cardNumberLast4,
        expiry_date: expiryDate,
        color,
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Card updated successfully' });
          router.back();
        },
        onError: (error) => {
          Toast.show({ type: 'error', text1: error.message });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-blue-50 dark:bg-[#0f172a] justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

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
          
          <View>
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Cardholder Name</Text>
            <TextInput
              className="bg-blue-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white font-medium"
              placeholder="e.g. John Doe"
              placeholderTextColor="#94a3b8"
              value={cardHolderName}
              onChangeText={setCardHolderName}
              autoCapitalize="characters"
              style={Platform.OS === 'web' ? { outlineWidth: 0 } : undefined}
            />
          </View>

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
                style={Platform.OS === 'web' ? { outlineWidth: 0 } : undefined}
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
                style={Platform.OS === 'web' ? { outlineWidth: 0 } : undefined}
              />
            </View>
          </View>

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
                      isSelected ? 'border-slate-800 dark:border-slate-400' : 'border-transparent'
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
            updateCardMutation.isPending ? 'opacity-70' : ''
          }`}
          onPress={handleSave}
          disabled={updateCardMutation.isPending}
          style={{ backgroundColor: '#2563eb' }}
        >
          {updateCardMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Update Card</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
