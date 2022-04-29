import BottomSheet from '@gorhom/bottom-sheet';
import React, { useRef } from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import DocumentPicker, { types } from 'react-native-document-picker';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
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
}
function TransactionAction({
  onClickPlus,
  showImport = false,
  onClickFilter,
  onChangeSearch,
  searchValue,
}: ITransactionAction) {
  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const handleUploadCSV = async () => {
    try {
      const data = await DocumentPicker.pickSingle({
        type: [types.xlsx, types.xls, types.csv],
      });
      const form: any = new FormData();
      form.append('file', {
        uri: Platform.OS === 'android' ? data.uri : data.uri?.replace('file://', ''),
        type: data.type,
        name: data.name,
      });
      await fetch(`https://catetin-be.herokuapp.com/barang/import/${activeStore}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: form,
      });
      CatetinToast('default', 'Berhasil menambah data barang');
      bottomSheetRef.current?.close();
    } catch (err: any) {
      if (err?.code !== 'DOCUMENT_PICKER_CANCELED') {
        CatetinToast('error', 'Failed to upload data');
      }
    }
  };
  const bottomSheetRef = useRef<BottomSheet>(null);
  return (
    <View style={tw`pb-2 px-3 flex flex-row justify-between items-center`}>
      {showImport && (
        <CatetinBottomSheet bottomSheetRef={bottomSheetRef}>
          <CatetinBottomSheetWrapper title="Import Data" single>
            <View style={tw`flex-row flex justify-center shadow-lg px-4 py-3 bg-gray-200 rounded-lg mb-2`}>
              <Image source={require('./TemplateCSV.png')} style={tw`w-[300px] h-[300px] rounded-xl`} />
            </View>
            <Text style={tw`font-medium mb-4`}>
              Note: Pastikan file excel yang di upload sudah sesuai dengan format diatas.
            </Text>
            <CatetinButton
              title="Browse File"
              onPress={async () => {
                handleUploadCSV();
              }}
            />
          </CatetinBottomSheetWrapper>
        </CatetinBottomSheet>
      )}
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
              bottomSheetRef.current?.expand();
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
