import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (notif) => set((state) => {
        const newNotif: AppNotification = {
          ...notif,
          id: Math.random().toString(36).substring(2, 15),
          date: new Date().toISOString(),
          read: false,
        };
        return { notifications: [newNotif, ...state.notifications] };
      }),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
