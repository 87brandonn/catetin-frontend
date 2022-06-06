import { useMutation, useQueryClient } from 'react-query';
import { axiosCatetin } from '../api';

type CreatePaymentMethodPayload = {
  id: number | undefined;
  name: string;
};
const useCreatePaymentMethod = (storeId: number) => {
  const client = useQueryClient();
  return useMutation(
    async (payload: CreatePaymentMethodPayload) => {
      const {
        data: { data },
      } = await axiosCatetin.post(`/payment-method/${storeId}`, payload);
      return data;
    },
    {
      onSuccess: () => {
        client.invalidateQueries(['transaction-payment-method', storeId]);
      },
    },
  );
};

export default useCreatePaymentMethod;
