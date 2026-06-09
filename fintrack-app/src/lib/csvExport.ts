import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { supabase } from './supabase';
import Toast from 'react-native-toast-message';
import { Platform } from 'react-native';

export const exportTransactionsToCSV = async () => {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        type,
        transaction_date,
        description,
        categories (name)
      `)
      .order('transaction_date', { ascending: false });

    if (error) {
      throw error;
    }

    if (!transactions || transactions.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No transactions to export',
      });
      return;
    }

    const headerString = 'Date,Type,Category,Amount,Description\n';
    const rowString = (transactions as any[])
      .map(
        (t) =>
          `"${t.transaction_date}","${t.type}","${t.categories?.name || ''}","${
            t.amount
          }","${t.description || ''}"`
      )
      .join('\n');

    const csvString = `${headerString}${rowString}`;
    
    // Check if web platform
    if (Platform.OS === 'web') {
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Toast.show({
        type: 'success',
        text1: 'CSV exported successfully',
      });
      return;
    }
    
    const directoryUri = (FileSystem as any).documentDirectory;
    const fileUri = `${directoryUri}transactions_${new Date().getTime()}.csv`;
    
    await FileSystem.writeAsStringAsync(fileUri, csvString, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    if (!(await Sharing.isAvailableAsync())) {
      Toast.show({
        type: 'error',
        text1: 'Sharing is not available on this device',
      });
      return;
    }
    
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Transactions',
      UTI: 'public.comma-separated-values-text',
    });
    
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    Toast.show({
      type: 'error',
      text1: 'Failed to export CSV',
      text2: error.message,
    });
  }
};
