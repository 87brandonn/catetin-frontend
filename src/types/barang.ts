import { ICatetinTransaksi, ICatetinTransaksiDetail } from './transaksi';

export interface ICatetinBarang {
  barang_id: number;
  created_at: Date;
  harga: number;
  nama_barang: string;
  stok: number;
  updated_at: Date;
  user_id: number;
  barang_picture: string;
}

export type ICatetinBarangWithTransaksi = ICatetinBarang & {
  transaksi_data: (ICatetinTransaksiDetail & ICatetinTransaksi)[];
};
