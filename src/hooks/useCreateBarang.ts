import { ICatetinBarang } from './../types/barang';
import { useMutation, useQueryClient } from 'react-query';
import { axiosCatetin } from '../api';
import { useAppSelector } from '.';
import { RootState } from '../store';
import CatetinToast from '../components/molecules/Toast';

type CreateBarangPayload = {
  id: number;
  name: string;
  price: number;
  picture: string;
  stock: number;
  category: number[];
};
const useCreateBarang = () => {
  const client = useQueryClient();
  const { activeStore } = useAppSelector((state: RootState) => state.store);

  return useMutation(
    async (payload: CreateBarangPayload) => {
      let responseData: ICatetinBarang | undefined = undefined;
      if (payload.id !== 0) {
        const {
          data: { data },
        } = await axiosCatetin.put('/barang', payload);
        responseData = data;
      } else {
        const {
          data: { data },
        } = await axiosCatetin.post(`/barang/${activeStore}`, payload);
        responseData = data;
      }
      return responseData;
    },
    {
      onSuccess: (data, payload) => {
        CatetinToast(200, 'default', `Sukses ${payload.id === 0 ? 'menambah' : 'memperbarui'} barang`);
        client.invalidateQueries(['barang', activeStore]);
      },
      onError: (err: any) => {
        console.log(err.response);
        CatetinToast(err.response?.status, 'error', err.response?.data?.message || 'Failed to create barang');
      },
    },
  );
};

export default useCreateBarang;
