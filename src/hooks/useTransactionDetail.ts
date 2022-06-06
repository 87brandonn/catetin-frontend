import { useQuery, useQueryClient } from 'react-query';
import { useAppSelector } from '.';
import { axiosCatetin } from '../api';
import { RootState } from '../store';
import { ICatetinTransaksiWithDetail } from '../types/transaksi';

const useTransactionDetail = (id: number) => {
  const client = useQueryClient();
  const { activeStore } = useAppSelector((state: RootState) => state.store);

  return useQuery(
    ['transaction-detail', id],
    async () => {
      const {
        data: { data },
      } = await axiosCatetin.get(`/transaksi/${id}`);
      return data as ICatetinTransaksiWithDetail;
    },
    {
      initialData: (
        client.getQueryData(['transaction', activeStore]) as ICatetinTransaksiWithDetail[] | undefined
      )?.find((data) => data.id === id),
    },
  );
};

export default useTransactionDetail;
