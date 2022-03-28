import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { View } from 'react-native';
import tw from 'twrnc';
import { ICatetinTipeTransaksi, IFormSchema } from '.';
import CatetinSelect from '../../components/molecules/Select';

function TransactionTypeScreen({
  selected,
  options,
  show,
  onChange,
}: {
  selected: ICatetinTipeTransaksi | null;
  options: ICatetinTipeTransaksi[];
  show: boolean;
  onChange: (opt: ICatetinTipeTransaksi) => void;
}) {
  return (
    <View style={tw`flex-1`}>
      <CatetinSelect
        showOptions={show}
        onSelectOption={(option) => {
          onChange(option);
        }}
        options={options}
        selected={selected}
      ></CatetinSelect>
    </View>
  );
}

export default TransactionTypeScreen;
