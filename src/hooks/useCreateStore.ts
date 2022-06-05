import { useMutation, useQueryClient } from 'react-query';
import { axiosCatetin } from '../api';
import CatetinToast from '../components/molecules/Toast';

type CreateStorePayload = {
  name: string;
  picture: string | null;
  storeId: number;
};
const useCreateStore = () => {
  const client = useQueryClient();
  return useMutation(
    async (payload: CreateStorePayload) => {
      const { storeId, ...rest } = payload;
      const {
        data: { data },
      } = await axiosCatetin.post(`/store`, { ...rest, id: storeId === 0 ? undefined : storeId });
      return data;
    },
    {
      onSuccess: (data, payload) => {
        client.invalidateQueries(['store']);
        CatetinToast(200, 'default', `Succesfully ${payload.storeId === 0 ? 'add' : 'edit'} store`);
      },
      onError: (err: any) => {
        CatetinToast(err?.response?.status, 'error', 'Internal error occured. Failed to add store');
      },
    },
  );
};

export default useCreateStore;
