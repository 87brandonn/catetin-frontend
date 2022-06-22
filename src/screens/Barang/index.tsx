import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import chunk from 'lodash/chunk';
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import DocumentPicker, { types } from 'react-native-document-picker';
import tw from 'twrnc';
import CatetinBottomSheet from '../../components/molecules/BottomSheet';
import CatetinBottomSheetWrapper from '../../components/molecules/BottomSheet/BottomSheetWrapper';
import CatetinButton from '../../components/molecules/Button';
import { useAppSelector } from '../../hooks';
import useBarang from '../../hooks/useBarang';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';
import { ICatetinItemCategory } from '../../types/itemCategory';
import { ICatetinTransaksi } from '../../types/transaksi';
import TransactionAction from '../Transaksi/TransactionAction';
import BarangFilterBottomSheet from './BarangFilterBottomSheet';
import CatetinToast from '../../components/molecules/Toast';
import useProfile from '../../hooks/useProfile';
import useStore from '../../hooks/useStore';
export interface IFormSchema {
  id: number;
  name: string;
  harga: number;
  stok: number;
  barang_picture: string | null;
  category: ICatetinItemCategory[];
  transactions: ICatetinTransaksi[];
}

function Barang() {
  const { activeStore } = useAppSelector((state: RootState) => state.store);
  const { accessToken } = useAppSelector((state: RootState) => state.auth);

  const [params, setParams] = useState<{
    nama_barang: string;
    categories: number[] | undefined;
    harga: number[] | undefined;
    stok: number[] | undefined;
  }>({
    nama_barang: '',
    categories: undefined,
    harga: undefined,
    stok: undefined,
  });

  const bottomSheetRefFilter = useRef<BottomSheet>(null);
  const bottomSheetRefImport = useRef<BottomSheet>(null);

  const { data: barang, isLoading: loadingFetch, isRefetching: refreshing, refetch } = useBarang(activeStore, params);

  const { data: userStoreData, isLoading: loadingUserStore } = useStore();

  const grantData = useMemo(
    () => userStoreData?.find((data) => data.StoreId === activeStore),
    [activeStore, userStoreData],
  );

  const { data: profileData, isLoading: loadingProfile } = useProfile();

  const navigation = useNavigation();

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
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      });
      CatetinToast(200, 'default', 'Berhasil menambah data barang');
      bottomSheetRefImport.current?.close();
    } catch (err: any) {
      if (err?.code !== 'DOCUMENT_PICKER_CANCELED') {
        CatetinToast(err?.response?.status, 'error', 'Failed to upload data');
      }
    }
  };

  return (
    <AppLayout headerTitle="Barang">
      <CatetinBottomSheet bottomSheetRef={bottomSheetRefImport}>
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
      <BarangFilterBottomSheet
        bottomSheetRefFilter={bottomSheetRefFilter}
        onApplyFilter={(data) => {
          bottomSheetRefFilter.current?.close();
          setParams((prevParams) => ({
            ...prevParams,
            ...data,
          }));
        }}
      />

      <TransactionAction
        onClickPlus={() => {
          navigation.navigate('CreateBarangScreen', {
            data: {
              id: 0,
              name: '',
              harga: 0,
              stok: 0,
              barang_picture: null,
              category: [],
            },
          });
        }}
        onClickFilter={() => {
          bottomSheetRefFilter.current?.expand();
        }}
        showImport
        onPressImport={() => {
          bottomSheetRefImport.current?.expand();
        }}
        onChangeSearch={(value) => {
          setParams((prevParams) => ({
            ...prevParams,
            nama_barang: value,
          }));
        }}
        searchValue={params.nama_barang}
      />

      <View style={tw`flex-1`}>
        {loadingFetch ? (
          <ActivityIndicator color="#2461FF" />
        ) : barang?.length === 0 ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <Text style={tw`font-semibold text-2xl mb-1`}>Tidak ada barang</Text>
            <CatetinButton
              title="Tambah Barang"
              onPress={() => {
                navigation.navigate('CreateBarangScreen', {
                  data: {
                    id: 0,
                    name: '',
                    harga: 0,
                    stok: 0,
                    barang_picture: null,
                    category: [],
                  },
                });
              }}
            />
          </View>
        ) : (
          <CatetinScrollView
            style={tw`flex-1 py-3 px-3`}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refetch()} />}
          >
            <View style={tw`flex-1`}>
              {barang?.map((singleBarang) => (
                <TouchableOpacity
                  style={tw`py-2 flex-1 flex flex-row`}
                  key={singleBarang.id}
                  onPress={() => {
                    navigation.navigate('DetailBarangScreen', {
                      id: singleBarang.id,
                      title: singleBarang.name,
                    });
                  }}
                >
                  {singleBarang.picture ? (
                    <View style={tw`shadow-lg`}>
                      <Image
                        source={{
                          uri: singleBarang?.picture || undefined,
                        }}
                        style={tw`w-[120px] h-[120px] rounded-lg mb-1`}
                      ></Image>
                    </View>
                  ) : (
                    <Icon
                      name="camera"
                      size={120}
                      iconStyle={tw`text-gray-300`}
                      type="feather"
                      tvParallaxProperties=""
                    />
                  )}
                  <View style={tw`flex-1 self-center ml-3`}>
                    <View style={tw`mb-1`}>
                      <Text style={tw`font-medium`}>{singleBarang.name}</Text>
                    </View>
                    <View>
                      {singleBarang.ItemCategories.length > 0 && (
                        <View>
                          {chunk(singleBarang.ItemCategories, 2).map((catChunk, index) => (
                            <View style={tw`flex flex-row mb-1`} key={index}>
                              {catChunk.map((cat) => (
                                <View key={cat.id} style={tw`mr-1 bg-gray-200 px-2 py-1 rounded-lg`}>
                                  <Text style={tw`text-[12px]`}>
                                    {cat.name.slice(0, 5)}
                                    {cat.name.length > 5 && '..'}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                    <View>
                      <Text style={tw`mb-1`}>
                        <Text style={tw`font-bold ${singleBarang.stock <= 10 ? 'text-red-500' : ''}`}>
                          {singleBarang.stock}
                        </Text>{' '}
                        pcs tersisa
                      </Text>
                    </View>
                    <View>
                      <Text style={tw``}>IDR {singleBarang.price.toLocaleString('id-ID')}</Text>
                    </View>
                    {singleBarang.User?.email && (
                      <View>
                        <Text style={tw`text-gray-400`}>{singleBarang.User?.email}</Text>
                      </View>
                    )}
                  </View>

                  {(profileData?.id === singleBarang?.UserId || grantData?.grant === 'owner') && (
                    <View style={tw`flex flex-row self-center`}>
                      <TouchableOpacity
                        style={tw`bg-gray-200 shadow rounded px-3 py-1`}
                        onPress={() => {
                          navigation.navigate('CreateBarangScreen', {
                            data: singleBarang,
                          });
                        }}
                      >
                        <Icon
                          name="edit"
                          iconStyle={tw`text-gray-500`}
                          type="feather"
                          size={24}
                          tvParallaxProperties=""
                        ></Icon>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </CatetinScrollView>
        )}
      </View>
    </AppLayout>
  );
}

export default Barang;
