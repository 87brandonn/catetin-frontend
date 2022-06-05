import { useMutation, useQueryClient } from 'react-query';
import { useAppSelector } from '.';
import { axiosCatetin } from '../api';
import CatetinToast from '../components/molecules/Toast';
import { RootState } from '../store';

type CreateTransactionItemPayload =
  | {
      id: number;
      amount: number | undefined;
      notes: string | undefined;
      price: number;
    }[]
  | undefined;

const useCreateTransactionItem = () => {
  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);
  const client = useQueryClient();
  const { activeStore } = useAppSelector((state: RootState) => state.store);

  return useMutation(
    async (payload: CreateTransactionItemPayload) => {
      await axiosCatetin.post(`/transaksi/detail`, {
        transaksi_id: selectedTransaction,
        barang: payload,
      });
    },
    {
      onSuccess: () => {
        client.invalidateQueries(['barang', activeStore]);
        client.invalidateQueries(['transaction-detail', selectedTransaction]);
        client.invalidateQueries(['transaction', activeStore]);
        CatetinToast(200, 'default', `Sukses menambah barang pada transaksi`);
      },
      onError: (err: any) => {
        CatetinToast(err?.response?.status, 'error', 'Terjadi kesalahan pada server. Gagal melakukan update barang.');
      },
    },
  );
};

export default useCreateTransactionItem;
