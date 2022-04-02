import { BottomSheetModal } from '@gorhom/bottom-sheet';
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
import { ICatetinTransaksi } from '../../types/transaksi';
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
export interface IFormSchema {
  id: number;
  name: string;
  tipe: ICatetinTipeTransaksi | null | undefined;
  tanggal: Date;
  barang: null | ICatetinBarang[];
  deskripsi: string;
}
const schema = yup.object().shape({
  id: yup.number(),
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
      id: 0,
      name: '',
      tipe: null,
      tanggal: new Date(),
      barang: null,
      deskripsi: '',
    },
  });

  const screenAOptions = useMemo(() => ({ headerLeft: () => null }), []);

  const [loading, setLoading] = useState(false);
  const [barang, setBarang] = useState<ICatetinBarang[] | null>(null);
  const [loadingFetch, setLoadingFetch] = useState(true);

  const [showOptions, setShowOptions] = useState(false);
  const [showOptionsBarang, setShowOptionsBarang] = useState(false);

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

  const [barangAmount, setBarangAmount] = useState<Record<string, number>>({});

  const [transaksi, setTransaksi] = useState<ICatetinTransaksi[] | null>(null);

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

  useEffect(() => {
    let isMounted = true;
    fetchTransaksi(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchTransaksi]);

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  const [total, setTotal] = useState(0);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const bottomSheetRefFilter = useRef<BottomSheetModal>(null);

  useEffect(() => {
    let newTotal = 0;
    watch('barang')?.forEach((barang: ICatetinBarang) => {
      newTotal += (barangAmount[barang.barang_id] || 1) * barang.harga;
    });
    setTotal(newTotal);
  }, [barangAmount, watch('barang')]);

  const onSubmit = async (data: IFormSchema) => {
    setLoading(true);
    let total = 0;
    data.barang?.forEach((barang: ICatetinBarang) => {
      total += barangAmount[barang.barang_id] * barang.harga;
    });
    const finalData = {
      title: data.name,
      barang: data.barang?.map(({ barang_id }) => ({ barang_id, amount: barangAmount[barang_id] || 1 })) || [],
      tipe_transaksi: data.tipe?.value,
      tanggal: moment(data.tanggal).format('YYYY-MM-DD HH:mm:ss'),
      notes: data.deskripsi,
      total,
    };
    try {
      await axiosCatetin.post('/transaksi', finalData, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setLoading(false);
      setBarangAmount({});
      bottomSheetRef?.current?.close();
      fetchTransaksi();
    } catch (err: any) {
      setLoading(false);
      console.error(err?.response?.data?.message || 'Failed to post');
    }
  };

  const onSelectBarangOption = (option: ICatetinBarang) => {
    setShowOptionsBarang(!showOptionsBarang);
    let cloneBarang: ICatetinBarang[] = [...(watch('barang') || [])];
    if (cloneBarang.some((barang) => barang.barang_id === option.barang_id)) {
      cloneBarang = cloneBarang.filter((barang) => barang.barang_id !== option.barang_id);
    } else {
      cloneBarang.push(option);
    }
    return cloneBarang;
  };
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  const handleEdit = (transaksi: ICatetinTransaksi) => {
    console.log(transaksi);
    setValue('id', transaksi.transaksi_id);
    setValue('name', transaksi.title);
    setValue(
      'tipe',
      optionsTransaksi.find((option) => option.value === transaksi.tipe_transaksi),
    );
    setValue('tanggal', moment(transaksi.tanggal).toDate());
    setValue('deskripsi', transaksi.notes);
    setValue('barang', null);
    bottomSheetRef.current?.present();
  };

  return (
    <AppLayout headerTitle="Transaksi">
      <BottomSheetModal
        ref={bottomSheetRef}
        index={1}
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
                    total={total}
                    {...props}
                  />
                </TransactionBottomSheetWrapper>
              )}
            </Stack.Screen>
            <Stack.Screen name="Transaction Date">
              {(props) => (
                <TransactionBottomSheetWrapper title="Transaction Date" showBack>
                  <InputDateScreen value={watch('tanggal')} onChange={(date) => setValue('tanggal', date)} {...props} />
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
                    show={showOptions}
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
                    onChange={(value) => setValue('barang', value)}
                    show={showOptions}
                    onSelectBarang={onSelectBarangOption}
                    onChangeBarangAmount={(value, id) => {
                      setBarangAmount((prevBarangAmt) => ({
                        ...prevBarangAmt,
                        [id]: parseInt(value, 10),
                      }));
                    }}
                    amountBarang={barangAmount}
                    {...props}
                  />
                </TransactionBottomSheetWrapper>
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </BottomSheetModal>
      <BottomSheetModal
        ref={bottomSheetRefFilter}
        index={1}
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
      </BottomSheetModal>
      <View style={tw`pb-2 px-3 flex flex-row justify-between items-center`}>
        <View style={tw`flex-grow-1 mr-3`}>
          <TextInput style={tw`bg-gray-100 px-3 py-2 rounded-[12px]`} placeholder="Search" />
        </View>
        <View style={tw`mr-3`}>
          <TouchableOpacity
            onPress={() => {
              reset({ id: 0, name: '', tipe: null, tanggal: new Date(), barang: null, deskripsi: '' });
              bottomSheetRef.current?.present();
            }}
          >
            <Icon name="plus" type="ant-design" tvParallaxProperties="" />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              bottomSheetRefFilter.current?.present();
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
                  <Text style={tw`text-3`}>{moment(parseInt(eachTransaksi.tanggal, 10)).format('DD/MM/YYYY')}</Text>
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
