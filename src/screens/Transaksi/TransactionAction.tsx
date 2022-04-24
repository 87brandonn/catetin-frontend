import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import CatetinInput from '../../components/molecules/Input';

interface ITransactionAction {
  searchValue: string;
  onClickPlus: () => void;
  onClickFilter: () => void;
  onChangeSearch: (search: string) => void;
}
function TransactionAction({ onClickPlus, onClickFilter, onChangeSearch, searchValue }: ITransactionAction) {
  return (
    <View style={tw`pb-2 px-3 flex flex-row justify-between items-center`}>
      <View style={tw`flex-grow-1 mr-3`}>
        <CatetinInput
          style={tw`border-0 bg-gray-100 px-3 py-2 rounded-[12px]`}
          placeholder="Search"
          onChangeText={(value) => {
            onChangeSearch(value);
          }}
          value={searchValue}
        />
      </View>
      <View style={tw`mr-3`}>
        <TouchableOpacity
          onPress={() => {
            onClickPlus();
          }}
        >
          <Icon name="plus" type="ant-design" tvParallaxProperties="" />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          onPress={() => {
            onClickFilter();
          }}
        >
          <Icon name="sort" type="material-icon" tvParallaxProperties="" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default TransactionAction;
