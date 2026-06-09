import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Platform } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  type?: 'income' | 'expense';
}

export const AmountInput = ({ value, onChange, type = 'expense' }: AmountInputProps) => {
  const { currency } = useSettingsStore();
  
  // Keep local string state to allow trailing dots and empty values during typing
  const [textValue, setTextValue] = useState(value ? value.toString() : '');

  useEffect(() => {
    const parsed = parseFloat(textValue || '0');
    if (value !== parsed) {
      setTextValue(value ? value.toString() : '');
    }
  }, [value]);

  const handleChange = (text: string) => {
    // Only allow numbers and a single decimal point
    const sanitized = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    if ((sanitized.match(/\./g) || []).length > 1) {
      return;
    }

    setTextValue(sanitized);

    const parsed = parseFloat(sanitized);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else if (sanitized === '') {
      onChange(0);
    }
  };

  return (
    <View className="items-center py-4 w-full">
      <Text className="text-slate-500 font-medium mb-3 uppercase tracking-wider text-xs">
        Amount
      </Text>
      <View 
        className="flex-row items-center justify-center bg-slate-100 dark:bg-slate-800 px-6 py-4 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-[300px]"
        style={{ alignSelf: 'center' }}
      >
        <Text className="text-3xl font-extrabold text-slate-400 mr-2">{currency}</Text>
        <TextInput
          className={`text-4xl font-extrabold text-center flex-1 ${
            type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'
          }`}
          value={textValue}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#94a3b8"
          maxLength={10}
          autoFocus
          style={Platform.OS === 'web' ? { outlineWidth: 0 } : undefined}
        />
      </View>
    </View>
  );
};
