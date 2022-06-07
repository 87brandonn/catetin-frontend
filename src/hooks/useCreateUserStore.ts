import { useMutation, useQueryClient } from 'react-query';
import { axiosCatetin } from '../api';
import CatetinToast from '../components/molecules/Toast';

const useCreateUserStore = () => {
  const client = useQueryClient();
  return useMutation(
    async (payload: {
      id: string | undefined;
      invitationId: number;
      grant: 'employee' | 'owner';
      userId: number | undefined;
    }) => {
      const [
        registerInvitationData,
        {
          data: { data: createStoreData },
        },
      ] = await Promise.all([
        axiosCatetin.put(`/register-invitation/${payload.invitationId}`, {
          active: false,
        }),
        axiosCatetin.post(`/store/${payload.id}/user`, {
          grant: payload.grant,
          userId: payload.userId,
        }),
      ]);

      return createStoreData;
    },
    {
      onSuccess: () => {
        client.invalidateQueries(['store']);
        CatetinToast(200, 'default', `Sukses menambah toko`);
      },
      onError: (err: any) => {
        console.log(JSON.stringify(err));
        CatetinToast(err?.response?.status, 'error', 'Terjadi kesalahan pada server. Gagal menambah toko.');
      },
    },
  );
};

export default useCreateUserStore;
