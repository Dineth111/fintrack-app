import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { sendLocalNotification } from '../lib/notifications';

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'income' | 'expense';
  searchQuery?: string;
}

export interface TransactionWithCategory {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string | null;
  card_id: string | null;
  description: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  categories: {
    id: string;
    name: string;
    emoji: string | null;
    color: string | null;
  } | null;
  payment_cards: {
    id: string;
    card_holder_name: string;
    card_provider: string;
    card_number_last_4: string;
    color: string;
  } | null;
}

export const useTransactions = (filters?: TransactionFilters) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('transactions')
        .select(`
          *,
          categories (id, name, emoji, color),
          payment_cards (id, card_holder_name, card_provider, card_number_last_4, color)
        `)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.searchQuery) {
        query = query.ilike('description', `%${filters.searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as TransactionWithCategory[];
    },
    enabled: !!user,
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (newTransaction: {
      amount: number;
      type: 'income' | 'expense';
      category_id: string;
      card_id?: string | null;
      description?: string;
      transaction_date: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('transactions')
        .insert([
          {
            ...newTransaction,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      
      const typeLabel = data.type === 'income' ? 'Income' : 'Expense';
      sendLocalNotification(
        'Transaction Added',
        `Your ${typeLabel.toLowerCase()} of ${data.amount} was saved successfully.`
      );
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      amount?: number;
      type?: 'income' | 'expense';
      category_id?: string;
      card_id?: string | null;
      description?: string;
      transaction_date?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });
};
