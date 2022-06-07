import { useMutation } from 'react-query';
import { axiosCatetin } from '../api';

const useUpdateRegisterInvitation = () => {
  return useMutation(async (payload: { invitationId: number }) => {
    const [{ data: registerInvitationData }] = await Promise.all([
      axiosCatetin.put(`/register-invitation/${payload.invitationId}`, {
        active: false,
      }),
    ]);

    return registerInvitationData;
  });
};

export default useUpdateRegisterInvitation;
