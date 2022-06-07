import { useMutation, useQueryClient } from 'react-query';
import { axiosCatetin } from '../api';
import CatetinToast from '../components/molecules/Toast';

const useDeleteStoreUser = () => {
  const client = useQueryClient();
  return useMutation(
    async (payload: { userId: number | undefined; id: string | undefined }) => {
      const {
        data: { data },
      } = await axiosCatetin.delete(`/store/${payload.id}/user/${payload.userId}`);
      return data;
    },
    {
      onSuccess: (data, variables) => {
        client.invalidateQueries(['store-users', variables.id]);
        CatetinToast(200, 'default', 'Berhasil menghapus akses pengguna');
      },
      onError: (err: any) => {
        CatetinToast(err?.response?.status, 'error', 'Failed to delete user access');
      },
    },
  );
};

export default useDeleteStoreUser;
