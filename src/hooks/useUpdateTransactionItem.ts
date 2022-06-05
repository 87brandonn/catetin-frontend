import { useMutation, useQueryClient } from 'react-query';
import { useAppSelector } from '.';
import { axiosCatetin } from '../api';
import CatetinToast from '../components/molecules/Toast';
import { RootState } from '../store';

type UpdateTransactionItemPayload = {
  transaksi_id: number;
  barang_id: number | undefined;
  amount: number | undefined;
  price: number | undefined;
  notes: string | undefined;
};
const useUpdateTransactionItem = () => {
  const client = useQueryClient();
  const { activeStore } = useAppSelector((state: RootState) => state.store);

  return useMutation(
    async (payload: UpdateTransactionItemPayload) => {
      const { data } = await axiosCatetin.put('/transaksi/detail', payload);
      return data;
    },
    {
      onSuccess: (data, payload) => {
        client.invalidateQueries(['barang', activeStore]);
        client.invalidateQueries(['transaction', activeStore]);
        client.invalidateQueries(['transaction-detail', payload.transaksi_id]);
        CatetinToast(200, 'default', 'Berhasil melakukan update detail');
      },
      onError: (err: any) => {
        CatetinToast(err?.response?.status, 'error', 'Gagal melakukan update detail');
      },
    },
  );
};

export default useUpdateTransactionItem;
