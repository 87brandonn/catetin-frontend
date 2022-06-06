import { ICatetinBarang } from './barang';
export interface ICatetinTransaksi {
  id: number;
  nominal: number;
  type: string;
  transaction_date: Date;
  title: string;
  notes: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  UserId: number;
}
export interface ICatetinTransaksiDetail {
  amount: number;
  price: number;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  ItemId: number;
  notes: string;
  total: number;
  TransactionId: number;
}

export type ICatetinTransactionType = {
  StoreId: null | number;
  createdAt: Date;
  deleted: boolean;
  global: boolean;
  id: number;
  name: string;
  picture: string | null;
  rootType: 'outcome' | 'income';
  updatedAt: Date;
};

export type ICatetinPaymentMethod = {
  StoreId: number;
  createdAt: Date;
  deleted: boolean;
  global: boolean;
  id: number;
  name: string;
  picture: string;
  updatedAt: Date;
};

export type ICatetinTransactionPaymentMethod = {
  PaymentMethod: ICatetinPaymentMethod;
  PaymentMethodId: number;
  TransactionId: number;
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ICatetinTransaksiWithDetail = ICatetinTransaksi & {
  Items: ({ ItemTransaction: ICatetinTransaksiDetail } & ICatetinBarang)[];
  TransactionTransactionType: {
    TransactionId: number;
    TransactionType: ICatetinTransactionType;
    TransactionTypeId: number;
    createdAt: Date;
    updatedAt: Date;
  };
  TransactionPaymentMethod: ICatetinTransactionPaymentMethod;
};
