import BottomSheet from '@gorhom/bottom-sheet';
import { yupResolver } from '@hookform/resolvers/yup';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import chunk from 'lodash/chunk';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinBottomSheet from '../../components/molecules/BottomSheet';
import CatetinBottomSheetWrapper from '../../components/molecules/BottomSheet/BottomSheetWrapper';
import CatetinButton from '../../components/molecules/Button';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';
import { ICatetinBarang } from '../../types/barang';
import { ICatetinItemCategory } from '../../types/itemCategory';
import { ICatetinTransaksi, ICatetinTransaksiDetail } from '../../types/transaksi';
import TransactionAction from '../Transaksi/TransactionAction';
import AddKategoriSheet from './AddKategoriSheet';
import CreateModal from './BarangBottomSheet';
import BarangDetailBottomSheet from './BarangDetailBottomSheet';
import BarangFilterBottomSheet from './BarangFilterBottomSheet';
import BarangSortBottomSheet from './BarangSortBottomSheet';
import KategoriBarangSheet from './KategoriBarangSheet';

export interface IFormSchema {
  id: number;
  name: string;
  harga: number;
  stok: number;
  barang_picture: string | null;
  category: ICatetinItemCategory[];
  transactions: ICatetinTransaksi[];
}

const schema = yup.object().shape({
  id: yup.number(),
  name: yup.string().required('Nama barang is required'),
  harga: yup.number().typeError('Please input number').required('Harga is required'),
  stok: yup.number().required('Stok is required'),
  barang_picture: yup.mixed(),
  category: yup.mixed(),
  transactions: yup.mixed(),
});

function Barang() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<IFormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      id: 0,
      stok: 0,
      name: '',
      harga: 0,
      barang_picture: null,
      category: [],
      transactions: [],
    },
  });

  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const [loading, setLoading] = useState(false);
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

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetRefFilter = useRef<BottomSheet>(null);
  const bottomSheetRefDetail = useRef<BottomSheet>(null);

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

  const [loadDetail, setLoadDetail] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [barangTransaksi, setBarangTransaksi] = useState<
    | (ICatetinBarang & {
        ItemCategories: ICatetinItemCategory[];
        Transactions: (ICatetinTransaksi & {
          ItemTransaction: ICatetinTransaksiDetail;
        })[];
      })
    | null
  >(null);

  const handleEdit = (
    barang: ICatetinBarang & {
      ItemCategories: ICatetinItemCategory[];
      Transactions: ICatetinTransaksi[];
    },
  ) => {
    setValue('name', barang.name);
    setValue('harga', barang.price);
    setValue('id', barang.id);
    setValue('barang_picture', barang.picture);
    setValue('stok', barang.stock);
    setValue('category', barang.ItemCategories);
    setValue('transactions', barang.Transactions);
    bottomSheetRef.current?.expand();
  };

  const onPost = async (data: IFormSchema) => {
    await axiosCatetin.post(`/barang/${activeStore}`, {
      name: data.name,
      price: data.harga,
      picture: data.barang_picture,
      stock: data.stok,
      category: data.category.map((cat) => cat.id),
    });
  };

  const onPatch = async (data: IFormSchema) => {
    await axiosCatetin.put('/barang', {
      id: data.id,
      name: data.name,
      price: data.harga,
      picture: data.barang_picture,
      stock: data.stok,
      category: data.category.map((cat) => cat.id),
    });
  };

  const handleViewDetail = async (singleBarang: ICatetinBarang) => {
    try {
      setLoadDetail(true);
      bottomSheetRefDetail.current?.expand();
      const {
        data: { data: barangTransaksiData },
      } = await axiosCatetin.get(`/barang/${singleBarang.id}`, {
        params: {
          transaksi: true,
          category: true,
        },
      });
      setBarangTransaksi(barangTransaksiData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadDetail(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (data.id !== 0) {
        await onPatch(data);
      } else {
        await onPost(data);
      }
      reset({
        id: 0,
        name: '',
        harga: 0,
        stok: 0,
        barang_picture: null,
        category: [],
      });
      Toast.show({
        type: 'customToast',
        text2: `Berhasil ${data.id !== 0 ? 'memperbarui' : 'menambah'} barang`,
        position: 'bottom',
      });
      fetchBarang();
      bottomSheetRef?.current?.close();
    } catch (err: any) {
      Toast.show({
        type: 'customToast',
        text2: err.response?.data?.message,
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await axiosCatetin.delete(`/barang/${watch('id')}`);
      bottomSheetRef?.current?.close();
      Toast.show({
        type: 'customToast',
        text2: 'Berhasil menghapus barang',
        position: 'bottom',
      });
      fetchBarang();
    } catch (err: any) {
      Toast.show({
        type: 'customToast',
        text2: err.response?.data?.message,
        position: 'bottom',
      });
    } finally {
      setLoadingDelete(false);
    }
  };
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
                reset({
                  id: 0,
                  name: '',
                  harga: 0,
                  stok: 0,
                  barang_picture: null,
                  category: [],
                });
                bottomSheetRef.current?.expand();
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
