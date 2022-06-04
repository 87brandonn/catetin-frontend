import { useMutation, useQueryClient } from 'react-query';
import { axiosCatetin } from '../api';

type CreateTransactionCategoryPayload = {
  id: number | undefined;
  name: string;
  rootType: 'income' | 'outcome';
};
const useCreateTransactionCategory = (storeId: number, onSuccess?: () => void) => {
  const client = useQueryClient();
  return useMutation(
    async (payload: CreateTransactionCategoryPayload) => {
      const {
        data: { data },
      } = await axiosCatetin.post(`/transaction-type/${storeId}`, payload);
      return data;
    },
    {
      onSuccess: () => {
        client.invalidateQueries(['transaction-category', storeId]);
        onSuccess?.();
      },
    },
  );
};

export default useCreateTransactionCategory;
