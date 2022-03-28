import React from 'react';
import CatetinSelect from '../../components/molecules/Select';
import { ICatetinBarang } from '../../types/barang';

function BarangScreen({
  options,
  show,
  onSelectBarang,
  onChangeBarangAmount,
  amountBarang,
  value,
  onChange,
}: {
  options: ICatetinBarang[] | null;
  show: boolean;
  onSelectBarang: (option: ICatetinBarang) => ICatetinBarang[];
  onChangeBarangAmount: (value: string, id: string) => void;
  amountBarang: Record<string, number>;
  value: ICatetinBarang[] | null;
  onChange: (value: ICatetinBarang[]) => void;
}) {
  return (
    <CatetinSelect
      showOptions={show}
      onSelectOption={(option) => {
        const filteredBarang = onSelectBarang(option);
        onChange(filteredBarang);
      }}
      options={options}
      selected={value}
      labelKey="nama_barang"
      valueKey="barang_id"
      placeholder="Barang"
      multiple
      count
      onChangeAmount={(value, id) => {
        onChangeBarangAmount(value, id);
      }}
      amountData={amountBarang}
    ></CatetinSelect>
  );
}

export default BarangScreen;
