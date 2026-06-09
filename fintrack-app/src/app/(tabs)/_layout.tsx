import React from 'react';
import { Tabs } from 'expo-router';
import { Home, List, PieChart, Settings, Plus } from 'lucide-react-native';
import { TouchableOpacity, View, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={{
      top: -20,
      justifyContent: 'center',
      alignItems: 'center',
    }}
    onPress={onPress}
  >
    <View style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#2563eb',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#2563eb',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 5,
    }}>
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabsLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          elevation: 0,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderRadius: 30,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 15,
          borderWidth: 1,
          borderColor: isDark ? '#334155' : '#f1f5f9',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home color={focused ? '#2563eb' : (isDark ? '#94a3b8' : '#64748b')} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, focused }) => (
            <List color={focused ? '#2563eb' : (isDark ? '#94a3b8' : '#64748b')} size={24} />
          ),
        }}
      />
      
      {/* Floating Action Button for Add Transaction */}
      <Tabs.Screen
        name="add-placeholder"
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton 
              {...props} 
              onPress={() => router.push('/modal/add-transaction')}
            >
              <Plus color="white" size={32} />
            </CustomTabBarButton>
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/modal/add-transaction');
          },
        })}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <PieChart color={focused ? '#2563eb' : (isDark ? '#94a3b8' : '#64748b')} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Settings color={focused ? '#2563eb' : (isDark ? '#94a3b8' : '#64748b')} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
