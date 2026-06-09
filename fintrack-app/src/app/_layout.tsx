import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import '../global.css';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { session, isLoading, setSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-blue-50 dark:bg-[#0f172a]">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="modal/add-transaction" 
          options={{ 
            presentation: 'modal', 
            title: 'Add Transaction',
            headerShown: true,
            headerStyle: { backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc' },
            headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          }} 
        />
        <Stack.Screen 
          name="modal/edit-transaction" 
          options={{ 
            presentation: 'modal', 
            title: 'Edit Transaction',
            headerShown: true,
            headerStyle: { backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#f8fafc' },
            headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          }} 
        />
        <Stack.Screen 
          name="modal/categories" 
          options={{ presentation: 'modal', title: 'Categories', headerShown: true }} 
        />
        <Stack.Screen 
          name="modal/add-card" 
          options={{ presentation: 'modal', title: 'Add Card', headerShown: true }} 
        />
        <Stack.Screen 
          name="modal/edit-card" 
          options={{ presentation: 'modal', title: 'Edit Card', headerShown: true }} 
        />
        <Stack.Screen 
          name="modal/edit-profile" 
          options={{ presentation: 'modal', title: 'Edit Profile', headerShown: true }} 
        />
        <Stack.Screen 
          name="modal/notifications" 
          options={{ presentation: 'modal', headerShown: false }} 
        />
      </Stack>
      <Toast />
    </QueryClientProvider>
  );
}
