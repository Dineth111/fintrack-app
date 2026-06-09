import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { sendLocalNotification } from '../lib/notifications';

export interface PaymentCard {
  id: string;
  user_id: string;
  card_holder_name: string;
  card_provider: string;
  card_number_last_4: string;
  expiry_date: string;
  color: string;
  created_at: string;
}

export const useCards = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('payment_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as PaymentCard[];
    },
    enabled: !!user,
  });
};

export const useAddCard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (newCard: {
      card_holder_name: string;
      card_provider: string;
      card_number_last_4: string;
      expiry_date: string;
      color: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('payment_cards')
        .insert([
          {
            ...newCard,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      sendLocalNotification(
        'Card Added',
        `Your ${data.card_provider} card ending in ${data.card_number_last_4} was added successfully.`
      );
    },
  });
};

export const useUpdateCard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      card_holder_name?: string;
      card_provider?: string;
      card_number_last_4?: string;
      expiry_date?: string;
      color?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('payment_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      sendLocalNotification(
        'Card Updated',
        `Your ${data.card_provider} card ending in ${data.card_number_last_4} was updated.`
      );
    },
  });
};

export const useDeleteCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('payment_cards').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      // Invalidate transactions in case some were linked
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      sendLocalNotification(
        'Card Deleted',
        'Your payment card was successfully removed.'
      );
    },
  });
};
