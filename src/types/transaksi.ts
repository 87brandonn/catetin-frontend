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
export type ICatetinTransaksiWithDetail = ICatetinTransaksi & {
  Items: ({ ItemTransaction: ICatetinTransaksiDetail } & ICatetinBarang)[];
};
