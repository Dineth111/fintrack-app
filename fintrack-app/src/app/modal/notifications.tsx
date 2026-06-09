import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '../../store/notificationStore';
import { Bell, CheckCircle2, ArrowLeft } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, markAllAsRead, clearNotifications } = useNotificationStore();

  useEffect(() => {
    markAllAsRead();
  }, []);

  return (
    <View className="flex-1 bg-blue-50 dark:bg-[#0f172a]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-4 bg-white dark:bg-[#1e293b] border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full active:bg-slate-100 dark:active:bg-slate-800">
            <ArrowLeft color="#64748b" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-800 dark:text-white">Notifications</Text>
        </View>
        
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearNotifications} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
            <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center mt-32">
            <View className="w-20 h-20 bg-blue-50 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
              <Bell color="#94a3b8" size={32} />
            </View>
            <Text className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Notifications</Text>
            <Text className="text-slate-500 text-center px-10">
              When you add transactions or cards, notifications will appear here.
            </Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <View 
              key={notif.id} 
              className={`mb-3 p-4 rounded-2xl border ${
                notif.read 
                  ? 'bg-white dark:bg-[#1e293b] border-slate-100 dark:border-slate-800' 
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
              }`}
            >
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center mr-3 mt-1">
                  <CheckCircle2 color="#3b82f6" size={20} />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-base font-bold text-slate-800 dark:text-white">{notif.title}</Text>
                    <Text className="text-xs font-medium text-slate-400">
                      {formatDistanceToNow(new Date(notif.date), { addSuffix: true })}
                    </Text>
                  </View>
                  <Text className="text-slate-600 dark:text-slate-400 text-sm leading-5">
                    {notif.message}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
