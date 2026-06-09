import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AddPlaceholder() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)');
    router.push('/modal/add-transaction');
  }, []);

  return null;
}
