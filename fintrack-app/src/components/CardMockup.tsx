import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2, Edit2 } from 'lucide-react-native';

interface CardMockupProps {
  cardHolderName: string;
  cardProvider: string;
  cardNumberLast4: string;
  expiryDate: string;
  color?: string; // Hex color or gradient code
  onEdit?: () => void;
  onDelete?: () => void;
}

export const CardMockup = ({
  cardHolderName,
  cardProvider,
  cardNumberLast4,
  expiryDate,
  color = '#2563eb',
  onEdit,
  onDelete,
}: CardMockupProps) => {
  // Define standard preset gradients based on selection colors
  // If color doesn't match a preset, we use it as a solid background color
  const gradients: Record<string, string[]> = {
    blue: ['#2563eb', '#1d4ed8'],
    emerald: ['#10b981', '#047857'],
    purple: ['#8b5cf6', '#6d28d9'],
    rose: ['#f43f5e', '#be123c'],
    amber: ['#f59e0b', '#b45309'],
    slate: ['#475569', '#1e293b'],
  };

  const selectedGradient = gradients[color] || [color, color];

  return (
    <View 
      className="w-full aspect-[1.586] rounded-3xl p-6 relative overflow-hidden shadow-lg border border-white/10"
      style={{
        // Create a premium card gradient overlay using CSS (fallback to solid color natively)
        backgroundColor: selectedGradient[0],
        backgroundImage: `linear-gradient(135deg, ${selectedGradient[0]}, ${selectedGradient[1]})`,
      }}
    >
      {/* Decorative background glassmorphism shape */}
      <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-xl" />

      {/* Top Section */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Text className="text-white text-base font-extrabold tracking-widest uppercase">
            FinTrack
          </Text>
          <View className="w-1.5 h-1.5 bg-emerald-400 rounded-full ml-1.5" />
        </View>
        <Text className="text-white text-lg font-black italic">
          {cardProvider.toUpperCase()}
        </Text>
      </View>

      {/* SIM Chip & Wireless icon */}
      <View className="flex-row items-center justify-between mb-3">
        {/* Golden SIM chip */}
        <View className="w-12 h-9 bg-yellow-400/90 rounded-lg border border-yellow-500/20 overflow-hidden p-1 relative">
          <View className="w-full h-full border border-black/10 rounded-sm" />
          <View className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-black/10" />
          <View className="absolute left-0 right-0 top-1/2 h-[1px] bg-black/10" />
        </View>
      </View>

      {/* Card Number */}
      <Text className="text-white text-xl font-bold tracking-widest mb-1">
        ••••   ••••   ••••   {cardNumberLast4}
      </Text>

      {/* Bottom Section */}
      <View className="flex-row justify-between items-end mt-auto">
        <View className="flex-1 mr-4">
          <Text className="text-white/60 text-[8px] uppercase tracking-wider mb-0.5">
            Card Holder
          </Text>
          <Text className="text-white text-sm font-bold uppercase tracking-wider" numberOfLines={1}>
            {cardHolderName}
          </Text>
        </View>
        <View className="mr-6">
          <Text className="text-white/60 text-[8px] uppercase tracking-wider mb-0.5">
            Expires
          </Text>
          <Text className="text-white text-xs font-bold tracking-wider">
            {expiryDate}
          </Text>
        </View>
        {/* Actions */}
        <View className="flex-row gap-2">
          {onEdit && (
            <TouchableOpacity 
              onPress={onEdit} 
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 items-center justify-center border border-white/10"
            >
              <Edit2 color="white" size={14} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity 
              onPress={onDelete} 
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 items-center justify-center border border-white/10"
            >
              <Trash2 color="white" size={14} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
