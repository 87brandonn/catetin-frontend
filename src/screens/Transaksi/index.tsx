import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { yupResolver } from '@hookform/resolvers/yup';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, AsyncStorage, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { TextInput } from 'react-native-gesture-handler';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { ICatetinBarang } from '../../types/barang';
import { ICatetinTransaksiWithDetail } from '../../types/transaksi';
import { screenOptions, titleCase } from '../../utils';
import BarangScreen from './TransactionBarang';
import CreateModal from './TransactionBottomSheet';
import TransactionBottomSheetWrapper from './TransactionBottomSheetWrapper';
import InputDateScreen from './TransactionDate';
import TransactionTypeScreen from './TransactionType';

const Stack = createStackNavigator();
export interface ICatetinTipeTransaksi {
  label: string;
  value: number;
}

export interface IBarangPayload extends ICatetinBarang {
  amount: number | string;
  active: boolean;
}
export interface IFormSchema {
  transaksi_id: number;
  name: string;
  tipe: ICatetinTipeTransaksi | null | undefined;
  tanggal: Date;
  barang: null | IBarangPayload[];
  deskripsi: string;
}
const schema = yup.object().shape({
  transaksi_id: yup.number(),
  name: yup.string().required('Nama transaksi is required'),
  tipe: yup.mixed().required('Tipe transaksi is required'),
  tanggal: yup.date().required('Tanggal transaksi is required'),
  barang: yup.mixed().when('tipe', {
    is: (tipe: ICatetinTipeTransaksi) => tipe?.value === 3 || tipe?.value === 4,
    then: (rule) => rule.required('Barang is required'),
  }),
  deskripsi: yup.string(),
});

function Transaksi() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<IFormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      transaksi_id: 0,
      name: '',
      tipe: null,
      tanggal: new Date(),
      barang: null,
      deskripsi: '',
    },
  });

  const screenAOptions = useMemo(() => ({ headerLeft: () => null }), []);

  const [loading, setLoading] = useState(false);
  const [barang, setBarang] = useState<ICatetinBarang[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(true);

  const [showOptions, setShowOptions] = useState(false);

  const fetchBarang = useCallback(async (isMounted = true) => {
    setLoadingFetch(true);
    try {
      const {
        data: { barang },
      } = await axiosCatetin.get('/barang', {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      if (isMounted) {
        setBarang(barang);
        setLoadingFetch(false);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchBarang(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchBarang]);

  const optionsTransaksi = [
    {
      label: 'Pengeluaran',
      value: 1,
    },
    {
      label: 'Pemasukan',
      value: 2,
    },
    {
      label: 'Penjualan',
      value: 3,
    },
    {
      label: 'Pembelian barang',
      value: 4,
    },
  ];

  const [loadingTransaksi, setLoadingTransaksi] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [transaksi, setTransaksi] = useState<ICatetinTransaksiWithDetail[] | null>(null);

  const fetchTransaksi = useCallback(async (isMounted = true) => {
    setLoadingTransaksi(true);
    try {
      const { data } = await axiosCatetin.get('/transaksi', {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      console.log(data);
      if (isMounted) {
        setTransaksi(data);
        setLoadingTransaksi(false);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await axiosCatetin.delete(`/transaksi/${watch('transaksi_id')}`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      bottomSheetRef.current?.close();
      fetchTransaksi();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDelete(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchTransaksi(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchTransaksi]);

  useEffect(() => {
    console.log(watch('barang'));
  }, [watch]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetRefFilter = useRef<BottomSheet>(null);

  const onSubmit = async (data: IFormSchema) => {
    setLoading(true);
    let total = 0;
    const barangFiltered = (data.barang || []).filter((barang) => barang.active === true);
    barangFiltered.forEach((barang) => {
      total += Number(barang.amount || 0) * barang.harga;
    });
    const finalData = {
      title: data.name,
      barang: barangFiltered.map(({ barang_id, amount }) => ({ barang_id, amount: amount || 1 })) || [],
      tipe_transaksi: data.tipe?.value,
      tanggal: moment(data.tanggal).toISOString(),
      notes: data.deskripsi,
      total,
      transaksi_id: data.transaksi_id,
    };
    console.log(finalData);
    try {
      if (finalData.transaksi_id === 0) {
        await axiosCatetin.post('/transaksi', finalData, {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          },
        });
      } else {
        await axiosCatetin.put('/transaksi', finalData, {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          },
        });
      }
      setLoading(false);
      bottomSheetRef?.current?.close();
      fetchTransaksi();
    } catch (err: any) {
      setLoading(false);
      console.error(err?.response?.data?.message || 'Failed to post');
    }
  };

  const getTotalValue = () => {
    let total = 0;
    const barangFiltered = watch('barang')?.filter((barang) => barang.active === true);
    barangFiltered?.forEach((barang) => {
      total += Number(barang.amount || 1) * barang.harga;
    });
    return total;
  };

  const handleClickBarang = (barang: ICatetinBarang) => {
    const cloneBarang = [...(watch('barang') || [])];
    const indexBarang = cloneBarang.findIndex((item) => item.barang_id === barang.barang_id);
    if (indexBarang === -1) {
      cloneBarang.push({
        ...barang,
        amount: 0,
        active: true,
      });
    } else {
      cloneBarang[indexBarang].active = !cloneBarang[indexBarang].active;
    }
    setValue('barang', cloneBarang);
  };

  const handleChangeBarangAmount = (value: string, barang: ICatetinBarang) => {
    console.log(value);
    const cloneBarangData = [...(watch('barang') || [])];
    const atIndex = cloneBarangData.findIndex((item) => item.barang_id === barang.barang_id);
    console.log(cloneBarangData, atIndex);
    if (atIndex === -1) {
      cloneBarangData.push({
        ...barang,
        amount: parseInt(value, 10) || '',
        active: false,
      });
    }
    if (cloneBarangData[atIndex]) {
      cloneBarangData[atIndex].amount = parseInt(value, 10) || '';
    }
    setValue('barang', cloneBarangData);
  };
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  const handleEdit = (transaksi: ICatetinTransaksiWithDetail) => {
    setValue('transaksi_id', transaksi.transaksi_id);
    setValue('name', transaksi.title);
    setValue(
      'tipe',
      optionsTransaksi.find((option) => option.value === transaksi.tipe_transaksi),
    );
    setValue('tanggal', moment(transaksi.tanggal).toDate());
    setValue('deskripsi', transaksi.notes);
    if (transaksi.tipe_transaksi === 3 || transaksi.tipe_transaksi === 4) {
      const barangData = transaksi.transaksi_detail.map((transaksi) => ({
        amount: transaksi.amount,
        active: true,
        barang_id: transaksi.barang_id,
        created_at: transaksi.created_at,
        harga: transaksi.harga,
        nama_barang: transaksi.nama_barang,
        stok: transaksi.stok,
        updated_at: transaksi.updated_at,
        user_id: transaksi.user_id,
      }));
      setValue('barang', barangData);
    }
    bottomSheetRef.current?.expand();
  };

  return (
    <AppLayout headerTitle="Transaksi">
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          backgroundStyle={tw`bg-white shadow-lg`}
          enablePanDownToClose
        >
          <NavigationContainer independent={true}>
            <Stack.Navigator screenOptions={screenOptions as StackNavigationOptions}>
              <Stack.Screen name="Transaction Default" options={screenAOptions}>
                {(props) => (
                  <TransactionBottomSheetWrapper title="Create Transaksi">
                    <CreateModal
                      control={control}
                      errors={errors}
                      watch={watch}
                      loading={loading}
                      onSave={() => handleSubmit(onSubmit)()}
                      total={getTotalValue()}
                      showDelete={watch('transaksi_id') !== 0}
                      loadingDelete={loadingDelete}
                      onDelete={() => handleDelete()}
                      {...props}
                    />
                  </TransactionBottomSheetWrapper>
                )}
              </Stack.Screen>
              <Stack.Screen name="Transaction Date">
                {(props) => (
                  <TransactionBottomSheetWrapper title="Transaction Date" showBack>
                    <InputDateScreen
                      value={watch('tanggal')}
                      onChange={(date) => setValue('tanggal', date)}
                      {...props}
                    />
                  </TransactionBottomSheetWrapper>
                )}
              </Stack.Screen>
              <Stack.Screen name="Transaction Type">
                {(props) => (
                  <TransactionBottomSheetWrapper title="Transaction Type" showBack>
                    <TransactionTypeScreen
                      selected={watch('tipe')}
                      onChange={(opt: ICatetinTipeTransaksi) => {
                        setValue('tipe', opt);
                      }}
                      options={optionsTransaksi}
                      {...props}
                    />
                  </TransactionBottomSheetWrapper>
                )}
              </Stack.Screen>
              <Stack.Screen name="Transaction Barang">
                {(props) => (
                  <TransactionBottomSheetWrapper title="Transaction Barang" showBack>
                    <BarangScreen
                      options={barang}
                      value={watch('barang')}
                      onChange={handleClickBarang}
                      onChangeBarangAmount={handleChangeBarangAmount}
                      {...props}
                    />
                  </TransactionBottomSheetWrapper>
                )}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
        </BottomSheet>
      </Portal>
      <Portal>
        <BottomSheet
          ref={bottomSheetRefFilter}
          index={-1}
          snapPoints={snapPoints}
          backgroundStyle={tw`bg-white shadow-lg`}
          enablePanDownToClose
        >
          <View style={tw`flex-1 px-3`}>
            <Text style={tw`text-xl text-center font-bold mb-3`}>Sort</Text>
            {Object.keys(transaksi?.[0] || {}).map((field) => (
              <TouchableOpacity key={field}>
                <View style={tw`flex flex-row justify-between px-4`}>
                  <View style={tw`py-3 mb-2 rounded-[12px]`}>
                    <Text>{titleCase(field)}</Text>
                  </View>
                  <View>
                    <Icon name="sort-desc" type="font-awesome" iconStyle={tw`text-gray-200`} tvParallaxProperties="" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheet>
      </Portal>

      <View style={tw`pb-2 px-3 flex flex-row justify-between items-center`}>
        <View style={tw`flex-grow-1 mr-3`}>
          <TextInput style={tw`bg-gray-100 px-3 py-2 rounded-[12px]`} placeholder="Search" />
        </View>
        <View style={tw`mr-3`}>
          <TouchableOpacity
            onPress={() => {
              reset({ transaksi_id: 0, name: '', tipe: null, tanggal: new Date(), barang: null, deskripsi: '' });
              bottomSheetRef.current?.expand();
            }}
          >
            <Icon name="plus" type="ant-design" tvParallaxProperties="" />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              bottomSheetRefFilter.current?.expand();
            }}
          >
            <Icon name="sort" type="material-icon" tvParallaxProperties="" />
          </TouchableOpacity>
        </View>
      </View>
      <CatetinScrollView style={tw`flex-1 px-3`}>
        <View style={tw`flex-1 py-5`}>
          {loadingTransaksi ? (
            <ActivityIndicator />
          ) : (
            transaksi?.map((eachTransaksi) => (
              <TouchableOpacity
                style={tw`shadow-lg bg-white rounded-[12px] px-3 py-2 mb-2 flex flex-row justify-between`}
                key={eachTransaksi.transaksi_id}
                onPress={() => handleEdit(eachTransaksi)}
              >
                <View>
                  <Text style={tw`font-bold text-xl`}>{eachTransaksi.title}</Text>
                  <Text style={tw`font-500 text-lg`}>IDR {eachTransaksi.nominal_transaksi?.toLocaleString()}</Text>
                  <Text style={tw``}>Notes : {eachTransaksi.notes}</Text>
                </View>
                <View>
                  <Text style={tw`text-3`}>{moment(eachTransaksi.tanggal).format('DD/MM/YYYY')}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default Transaksi;
