import { ICatetinBarang } from './barang';
export interface ICatetinTransaksi {
  created_at: string;
  nominal_transaksi: number;
  notes: string;
  tanggal: string;
  tipe_transaksi: number;
  title: string;
  transaksi_id: number;
  updated_at: string;
  user_id: number;
}

export interface ICatetinTransaksiDetail {
  detail_id: number;
  barang_id: number;
  amount: number;
  transaksi_id: number;
}

export type ICatetinTransaksiWithDetail = ICatetinTransaksi & {
  transaksi_detail: (ICatetinTransaksiDetail & ICatetinBarang)[];
};
