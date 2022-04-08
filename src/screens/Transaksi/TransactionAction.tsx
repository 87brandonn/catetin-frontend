import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';

interface ITransactionAction {
  onClickPlus: () => void;
  onClickFilter: () => void;
}
function TransactionAction({ onClickPlus, onClickFilter }: ITransactionAction) {
  return (
    <View style={tw`pb-2 px-3 flex flex-row justify-between items-center`}>
      <View style={tw`flex-grow-1 mr-3`}>
        <TextInput style={tw`bg-gray-100 px-3 py-2 rounded-[12px]`} placeholder="Search" />
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
