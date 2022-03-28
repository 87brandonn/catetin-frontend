import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { yupResolver } from '@hookform/resolvers/yup';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions, TransitionPresets } from '@react-navigation/stack';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import PlusButton from '../../components/atoms/PlusButton';
import CatetinBottomSheet from '../../components/molecules/BottomSheet';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import { RootState } from '../../store';
import { ICatetinBarang } from '../../types/barang';
import { ICatetinTransaksi } from '../../types/transaksi';
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
  tipe: ICatetinTipeTransaksi | null;
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

  const screenOptions = useMemo<StackNavigationOptions>(
    () => ({
      ...TransitionPresets.SlideFromRightIOS,

      headerShown: false,
      safeAreaInsets: { top: 0 },
      cardStyle: {
        backgroundColor: 'white',
        overflow: 'visible',
      },
      headerMode: 'screen',
    }),
    [],
  );
  const screenAOptions = useMemo(() => ({ headerLeft: () => null }), []);

  const { accessToken } = useAppSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [barang, setBarang] = useState<ICatetinBarang[] | null>(null);
  const [loadingFetch, setLoadingFetch] = useState(true);

  const [showOptions, setShowOptions] = useState(false);
  const [showOptionsBarang, setShowOptionsBarang] = useState(false);

  const fetchBarang = useCallback(
    async (isMounted = true) => {
      setLoadingFetch(true);
      try {
        const {
          data: { barang },
        } = await axiosCatetin.get('/get/barang', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (isMounted) {
          setBarang(barang);
          setLoadingFetch(false);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [accessToken],
  );

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

  const fetchTransaksi = useCallback(
    async (isMounted = true) => {
      setLoadingTransaksi(true);
      try {
        const { data } = await axiosCatetin.get('/get/transaksi', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (isMounted) {
          setTransaksi(data);
          setLoadingTransaksi(false);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [accessToken],
  );

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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

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
      tanggal: new Date(data.tanggal).getTime(),
      notes: data.deskripsi,
      total,
    };
    try {
      await axiosCatetin.post('/insert/transaksi', finalData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setLoading(false);
      setBarangAmount({});
      bottomSheetModalRef?.current?.close();
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

  return (
    <AppLayout headerTitle="Transaksi">
      <CatetinBottomSheet bottomSheetRef={bottomSheetModalRef}>
        <NavigationContainer independent={true}>
          <Stack.Navigator screenOptions={screenOptions}>
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
      </CatetinBottomSheet>
      <View style={tw`flex-1 px-3 pt-4`}>
        {transaksi?.map((eachTransaksi) => (
          <View style={tw`shadow bg-white rounded px-3 py-2 mb-4`} key={eachTransaksi.transaksi_id}>
            <Text style={tw`font-bold text-lg`}>{eachTransaksi.title}</Text>
            <Text style={tw``}>{new Date(parseInt(eachTransaksi.tanggal, 10)).toISOString()}</Text>
          </View>
        ))}
      </View>

      <PlusButton
        onPress={() => {
          bottomSheetModalRef.current?.present();
        }}
      />
    </AppLayout>
  );
}

export default Transaksi;
