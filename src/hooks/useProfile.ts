import { ProfileJoinUser } from './../types/profil';
import { useQuery } from 'react-query';
import { axiosCatetin } from '../api';
import CatetinToast from '../components/molecules/Toast';
import { useAppSelector } from '.';
import { RootState } from '../store';

const useProfile = () => {
  const { loggedIn } = useAppSelector((state: RootState) => state.auth);
  return useQuery(
    ['profile'],
    async () => {
      const {
        data: { data },
      } = await axiosCatetin.get('/auth/profile');
      return data as ProfileJoinUser;
    },
    {
      enabled: loggedIn,
      onError: (err: any) => {
        CatetinToast(err?.response?.status, 'error', 'Terjadi kesalahan. Gagal mengambil data profil.');
      },
    },
  );
};

export default useProfile;
