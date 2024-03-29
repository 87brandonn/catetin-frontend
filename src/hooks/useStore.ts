import { useQuery } from 'react-query';
import { axiosCatetin } from '../api';
import { Profile, User } from '../types/profil';
import { ICatetinStore } from '../types/store';

const useStore = (params?: any) => {
  return useQuery(['store', { params }], async () => {
    const {
      data: { data },
    } = await axiosCatetin.get('/store', { params });
    return data as {
      UserId: number;
      StoreId: number;
      grant: 'employee' | 'owner';
      Store: ICatetinStore;
      User: User & { Profile: Profile };
    }[];
  });
};

export default useStore;
