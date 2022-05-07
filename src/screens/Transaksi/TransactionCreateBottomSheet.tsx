import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { yupResolver } from '@hookform/resolvers/yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import chunk from 'lodash/chunk';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinBottomSheet from '../../components/molecules/BottomSheet';
import CatetinBottomSheetWrapper from '../../components/molecules/BottomSheet/BottomSheetWrapper';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { optionsTransaksi } from '../../static/optionsTransaksi';
import { RootState } from '../../store';
import { setSelectedTransaction } from '../../store/features/transactionSlice';
import { ICatetinTransaksi } from '../../types/transaksi';
import { screenOptions } from '../../utils';

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

const Stack = createStackNavigator<TransactionCreateRootStackParamList>();

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
});

interface ITransactionDetailBottomSheet {
  bottomSheetRef: React.RefObject<BottomSheetMethods>;
  onFinishSubmit: (data: ICatetinTransaksi) => void;
  onFinishDelete: () => void;
}

function TransactionCreateBottomSheet({
  bottomSheetRef,
  onFinishDelete,
  onFinishSubmit,
}: ITransactionDetailBottomSheet) {
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [loading, setLoading] = useState(false);

  const { editedTransaction } = useAppSelector((state: RootState) => state.transaction);
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
    },
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (editedTransaction) {
      setValue('name', editedTransaction.title);
      setValue('tanggal', moment(editedTransaction.transaction_date).toDate());
      setValue('deskripsi', editedTransaction.notes);
      setValue('total', editedTransaction.nominal);
      setValue(
        'tipe',
        optionsTransaksi.find((opt) => opt?.value === parseInt(editedTransaction.type, 10)),
      );
      setValue('transaksi_id', editedTransaction.id);
    } else {
      reset({ transaksi_id: 0, name: '', tipe: null, tanggal: new Date(), deskripsi: '', total: 0 });
    }
  }, [editedTransaction, reset, setValue]);

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
      bottomSheetRef.current?.close();
      reset({
        name: '',
        tanggal: new Date(),
        deskripsi: '',
        total: 0,
        tipe: null,
        transaksi_id: 0,
      });
      CatetinToast(200, 'default', `Sukses ${data.transaksi_id === 0 ? 'menambah' : 'memperbarui'} transaksi`);
      dispatch(setSelectedTransaction(null));
      onFinishSubmit(dataTransaksi);
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
      bottomSheetRef.current?.close();
      onFinishDelete();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <CatetinBottomSheet bottomSheetRef={bottomSheetRef}>
      <NavigationContainer independent={true}>
        <Stack.Navigator screenOptions={screenOptions as StackNavigationOptions}>
          <Stack.Screen name="Transaction Default" options={{ headerLeft: () => null }}>
            {(props) => (
              <CatetinBottomSheetWrapper {...props} title="Create Transaksi">
                <View style={tw`flex-1`} {...props}>
                  <View style={tw`mb-4 flex-1`}>
                    <Text style={tw`mb-1 text-base`}>Nama Transaksi</Text>
                    <Controller
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <CatetinInput
                          bottomSheet={true}
                          placeholder="Nama Transaksi"
                          onChangeText={onChange}
                          value={value}
                        />
                      )}
                      name="name"
                    />
                    {errors.name && <Text style={tw`text-red-400 mt-1`}>{errors.name.message}</Text>}
                  </View>
                  <View style={tw`mb-4 flex-1`}>
                    <Text style={tw`mb-1 text-base`}>Tanggal Transaksi</Text>
                    <DateTimePicker
                      value={watch('tanggal')}
                      onChange={(_: any, date: Date | undefined) => setValue('tanggal', date || new Date())}
                      style={tw`mb-1`}
                    />
                    <DateTimePicker
                      mode="time"
                      display="spinner"
                      value={watch('tanggal')}
                      onChange={(_: any, date: Date | undefined) => {
                        setValue(
                          'tanggal',
                          moment(watch('tanggal'))
                            .set({
                              hour: moment(date).hour(),
                              minute: moment(date).minute(),
                            })
                            .toDate(),
                        );
                      }}
                    />
                  </View>
                  <View style={tw`mb-4 flex-1`}>
                    <Text style={tw`mb-1 text-base`}>Tipe Transaksi</Text>

                    <View style={tw`flex-1`}>
                      {chunk(optionsTransaksi, 2).map((optionChunk, index) => (
                        <View style={tw`flex flex-1 flex-row mb-2`} key={index}>
                          {optionChunk.map((option) => (
                            <TouchableOpacity
                              style={tw`flex-1 mr-2 ${
                                watch('tipe')?.value === option.value ? 'bg-blue-500' : 'bg-gray-100'
                              } px-3 py-2 rounded-lg shadow`}
                              key={option.value}
                              onPress={() => {
                                setValue('tipe', option);
                              }}
                              disabled={watch('transaksi_id') !== 0}
                            >
                              <Text
                                style={tw`text-center ${
                                  watch('tipe')?.value === option.value ? 'font-bold text-white' : ''
                                }`}
                              >
                                {option.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
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
                            bottomSheet={true}
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
                          bottomSheet={true}
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
                </View>
              </CatetinBottomSheetWrapper>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </CatetinBottomSheet>
  );
}

export default TransactionCreateBottomSheet;
