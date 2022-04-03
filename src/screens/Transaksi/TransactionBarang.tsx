import React from 'react';
import { IBarangPayload } from '.';
import CatetinSelect from '../../components/molecules/Select';
import { ICatetinBarang } from '../../types/barang';

function BarangScreen({
  options,
  onChangeBarangAmount,
  value,
  onChange,
}: {
  options: ICatetinBarang[];
  onChangeBarangAmount: (value: string, id: ICatetinBarang) => void;
  value: IBarangPayload[] | null;
  onChange: (value: ICatetinBarang) => void;
}) {
  return (
    <CatetinSelect<ICatetinBarang>
      onSelectOption={(option) => {
        onChange(option);
      }}
      options={options}
      selected={value}
      labelKey="nama_barang"
      valueKey="barang_id"
      placeholder="Barang"
      multiple
      count
      onChangeAmount={(value, barang) => {
        onChangeBarangAmount(value, barang);
      }}
    ></CatetinSelect>
  );
}

export default BarangScreen;
