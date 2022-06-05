import { useQuery, useQueryClient } from 'react-query';
import { useAppSelector } from '.';
import { axiosCatetin } from '../api';
import { RootState } from '../store';
import { ICatetinBarang } from '../types/barang';
import { ICatetinItemCategory } from '../types/itemCategory';
import { ICatetinTransaksi, ICatetinTransaksiDetail } from '../types/transaksi';

const useBarangDetail = (
  id: number,
  params: {
    transaksi: boolean;
    category: boolean;
  },
) => {
  const client = useQueryClient();
  const { activeStore } = useAppSelector((state: RootState) => state.store);

  return useQuery(
    ['barang-detail', id, { params }],
    async () => {
      const {
        data: { data },
      } = await axiosCatetin.get(`/barang/${id}`, {
        params,
      });
      return data as ICatetinBarang & {
        ItemCategories: ICatetinItemCategory[];
        Transactions: (ICatetinTransaksi & {
          ItemTransaction: ICatetinTransaksiDetail;
        })[];
      };
    },
    {
      initialData: () => {
        return (client.getQueryData(['barang', activeStore]) as ICatetinBarang[])?.find((data) => data.id === id);
      },
    },
  );
};

export default useBarangDetail;
