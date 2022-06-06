import { useQuery } from 'react-query';
import { axiosCatetin } from '../api';
import { ICatetinTransaksiWithDetail } from '../types/transaksi';

const useTransaction = (
  storeId: number,
  params?: {
    search: string;
  },
) =>
  useQuery(['transaction', storeId, { params }], async () => {
    const {
      data: { data },
    } = await axiosCatetin.get(`/transaksi/${storeId}/list`, {
      params,
    });
    return data as ICatetinTransaksiWithDetail[];
  });

export default useTransaction;
