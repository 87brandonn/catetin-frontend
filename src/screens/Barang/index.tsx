import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import chunk from 'lodash/chunk';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';
import { ICatetinBarang } from '../../types/barang';
import { ICatetinItemCategory } from '../../types/itemCategory';
import { ICatetinTransaksi } from '../../types/transaksi';
import TransactionAction from '../Transaksi/TransactionAction';
import BarangFilterBottomSheet from './BarangFilterBottomSheet';

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

  const [originalBarang, setOriginalBarang] = useState<
    (ICatetinBarang & {
      ItemCategories: ICatetinItemCategory[];
      Transactions: ICatetinTransaksi[];
    })[]
  >([]);
  const [barang, setBarang] = useState<
    (ICatetinBarang & {
      ItemCategories: ICatetinItemCategory[];
      Transactions: ICatetinTransaksi[];
    })[]
  >([]);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [params, setParams] = useState<{
    nama_barang: string;
    sort: string | undefined;
    transactionId: number | undefined;
  }>({
    nama_barang: '',
    sort: undefined,
    transactionId: undefined,
  });

  const bottomSheetRefFilter = useRef<BottomSheet>(null);

  const fetchBarang = useCallback(
    async (isRefreshing = false) => {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoadingFetch(true);
      }
      try {
        const {
          data: { data },
        } = await axiosCatetin.get(`/barang/${activeStore}/list`, {
          params,
        });
        setOriginalBarang(data);
        setBarang(data);
      } catch (err: any) {
        CatetinToast(err?.response?.status, 'error', 'Terjadi kesalahan. Gagal mengambil data barang.');
      } finally {
        if (isRefreshing) {
          setRefreshing(false);
        } else {
          setLoadingFetch(false);
        }
      }
    },
    [activeStore, params],
  );

  const navigation = useNavigation();

  useEffect(() => {
    fetchBarang();
  }, [fetchBarang]);

  return (
    <AppLayout headerTitle="Barang">
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
        ) : originalBarang?.length === 0 ? (
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
        ) : barang?.length === 0 ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <Text style={tw`font-semibold text-2xl mb-1`}>Barang tidak ditemukan</Text>
          </View>
        ) : (
          <CatetinScrollView
            style={tw`flex-1 py-3 px-3`}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchBarang(true)} />}
          >
            <View style={tw`flex-1`}>
              {barang.map((singleBarang) => (
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
                      <Text style={tw``}>
                        <Text style={tw`font-bold ${singleBarang.stock <= 10 ? 'text-red-500' : ''}`}>
                          {singleBarang.stock}
                        </Text>{' '}
                        pcs tersisa
                      </Text>
                    </View>
                    <View>
                      <Text style={tw``}>IDR {singleBarang.price.toLocaleString('id-ID')}</Text>
                    </View>
                  </View>

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
                        type="antdesign"
                        size={24}
                        tvParallaxProperties=""
                      ></Icon>
                    </TouchableOpacity>
                  </View>
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
