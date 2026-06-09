import React from 'react';
import { Tabs } from 'expo-router';
import { Home, List, PieChart, Settings, Plus } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
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
      backgroundColor: '#3b82f6',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#3b82f6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
    }}>
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderRadius: 25,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home color={focused ? '#3b82f6' : '#94a3b8'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, focused }) => (
            <List color={focused ? '#3b82f6' : '#94a3b8'} size={24} />
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
            <PieChart color={focused ? '#3b82f6' : '#94a3b8'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Settings color={focused ? '#3b82f6' : '#94a3b8'} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
