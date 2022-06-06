import { useQuery } from 'react-query';
import { axiosCatetin } from '../api';
import { ICatetinStore } from '../types/store';

const useStore = () => {
  return useQuery(['store'], async () => {
    const {
      data: { data },
    } = await axiosCatetin.get('/store');
    return data as ICatetinStore[];
  });
};

export default useStore;
