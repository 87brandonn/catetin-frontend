import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinDateTimePicker from '../../components/molecules/DateTimePicker';
import CatetinInput from '../../components/molecules/Input';
import { useAppDispatch, useAppSelector } from '../../hooks';
import useCreateTransaction from '../../hooks/useCreateTransaction';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { optionsTransaksi } from '../../static/optionsTransaksi';
import { RootState } from '../../store';
import { setSelectedTransaction } from '../../store/features/transactionSlice';
import { ICatetinBarang } from '../../types/barang';

export interface ICatetinTipeTransaksi {
  label: string;
  value: 'income' | 'outcome';
}

export type ICatetinTransaksiCategory = {
  id: number;
  name: string;
  picture: string;
  global: boolean;
  rootType: 'income' | 'outcome';
  deleted: boolean;
  StoreId: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface TransactionCreateFormSchema {
  transaksi_id: number;
  transaksi_category: ICatetinTransaksiCategory | null;
  name: string;
  tipe: ICatetinTipeTransaksi | null | undefined;
  tanggal: Date;
  deskripsi: string;
  total: string;
  barang: ICatetinBarang[];
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
  total: yup.string().when('transaksi_category', {
    is: (opt: ICatetinTransaksiCategory | null) => opt && ![19, 20].includes(opt.id),
    then: (rule) => rule.required('Total is required'),
  }),
  barang: yup.array(),
  transaksi_category: yup.mixed().required('Transaksi category is required'),
});

function TransactionCreateScreen(props: any) {
  const [loadingDelete, setLoadingDelete] = useState(false);

  const navigation = useNavigation();

  const { activeStore } = useAppSelector((state: RootState) => state.store);
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    clearErrors,
  } = useForm<TransactionCreateFormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      transaksi_id: 0,
      name: '',
      tipe: null,
      tanggal: new Date(),
      deskripsi: '',
      total: '',
      barang: [],
      transaksi_category: null,
    },
  });

  useEffect(() => {
    if (props.route.params?.from === 'transaction-category') {
      setValue('transaksi_category', props.route.params?.data);
      clearErrors('transaksi_category');
    }
  }, [clearErrors, props.route.params?.data, props.route.params?.from, setValue]);

  useEffect(() => {
    if (props.route.params?.from === 'transaction-barang') {
      setValue('barang', props.route.params?.data);
    } else if (props.route.params?.from === 'transaction-index') {
      console.log(props.route.params?.data);
      setValue('name', props.route.params?.data.title);
      setValue('tanggal', moment(props.route.params?.data.transaction_date).toDate());
      setValue('deskripsi', props.route.params?.data.notes);
      setValue('total', props.route.params?.data.nominal);
      setValue(
        'tipe',
        optionsTransaksi.find(
          (opt) => opt?.value === props.route.params?.data.TransactionTransactionTypes[0]?.TransactionType.rootType,
        ),
      );
      setValue(
        'transaksi_category',
        props.route.params?.data.TransactionTransactionTypes[0]?.TransactionType.deleted
          ? null
          : props.route.params?.data.TransactionTransactionTypes[0]?.TransactionType,
      );
      setValue('transaksi_id', props.route.params?.data.id);
    }
  }, [props.route.params?.data, props.route.params?.from, reset, setValue]);

  const { mutate: createTransaction, isLoading: loading } = useCreateTransaction(
    activeStore,
    (payload, dataTransaksi) => {
      if (payload.transaksi_category === 19 || payload.transaksi_category === 20) {
        dispatch(setSelectedTransaction(dataTransaksi.id));
        navigation.navigate('TransactionDetailScreen');
      } else {
        navigation.navigate('Transaksi');
      }
    },
  );

  const onSubmit = async (data: TransactionCreateFormSchema) => {
    const finalData = {
      title: data.name,
      tanggal: moment(data.tanggal).toISOString(),
      notes: data.deskripsi,
      total: parseInt(data.total || '0', 10),
      transaksi_id: data.transaksi_id,
      transaksi_category: data.transaksi_category?.id,
      rootType: data.transaksi_category?.rootType,
    };
    createTransaction(finalData);
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
    <AppLayout header isBackEnabled headerTitle={watch('transaksi_id') !== 0 ? 'Edit Transaksi' : 'Tambah Transaksi'}>
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
                    clearErrors('tipe');
                    setValue('transaksi_category', null);
                    setValue('tipe', option);
                  }}
                  disabled={watch('transaksi_id') !== 0}
                />
              </View>
            ))}
          </View>

          {errors.tipe && <Text style={tw`text-red-500 mt-1`}>{(errors.tipe as any)?.message as any}</Text>}
        </View>

        {watch('tipe')?.value && (
          <View style={tw`mb-4 flex-1`}>
            <Text style={tw`mb-1 text-base`}>Kategori Transaksi</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('TransactionCategoryScreen', {
                  data: watch('transaksi_category'),
                  type: watch('tipe')?.value,
                });
              }}
              disabled={watch('transaksi_id') !== 0}
            >
              <CatetinInput
                placeholder="Kategori Transaksi"
                style={tw`border-b border-gray-100 px-4 py-3 rounded ${
                  watch('transaksi_id') !== 0 ? 'text-gray-500' : ''
                }`}
                pointerEvents="none"
                keyboardType="numeric"
                value={watch('transaksi_category')?.name}
                editable={false}
              />

              {errors.transaksi_category && (
                <Text style={tw`text-red-500 mt-1`}>{(errors.transaksi_category as any)?.message as any}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {watch('transaksi_category') && ![19, 20].includes(watch('transaksi_category').id) && (
          <View style={tw`mb-4 flex-1`}>
            <Text style={tw`mb-1 text-base`}>Nominal Transaksi</Text>

            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <CatetinInput
                  placeholder="Nominal Transaksi"
                  keyboardType="numeric"
                  value={value !== 0 ? value?.toString() : ''}
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
