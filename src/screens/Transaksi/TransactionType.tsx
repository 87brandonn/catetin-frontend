import React from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import { ICatetinTipeTransaksi } from '.';
import CatetinSelect from '../../components/molecules/Select';

function TransactionTypeScreen({
  selected,
  options,
  onChange,
}: {
  selected: ICatetinTipeTransaksi | null | undefined;
  options: ICatetinTipeTransaksi[];
  onChange: (opt: ICatetinTipeTransaksi) => void;
}) {
  return (
    <View style={tw`flex-1`}>
      <CatetinSelect
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
