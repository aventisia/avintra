import { useMutation } from '@tanstack/react-query';
import { deleteAPIKey } from '../apis/api-keys-api';
import { toast } from '@aventisia/ui/sonner';
import { useFetchApiKeys } from './useFetchAPIKeys';

export function useDeleteAPIKey() {
      const { refetch } = useFetchApiKeys();
    
  return useMutation({
    mutationFn: (apiKeyId: string) => deleteAPIKey(apiKeyId),
    onSuccess: () => {
      toast.success('API key deleted successfully.');
      refetch()
    },
    onError: (error) => {
        toast.error(error.toString() || 'Failed to delete API key.');
    },
  });
}
