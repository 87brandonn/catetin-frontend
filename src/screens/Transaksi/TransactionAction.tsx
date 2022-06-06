import BottomSheet from '@gorhom/bottom-sheet';
import React, { useRef } from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import DocumentPicker, { types } from 'react-native-document-picker';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import CatetinBottomSheet from '../../components/molecules/BottomSheet';
import CatetinBottomSheetWrapper from '../../components/molecules/BottomSheet/BottomSheetWrapper';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import { RootState } from '../../store';

interface ITransactionAction {
  searchValue: string;
  onClickPlus: () => void;
  onClickFilter: () => void;
  onChangeSearch: (search: string) => void;
  showImport?: boolean;
  onPressImport?: () => void;
}
function TransactionAction({
  onClickPlus,
  showImport = false,
  onClickFilter,
  onChangeSearch,
  searchValue,
  onPressImport = () => ({}),
}: ITransactionAction) {
  return (
    <View style={tw`pb-2 pt-2 px-3 flex flex-row justify-between items-center`}>
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
      {showImport && (
        <View style={tw`mr-3`}>
          <TouchableOpacity
            onPress={() => {
              onPressImport();
            }}
          >
            <Icon size={22} name="upload" type="feather" tvParallaxProperties="" />
          </TouchableOpacity>
        </View>
      )}
      <View style={tw`mr-3`}>
        <TouchableOpacity
          onPress={() => {
            onClickPlus();
          }}
        >
          <Icon size={22} name="plus" type="ant-design" tvParallaxProperties="" />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          onPress={() => {
            onClickFilter();
          }}
        >
          <Icon size={22} name="filter" type="ant-design" tvParallaxProperties="" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default TransactionAction;
