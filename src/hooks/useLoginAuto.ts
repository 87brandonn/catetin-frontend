import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from 'react-query';
import { axiosCatetin } from '../api';

const useLoginAuto = () => {
  return useMutation(
    async (payload: {
      id: string | undefined;
      invitationId: string | undefined;
      grant: 'employee' | 'owner';
      email: string | undefined;
    }) => {
      const [
        registerInvitationData,
        {
          data: { token, refreshToken, user },
        },
      ] = await Promise.all([
        axiosCatetin.put(`/register-invitation/${payload.invitationId}`, {
          active: false,
        }),
        axiosCatetin.post('/auth/login/auto', {
          email: payload?.email,
          device_token_id: await AsyncStorage.getItem('deviceId'),
        }),
      ]);

      await axiosCatetin.post(`/store/${payload.id}/user`, {
        grant: payload.grant,
        userId: user.id,
      });

      return { token, refreshToken };
    },
  );
};

export default useLoginAuto;
