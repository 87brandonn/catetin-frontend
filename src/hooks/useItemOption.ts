import { useQuery, UseQueryOptions } from 'react-query';
import { axiosCatetin } from '../api';

type CatetinItemOption = {
  createdAt: Date;
  deleted: boolean;
  id: number;
  name: string;
  updatedAt: Date;
};

const useItemOption = (
  options?: Omit<UseQueryOptions<any, unknown, any, string[]>, 'queryKey' | 'queryFn'> | undefined,
) =>
  useQuery(
    ['item-option'],
    async () => {
      const {
        data: { data },
      } = await axiosCatetin.get(`/item-option`);
      return data as CatetinItemOption[];
    },
    options,
  );

export default useItemOption;
