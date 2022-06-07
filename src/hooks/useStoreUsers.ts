import { useQuery } from 'react-query';
import { axiosCatetin } from '../api';
import { Profile, User } from '../types/profil';

const useStoreUsers = (storeId: number) => {
  return useQuery(['store-users', storeId], async () => {
    const {
      data: { data },
    } = await axiosCatetin.get(`/store/${storeId}/user`);
    return data as {
      UserId: number;
      grant: 'employee' | 'owner';
      User: User & { Profile: Profile };
    }[];
  });
};

export default useStoreUsers;
