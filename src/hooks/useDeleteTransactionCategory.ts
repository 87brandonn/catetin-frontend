import { useMutation, useQueryClient } from 'react-query';
import { axiosCatetin } from '../api';

const useDeleteTransactionCategory = (storeId: number) => {
  const client = useQueryClient();
  return useMutation(
    async (id: number) => {
      const {
        data: { data },
      } = await axiosCatetin.delete(`/transaction-type/${id}`);
      return data;
    },
    {
      onSuccess: () => {
        client.invalidateQueries(['transaction-category', storeId]);
      },
    },
  );
};

export default useDeleteTransactionCategory;
