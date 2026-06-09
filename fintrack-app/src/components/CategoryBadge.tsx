import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface CategoryBadgeProps {
  category: {
    id: string;
    name: string;
    emoji: string | null;
    color: string | null;
  };
  isSelected?: boolean;
  onPress?: () => void;
}

export const CategoryBadge = ({ category, isSelected, onPress }: CategoryBadgeProps) => {
  const baseColor = category.color || '#cbd5e1';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`w-[30%] aspect-square mb-4 items-center justify-center rounded-2xl border-2 transition-all p-3`}
      style={{
        backgroundColor: isSelected ? `${baseColor}15` : 'transparent',
        borderColor: isSelected ? baseColor : '#e2e8f0',
        // Slight scale and glow effect on native/web when selected
        transform: isSelected ? [{ scale: 1.02 }] : [{ scale: 1 }],
      }}
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mb-2 shadow-sm"
        style={{ 
          backgroundColor: isSelected ? baseColor : `${baseColor}22` 
        }}
      >
        <Text className="text-2xl">{category.emoji || '📦'}</Text>
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        className={`font-semibold text-xs text-center ${
          isSelected ? 'text-slate-800 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'
        }`}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};
