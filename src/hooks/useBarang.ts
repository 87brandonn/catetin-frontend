import { useQuery } from 'react-query';
import { axiosCatetin } from '../api';
import CatetinToast from '../components/molecules/Toast';
import { ICatetinBarang } from '../types/barang';
import { ICatetinItemCategory } from '../types/itemCategory';

const useBarang = (
  storeId: number,
  params?: {
    transactionId?: number | undefined;
    nama_barang: string;
    categories?: number[] | undefined;
    harga?: number[] | undefined;
    stok?: number[] | undefined;
  },
) =>
  useQuery(
    ['barang', storeId, { params }],
    async () => {
      const {
        data: { data },
      } = await axiosCatetin.get(`/barang/${storeId}/list`, {
        params,
      });
      return data as (ICatetinBarang & {
        ItemCategories: ICatetinItemCategory[];
      })[];
    },
    {
      onError: (err: any) => {
        CatetinToast(err?.response?.status, 'error', 'Terjadi kesalahan pada server. Gagal mengambil data barang.');
      },
    },
  );

export default useBarang;
