import { ProfileJoinUser } from './../types/profil';
import { useQuery } from 'react-query';
import { axiosCatetin } from '../api';
import CatetinToast from '../components/molecules/Toast';

const useProfile = () =>
  useQuery(
    ['profile'],
    async () => {
      const {
        data: { data },
      } = await axiosCatetin.get('/auth/profile');
      return data as ProfileJoinUser;
    },
    {
      onError: (err: any) => {
        CatetinToast(err?.response?.status, 'error', 'Terjadi kesalahan. Gagal mengambil data profil.');
      },
    },
  );

export default useProfile;
