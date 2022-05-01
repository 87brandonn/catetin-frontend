import BottomSheet from '@gorhom/bottom-sheet';
import { yupResolver } from '@hookform/resolvers/yup';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import chunk from 'lodash/chunk';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Icon } from 'react-native-elements';
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
import KategoriBarangSheet from './KategoriBarangSheet';

export interface IFormSchema {
  id: number;
  name: string;
  harga: number;
  stok: number;
  barang_picture: string | null;
  category: ICatetinItemCategory[];
}

const schema = yup.object().shape({
  id: yup.number(),
  name: yup.string().required('Nama barang is required'),
  harga: yup.number().typeError('Please input number').required('Harga is required'),
  stok: yup.number().required('Stok is required'),
  barang_picture: yup.mixed(),
  category: yup.mixed(),
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
    },
  });

  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const [loading, setLoading] = useState(false);
  const [barang, setBarang] = useState<
    (ICatetinBarang & {
      ItemCategories: ICatetinItemCategory[];
    })[]
  >([]);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { accessToken } = useAppSelector((state: RootState) => state.auth);

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
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log('Barang', data);
        setBarang(data);
      } catch (err) {
        CatetinToast('error', 'Terjadi kesalahan. Gagal mengambil data barang.');
      } finally {
        if (isRefreshing) {
          setRefreshing(false);
        } else {
          setLoadingFetch(false);
        }
      }
    },
    [accessToken, activeStore, params],
  );

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
    },
  ) => {
    setValue('name', barang.name);
    setValue('harga', barang.price);
    setValue('id', barang.id);
    setValue('barang_picture', barang.picture);
    setValue('stok', barang.stock);
    setValue('category', barang.ItemCategories);
    bottomSheetRef.current?.expand();
  };

  const onPost = async (data: IFormSchema) => {
    await axiosCatetin.post(
      `/barang/${activeStore}`,
      {
        name: data.name,
        price: data.harga,
        picture: data.barang_picture,
        stock: data.stok,
        category: data.category.map((cat) => cat.id),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  };

  const onPatch = async (data: IFormSchema) => {
    await axiosCatetin.put(
      '/barang',
      {
        id: data.id,
        name: data.name,
        price: data.harga,
        picture: data.barang_picture,
        stock: data.stok,
        category: data.category.map((cat) => cat.id),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
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
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
      await axiosCatetin.delete(`/barang/${watch('id')}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
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
  const Stack = createStackNavigator();
  return (
    <AppLayout headerTitle="Barang">
      <CatetinBottomSheet bottomSheetRef={bottomSheetRef}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Create Barang">
              {(props) => (
                <CatetinBottomSheetWrapper {...props} title="Create Barang">
                  <CreateModal
                    {...props}
                    control={control}
                    errors={errors}
                    watch={watch}
                    loading={loading}
                    onSave={() => handleSubmit(onSubmit)()}
                    onDelete={() => handleDelete()}
                    title="Create Barang"
                    loadingDelete={loadingDelete}
                  />
                </CatetinBottomSheetWrapper>
              )}
            </Stack.Screen>
            <Stack.Screen name="Kategori Barang">
              {(props) => (
                <CatetinBottomSheetWrapper {...props} title="Kategori Barang" showBack to="Create Barang">
                  <KategoriBarangSheet
                    {...props}
                    data={watch('category')}
                    onSave={(data) => {
                      setValue('category', data);
                    }}
                  />
                </CatetinBottomSheetWrapper>
              )}
            </Stack.Screen>
            <Stack.Screen name="Add Category">
              {(props) => (
                <CatetinBottomSheetWrapper {...props} title="Add Category" showBack to="Kategori Barang">
                  <AddKategoriSheet {...props} />
                </CatetinBottomSheetWrapper>
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </CatetinBottomSheet>

      <CatetinBottomSheet bottomSheetRef={bottomSheetRefFilter}>
        <CatetinBottomSheetWrapper single title="Sort">
          <BarangFilterBottomSheet
            onResetSort={(query) => {
              bottomSheetRefFilter.current?.close();
              setParams((prevParams) => ({
                ...prevParams,
                sort: query,
              }));
            }}
            sortData={params.sort}
            onApplySort={(query) => {
              bottomSheetRefFilter.current?.close();
              setParams((prevParams) => ({
                ...prevParams,
                sort: query,
              }));
            }}
          />
        </CatetinBottomSheetWrapper>
      </CatetinBottomSheet>

      <CatetinBottomSheet bottomSheetRef={bottomSheetRefDetail}>
        <CatetinBottomSheetWrapper single title="Detail Barang">
          <BarangDetailBottomSheet data={barangTransaksi} loading={loadDetail} />
        </CatetinBottomSheetWrapper>
      </CatetinBottomSheet>

      <TransactionAction
        onClickPlus={() => {
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
          <ActivityIndicator />
        ) : barang?.length === 0 ? (
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
        ) : (
          <CatetinScrollView
            style={tw`flex-1 py-3 px-3`}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchBarang(true)} />}
          >
            {barang.map((singleBarang) => (
              <Fragment key={singleBarang.id}>
                <View style={tw`px-3 py-2 mb-2 flex flex-row`}>
                  <View style={tw`mr-3`}>
                    <Avatar
                      size={64}
                      source={{
                        uri: singleBarang?.picture || undefined,
                      }}
                      avatarStyle={tw`rounded-[12px]`}
                      containerStyle={tw`bg-gray-300 rounded-[12px]`}
                      titleStyle={tw`text-gray-200`}
                    ></Avatar>
                  </View>
                  <View style={tw`flex-grow-1 flex-row justify-between`}>
                    <View>
                      <View>
                        <Text style={tw`text-[18px] mb-1 font-bold`}>{singleBarang.name}</Text>
                      </View>
                      {singleBarang.ItemCategories.length > 0 && (
                        <View>
                          {chunk(singleBarang.ItemCategories, 2).map((catChunk, index) => (
                            <View style={tw`flex flex-row mb-1`} key={index}>
                              {catChunk.map((cat) => (
                                <View key={cat.id} style={tw`mr-1 bg-gray-200 px-2 py-1 rounded-lg`}>
                                  <Text style={tw`text-[12px]`}>
                                    {cat.name.slice(0, 10)}
                                    {cat.name.length > 10 && '..'}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          ))}
                        </View>
                      )}
                      <View>
                        <Text style={tw`text-base`}>Stok: {singleBarang.stock}</Text>
                      </View>
                      <View>
                        <Text style={tw`text-base`}>IDR {singleBarang.price.toLocaleString()}</Text>
                      </View>
                    </View>
                    <View style={tw`flex flex-row self-center`}>
                      <TouchableOpacity
                        onPress={() => {
                          handleViewDetail(singleBarang);
                        }}
                      >
                        <Icon
                          name="eyeo"
                          iconStyle={tw`mr-2`}
                          type="antdesign"
                          size={24}
                          tvParallaxProperties=""
                        ></Icon>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          handleEdit(singleBarang);
                        }}
                      >
                        <Icon name="update" type="materialcommunity-icon" size={24} tvParallaxProperties=""></Icon>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Fragment>
            ))}
          </CatetinScrollView>
        )}
      </View>
    </AppLayout>
  );
}

export default Barang;
