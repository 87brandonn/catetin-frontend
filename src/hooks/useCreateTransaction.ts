import { useMutation, useQueryClient } from 'react-query';
import { axiosCatetin } from '../api';
import CatetinToast from '../components/molecules/Toast';
import { ICatetinTransaksi } from '../types/transaksi';

type CreateTransactionPayload = {
  transaksi_id: number;
  transaksi_category: number | undefined;
  title: string;
  tanggal: string;
  notes: string;
  total: number;
  rootType: 'income' | 'outcome' | undefined;
};

const useCreateTransaction = (
  storeId: number,
  onSuccess?: (payload: CreateTransactionPayload, data: ICatetinTransaksi) => void,
) => {
  const client = useQueryClient();
  return useMutation(
    async (payload: CreateTransactionPayload) => {
      let dataTransaksi: ICatetinTransaksi;
      if (payload.transaksi_id === 0) {
        const {
          data: { data: insertedData },
        } = await axiosCatetin.post(`/transaksi/${storeId}`, payload);
        dataTransaksi = insertedData;
      } else {
        const {
          data: {
            data: [updatedData],
          },
        } = await axiosCatetin.put('/transaksi', payload);
        dataTransaksi = updatedData;
      }
      return dataTransaksi;
    },
    {
      onSuccess: (data, payload) => {
        CatetinToast(200, 'default', `Sukses ${payload.transaksi_id === 0 ? 'menambah' : 'memperbarui'} transaksi`);
        client.invalidateQueries(['transaction', storeId]);
        onSuccess?.(payload, data);
      },
      onError: (err: any) => {
        CatetinToast(err.response?.status, 'error', err.response?.data?.message || 'Failed to create transaction');
      },
    },
  );
};

export default useCreateTransaction;
