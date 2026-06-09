import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export const useMonthlySummary = (date: Date = new Date()) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['summary', 'monthly', format(date, 'yyyy-MM')],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const startDate = startOfMonth(date).toISOString();
      const endDate = endOfMonth(date).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (error) throw error;

      let income = 0;
      let expense = 0;

      (data as any[] | null)?.forEach((tx) => {
        if (tx.type === 'income') income += tx.amount;
        if (tx.type === 'expense') expense += tx.amount;
      });

      return {
        income,
        expense,
        savings: income - expense,
      };
    },
    enabled: !!user,
  });
};

export const useCategoryBreakdown = (date: Date = new Date()) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['summary', 'breakdown', format(date, 'yyyy-MM')],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const startDate = startOfMonth(date).toISOString();
      const endDate = endOfMonth(date).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          type,
          categories (id, name, color, emoji)
        `)
        .eq('type', 'expense')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (error) throw error;

      const breakdown: Record<string, { total: number; name: string; color: string; emoji: string }> = {};

      (data as any[] | null)?.forEach((tx) => {
        const cat = tx.categories;
        if (!cat) return;
        
        if (!breakdown[cat.id]) {
          breakdown[cat.id] = {
            total: 0,
            name: cat.name,
            color: cat.color || '#64748b',
            emoji: cat.emoji || '📦',
          };
        }
        breakdown[cat.id].total += tx.amount;
      });

      return Object.values(breakdown).sort((a, b) => b.total - a.total);
    },
    enabled: !!user,
  });
};
