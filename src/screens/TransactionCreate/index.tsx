import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import chunk from 'lodash/chunk';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { StackActions } from '@react-navigation/native';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinDateTimePicker from '../../components/molecules/DateTimePicker';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppDispatch, useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { optionsTransaksi } from '../../static/optionsTransaksi';
import { RootState } from '../../store';
import { setSelectedTransaction } from '../../store/features/transactionSlice';
import { ICatetinTransaksi } from '../../types/transaksi';
import { Icon } from 'react-native-elements';

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
  total: number | string;
}

export type TransactionCreateRootStackParamList = {
  'Transaction Default': undefined;
  'Transaction Date': undefined;
  'Transaction Type': undefined;
};

const schema = yup.object().shape({
  transaksi_id: yup.number(),
  name: yup.string().required('Nama transaksi is required'),
  tipe: yup.mixed().required('Tipe transaksi is required'),
  tanggal: yup.date().required('Tanggal transaksi is required'),
  deskripsi: yup.string(),
  total: yup.number().when('tipe', {
    is: (opt: { label: string; value: number }) => opt?.value === 1 || opt?.value === 2,
    then: (rule) => rule.typeError('Type must be number').required('Total is required'),
  }),
  barang: yup.array(),
});

interface ITransactionCreateScreen {
  // bottomSheetRef: React.RefObject<BottomSheetMethods>;
  onFinishSubmit: (data: ICatetinTransaksi) => void;
  onFinishDelete: () => void;
}

function TransactionCreateScreen(props: any) {
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const { activeStore } = useAppSelector((state: RootState) => state.store);

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
      barang: [],
    },
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (props.route.params?.from === 'transaction-barang') {
      setValue('barang', props.route.params?.data);
    } else if (props.route.params?.data) {
      setValue('name', props.route.params?.data.title);
      setValue('tanggal', moment(props.route.params?.data.transaction_date).toDate());
      setValue('deskripsi', props.route.params?.data.notes);
      setValue('total', props.route.params?.data.nominal);
      setValue(
        'tipe',
        optionsTransaksi.find((opt) => opt?.value === parseInt(props.route.params?.data.type, 10)),
      );
      setValue('transaksi_id', props.route.params?.data.id);
    } else {
      reset({ transaksi_id: 0, name: '', tipe: null, tanggal: new Date(), deskripsi: '', total: 0 });
    }
  }, [props.route.params?.data, props.route.params?.from, reset, setValue]);

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
        } = await axiosCatetin.post(`/transaksi/${activeStore}`, finalData);
        dataTransaksi = insertedData;
      } else {
        const {
          data: {
            data: [updatedData],
          },
        } = await axiosCatetin.put('/transaksi', finalData);
        dataTransaksi = updatedData;
      }
      CatetinToast(200, 'default', `Sukses ${data.transaksi_id === 0 ? 'menambah' : 'memperbarui'} transaksi`);
      if (dataTransaksi.type === '3' || dataTransaksi.type === '4') {
        dispatch(setSelectedTransaction(dataTransaksi.id));
        navigation.navigate('TransactionDetailScreen');
      } else {
        navigation.navigate('Transaksi');
      }
    } catch (err: any) {
      CatetinToast(err?.response?.status, 'error', err.response?.data?.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await axiosCatetin.delete(`/transaksi/${watch('transaksi_id')}`);
      navigation.navigate('Transaksi');
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <AppLayout header isBackEnabled headerTitle={props.route.params?.data ? 'Edit Transaksi' : 'Tambah Transaksi'}>
      <CatetinScrollView style={tw`px-3`}>
        <View style={tw`mb-4 flex-1`}>
          <Text style={tw`mb-1 text-base`}>Nama Transaksi</Text>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <CatetinInput placeholder="Nama Transaksi" onChangeText={onChange} value={value} />
            )}
            name="name"
          />
          {errors.name && <Text style={tw`text-red-400 mt-1`}>{errors.name.message}</Text>}
        </View>

        <View style={tw`mb-4 flex-1`}>
          <Text style={tw`mb-1 text-base`}>Tanggal Transaksi</Text>
          <CatetinDateTimePicker
            value={watch('tanggal')}
            onChange={(value) => {
              setValue('tanggal', value);
            }}
            bottomSheet={false}
            mode="datetime"
            format="DD MMMM YYYY HH:mm"
            maximumDate
          ></CatetinDateTimePicker>
        </View>

        <View style={tw`mb-4 flex-1`}>
          <Text style={tw`mb-1 text-base`}>Tipe Transaksi</Text>

          <View style={tw`flex-1`}>
            {optionsTransaksi.map((option) => (
              <View style={tw`flex flex-row justify-between mb-3 bg-white rounded-lg px-2 py-2`} key={option.label}>
                <Text
                  style={tw`text-base ${
                    watch('transaksi_id') !== 0 && watch('tipe')?.value !== option.value ? 'text-gray-500' : ''
                  }`}
                >
                  {option.label}
                </Text>
                <Icon
                  name={`radio-button-${watch('tipe')?.value === option.value ? 'on' : 'off'}`}
                  iconStyle={tw`bg-white ${
                    watch('tipe')?.value === option.value
                      ? 'text-blue-500'
                      : watch('transaksi_id') !== 0
                      ? 'text-gray-200'
                      : ''
                  }`}
                  tvParallaxProperties=""
                  onPress={() => {
                    setValue('tipe', option);
                  }}
                  disabled={watch('transaksi_id') !== 0}
                />
              </View>
            ))}
          </View>

          {errors.tipe && <Text style={tw`text-red-500 mt-1`}>{(errors.tipe as any)?.message as any}</Text>}
        </View>

        {(watch('tipe')?.value === 1 || watch('tipe')?.value === 2) && (
          <View style={tw`mb-4 flex-1`}>
            <Text style={tw`mb-1 text-base`}>Nominal Transaksi</Text>

            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <CatetinInput
                  placeholder="Nominal Transaksi"
                  keyboardType="numeric"
                  value={value?.toString() || ''}
                  onChangeText={onChange}
                />
              )}
              name="total"
            />
            {errors.total && <Text style={tw`text-red-500 mt-1`}>{errors.total?.message as any}</Text>}
          </View>
        )}

        <View style={tw`mb-4 flex-1`}>
          <Text style={tw`mb-1 text-base`}>Deskripsi Transaksi</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <CatetinInput
                placeholder="Deskripsi"
                onChangeText={(value: string) => {
                  onChange(value);
                }}
                value={value}
              />
            )}
            name="deskripsi"
          />
          {errors.deskripsi && <Text style={tw`text-red-500 mt-1`}>{errors.deskripsi.message}</Text>}
        </View>

        <View>
          <CatetinButton
            title="Save"
            onPress={() => {
              handleSubmit(onSubmit)();
            }}
            loading={loading}
            customStyle={'mb-3'}
          />
          {watch('transaksi_id') !== 0 && (
            <CatetinButton
              title="Delete"
              theme="danger"
              onPress={() => {
                Alert.alert('Confirm Deletion', 'Are you sure want to delete this transaction?', [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  { text: 'OK', onPress: () => handleDelete() },
                ]);
              }}
              loading={loadingDelete}
            />
          )}
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default TransactionCreateScreen;
