import { ICatetinTransaksiCategory } from './../screens/TransactionCreate/index';
import { useQuery, UseQueryOptions } from 'react-query';
import { axiosCatetin } from '../api';

const usePaymentMethod = (
  shopId: number,
  params?:
    | {
        name?: string;
      }
    | undefined,
) =>
  useQuery(['transaction-payment-method', shopId, { params }], async (): Promise<ICatetinTransaksiCategory[]> => {
    const {
      data: { data },
    } = await axiosCatetin.get(`/payment-method/${shopId}`, {
      params,
    });
    return data;
  });

export default usePaymentMethod;
