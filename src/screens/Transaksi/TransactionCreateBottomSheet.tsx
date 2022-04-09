import BottomSheet from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Portal } from '@gorhom/portal';
import { yupResolver } from '@hookform/resolvers/yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AsyncStorage, View } from 'react-native';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinSelect from '../../components/molecules/Select';
import { ICatetinTransaksi } from '../../types/transaksi';
import { screenOptions } from '../../utils';
import CreateModal from './TransactionBottomSheet';
import TransactionBottomSheetWrapper from './TransactionBottomSheetWrapper';
import { setSelectedTransaction } from '../../store/features/transactionSlice';
import { useAppDispatch } from '../../hooks';
import { optionsTransaksi } from '../../static/optionsTransaksi';

export interface ICatetinTipeTransaksi {
  label: string;
  value: number;
}

export interface TransactionCreateFormSchema {
  transaksi_id: number;
  name: string;
  tipe: ICatetinTipeTransaksi | null | undefined;
  tanggal: Date;
  deskripsi: string;
  total: number;
}

export type TransactionCreateRootStackParamList = {
  'Transaction Default': undefined;
  'Transaction Date': undefined;
  'Transaction Type': undefined;
};

const Stack = createStackNavigator<TransactionCreateRootStackParamList>();

const schema = yup.object().shape({
  transaksi_id: yup.number(),
  name: yup.string().required('Nama transaksi is required'),
  tipe: yup.mixed().required('Tipe transaksi is required'),
  tanggal: yup.date().required('Tanggal transaksi is required'),
  deskripsi: yup.string(),
  total: yup.number().required('Total is required'),
});

interface ITransactionDetailBottomSheet {
  bottomSheetRef: React.RefObject<BottomSheetMethods>;
  onFinishSubmit: (data: ICatetinTransaksi) => void;
  onFinishDelete: () => void;
  data: ICatetinTransaksi | null;
}

function TransactionCreateBottomSheet({
  bottomSheetRef,
  onFinishDelete,
  onFinishSubmit,
  data,
}: ITransactionDetailBottomSheet) {
  const snapPoints = useMemo(() => ['90%'], []);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<TransactionCreateFormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      transaksi_id: 0,
      name: '',
      tipe: null,
      tanggal: new Date(),
      deskripsi: '',
      total: 0,
    },
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data) {
      setValue('name', data.title);
      setValue('tanggal', moment(data.transaction_date).toDate());
      setValue('deskripsi', data.notes);
      setValue('total', data.nominal);
      setValue(
        'tipe',
        optionsTransaksi.find((opt) => opt.value === parseInt(data.type, 10)),
      );
      setValue('transaksi_id', data.id);
    } else {
      reset({ transaksi_id: 0, name: '', tipe: null, tanggal: new Date(), deskripsi: '', total: 0 });
    }
  }, [data, reset, setValue]);

  const onSubmit = async (data: TransactionCreateFormSchema) => {
    setLoading(true);
    try {
      const finalData = {
        title: data.name,
        tipe_transaksi: data.tipe?.value,
        tanggal: moment(data.tanggal).toISOString(),
        notes: data.deskripsi,
        total: data.total,
        transaksi_id: data.transaksi_id,
      };
      let dataTransaksi: ICatetinTransaksi;
      if (data.transaksi_id === 0) {
        const {
          data: { data: insertedData },
        } = await axiosCatetin.post('/transaksi', finalData, {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          },
        });
        dataTransaksi = insertedData;
      } else {
        const {
          data: {
            data: [updatedData],
          },
        } = await axiosCatetin.put('/transaksi', finalData, {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          },
        });
        dataTransaksi = updatedData;
      }
      bottomSheetRef.current?.close();
      reset({
        name: '',
        tanggal: new Date(),
        deskripsi: '',
        total: 0,
        tipe: null,
        transaksi_id: 0,
      });
      Toast.show({
        type: 'customToast',
        text2: `Sukses ${data.transaksi_id === 0 ? 'menambah' : 'memperbarui'} transaksi`,
        position: 'bottom',
      });
      dispatch(setSelectedTransaction(null));
      onFinishSubmit(dataTransaksi);
    } catch (err: any) {
      Toast.show({
        type: 'customToast',
        text2: err.response?.data?.message || 'Failed to create transaction',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await axiosCatetin.delete(`/transaksi/${watch('transaksi_id')}`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      bottomSheetRef.current?.close();
      onFinishDelete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
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
            <Stack.Screen name="Transaction Default" options={{ headerLeft: () => null }}>
              {(props) => (
                <TransactionBottomSheetWrapper title="Create Transaksi">
                  <CreateModal
                    control={control}
                    errors={errors}
                    watch={watch}
                    loading={loading}
                    onSave={() => handleSubmit(onSubmit)()}
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
                  <DateTimePicker
                    display="spinner"
                    mode="datetime"
                    value={watch('tanggal')}
                    onChange={(event, date) => setValue('tanggal', date as Date)}
                  />
                </TransactionBottomSheetWrapper>
              )}
            </Stack.Screen>
            <Stack.Screen name="Transaction Type">
              {(props) => (
                <TransactionBottomSheetWrapper title="Transaction Type" showBack>
                  <View style={tw`flex-1`}>
                    <CatetinSelect
                      onSelectOption={(option) => {
                        setValue('tipe', option);
                      }}
                      options={optionsTransaksi}
                      selected={watch('tipe')}
                    ></CatetinSelect>
                  </View>
                </TransactionBottomSheetWrapper>
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </BottomSheet>
    </Portal>
  );
}

export default TransactionCreateBottomSheet;
