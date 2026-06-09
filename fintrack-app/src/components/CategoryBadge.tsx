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
      className={`mr-3 mb-3 flex-row items-center rounded-full px-4 py-2 border-2 ${
        isSelected ? 'border-transparent' : 'border-slate-200 dark:border-slate-700'
      }`}
      style={{
        backgroundColor: isSelected ? baseColor : 'transparent',
      }}
    >
      <View
        className="w-6 h-6 rounded-full items-center justify-center mr-2"
        style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${baseColor}33` }}
      >
        <Text className="text-sm">{category.emoji || '📦'}</Text>
      </View>
      <Text
        className={`font-medium ${
          isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'
        }`}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};
