import { ICatetinTransaksiCategory } from './../screens/TransactionCreate/index';
import { useQuery, UseQueryOptions } from 'react-query';
import { axiosCatetin } from '../api';

const useTransactionCategory = (
  shopId: number,
  params: {
    name?: string;
    type?: 'income' | 'outcome';
  },
  options?:
    | Omit<
        UseQueryOptions<
          any,
          unknown,
          any,
          (string | number | { params: { name?: string | undefined; type?: 'income' | 'outcome' | undefined } })[]
        >,
        'queryKey' | 'queryFn'
      >
    | undefined,
) =>
  useQuery(
    ['transaction-category', shopId, { params }],
    async (): Promise<ICatetinTransaksiCategory[]> => {
      const {
        data: { data },
      } = await axiosCatetin.get(`/transaction-type/${shopId}`, {
        params,
      });
      return data;
    },
    options,
  );

export default useTransactionCategory;
