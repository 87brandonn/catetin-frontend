import { useMutation, useQueryClient } from 'react-query';
import { axiosCatetin } from '../api';

const useDeletePaymentMethod = (storeId: number) => {
  const client = useQueryClient();
  return useMutation(
    async (id: number) => {
      const {
        data: { data },
      } = await axiosCatetin.delete(`/payment-method/${id}`);
      return data;
    },
    {
      onSuccess: () => {
        client.invalidateQueries(['transaction-payment-method', storeId]);
      },
    },
  );
};

export default useDeletePaymentMethod;
