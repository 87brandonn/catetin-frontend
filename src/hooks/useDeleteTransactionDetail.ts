import { useMutation, useQueryClient } from 'react-query';
import { useAppSelector } from '.';
import { axiosCatetin } from '../api';
import CatetinToast from '../components/molecules/Toast';
import { RootState } from '../store';

type DeleteTransactionDetailPayload = {
  transaksi_id: number;
  barang_id: number;
};

const useDeleteTransactionDetail = () => {
  const client = useQueryClient();
  const { activeStore } = useAppSelector((state: RootState) => state.store);

  return useMutation(
    async (payload: DeleteTransactionDetailPayload) => {
      const {
        data: { data },
      } = await axiosCatetin.delete(`/transaksi/detail`, {
        data: payload,
      });
      return data;
    },
    {
      onSuccess: (data, payload) => {
        client.invalidateQueries(['transaction', activeStore]);
        client.invalidateQueries(['transaction-detail', payload.transaksi_id]);
        CatetinToast(200, 'default', 'Berhasil menghapus detail transaksi');
      },
      onError: (err: any) => {
        CatetinToast(err?.response?.status, 'error', 'Failed to delete transaction detail');
      },
    },
  );
};

export default useDeleteTransactionDetail;
