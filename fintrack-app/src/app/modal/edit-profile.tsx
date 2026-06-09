import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import Toast from 'react-native-toast-message';
import { User, Mail } from 'lucide-react-native';
import { sendLocalNotification } from '../../lib/notifications';

export default function EditProfileModal() {
  const router = useRouter();
  const { profile, user, updateDisplayName } = useAuthStore();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Toast.show({ type: 'error', text1: 'Name cannot be empty' });
      return;
    }
    
    setIsSaving(true);
    try {
      await updateDisplayName(displayName.trim());
      sendLocalNotification('Profile Updated', 'Your profile details have been successfully changed.');
      Toast.show({ type: 'success', text1: 'Profile updated' });
      router.back();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-blue-50 dark:bg-[#0f172a]"
    >
      <View className="flex-1 px-6 pt-8">
        
        {/* Avatar Section */}
        <View className="items-center mb-10">
          <View className="w-24 h-24 bg-blue-100 dark:bg-slate-800 rounded-full items-center justify-center border-4 border-white dark:border-slate-700 shadow-md mb-4 relative overflow-hidden">
            <User color="#2563eb" size={40} />
            <View className="absolute bottom-0 w-full bg-black/40 py-1 items-center">
              <Text className="text-[10px] font-bold text-white uppercase tracking-widest">Edit</Text>
            </View>
          </View>
          <Text className="text-xl font-extrabold text-slate-800 dark:text-white">
            {profile?.display_name || 'Your Profile'}
          </Text>
          <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {user?.email}
          </Text>
        </View>

        {/* Form Section */}
        <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm mb-6 border border-slate-100 dark:border-slate-700/50 space-y-6">
          
          <View>
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Display Name</Text>
            <View className="flex-row items-center bg-blue-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
              <User color="#94a3b8" size={18} />
              <TextInput
                className="flex-1 ml-3 text-base text-slate-800 dark:text-white font-medium"
                placeholder="Enter your name"
                placeholderTextColor="#94a3b8"
                value={displayName}
                onChangeText={setDisplayName}
                style={Platform.OS === 'web' ? { outlineWidth: 0 } : undefined}
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address (Read Only)</Text>
            <View className="flex-row items-center bg-blue-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 opacity-70">
              <Mail color="#94a3b8" size={18} />
              <TextInput
                className="flex-1 ml-3 text-base text-slate-500 dark:text-slate-400 font-medium"
                value={user?.email || ''}
                editable={false}
                style={Platform.OS === 'web' ? { outlineWidth: 0 } : undefined}
              />
            </View>
          </View>

        </View>

        {/* Save Button */}
        <TouchableOpacity 
          className={`w-full bg-blue-600 rounded-3xl p-4 items-center justify-center shadow-md flex-row ${
            isSaving ? 'opacity-70' : ''
          }`}
          onPress={handleSave}
          disabled={isSaving}
          style={{ backgroundColor: '#2563eb' }}
        >
          {isSaving ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : null}
          <Text className="text-white font-bold text-lg">Save Profile</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}
