import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Control, Controller, FieldError, UseFormWatch } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-elements';
import tw from 'twrnc';
import CatetinInput from '../../components/molecules/Input';
import { TransactionCreateFormSchema, TransactionCreateRootStackParamList } from './TransactionCreateBottomSheet';

export interface ICreateModalTransaksi {
  control: Control<TransactionCreateFormSchema, any>;
  errors: {
    id?: FieldError | undefined;
    name?: FieldError | undefined;
    tipe?:
      | FieldError
      | {
          label?: FieldError | undefined;
          value?: FieldError | undefined;
        }
      | undefined;
    tanggal?: FieldError | undefined;
    barang?: FieldError | undefined;
    deskripsi?: FieldError | undefined;
    total?: FieldError | undefined;
  };
  watch: UseFormWatch<TransactionCreateFormSchema>;
  loading: boolean;
  loadingDelete: boolean;
  onSave: () => void;
  showDelete: boolean;
  onDelete: () => void;
}

function CreateModal({
  control,
  errors,
  watch,
  loading,
  onSave,
  onDelete,
  showDelete = false,
  loadingDelete,
}: ICreateModalTransaksi) {
  const { navigate } = useNavigation<StackNavigationProp<TransactionCreateRootStackParamList, 'Transaction Default'>>();
  const editingMode = watch('transaksi_id') !== 0;
  return (
    <View style={tw`flex-1`}>
      <View style={tw`mb-4`}>
        <Text style={tw`mb-1 text-base`}>Nama Transaksi</Text>
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <CatetinInput placeholder="Nama Transaksi" onChangeText={onChange} value={value} />
          )}
          name="name"
        />
        {errors.name && <Text style={tw`text-red-400 text-3 mt-1`}>{errors.name.message}</Text>}
      </View>
      <View style={tw`mb-4`}>
        <Text style={tw`mb-1 text-base`}>Tanggal Transaksi</Text>
        <TouchableOpacity
          onPress={() => {
            requestAnimationFrame(() => navigate('Transaction Date'));
          }}
        >
          <CatetinInput
            placeholder="Tanggal Transaksi"
            pointerEvents="none"
            value={watch('tanggal')?.toISOString().split('T')[0]}
          />
        </TouchableOpacity>
      </View>
      <View style={tw`mb-4`}>
        <Text style={tw`mb-1 text-base`}>Tipe Transaksi</Text>
        <TouchableOpacity
          onPress={() => {
            requestAnimationFrame(() => navigate('Transaction Type'));
          }}
          disabled={editingMode}
        >
          <CatetinInput
            pointerEvents="none"
            placeholder="Tipe Transaksi"
            value={watch('tipe')?.label}
            style={tw`${editingMode ? 'text-gray-300' : ''}`}
          />
        </TouchableOpacity>

        {errors.tipe && <Text style={tw`text-red-500 text-3 mt-1`}>{(errors.tipe as any)?.message as any}</Text>}
      </View>
      {(watch('tipe')?.value === 1 || watch('tipe')?.value === 2) && (
        <View style={tw`mb-4`}>
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
          {errors.total && <Text style={tw`text-red-500 text-3 mt-1`}>{errors.total?.message as any}</Text>}
        </View>
      )}

      <View style={tw`mb-4`}>
        <Text style={tw`mb-1 text-base`}>Deskripsi Transaksi</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <CatetinInput
              placeholder="Deskripsi"
              onBlur={onBlur}
              onChangeText={(value: string) => {
                onChange(value);
              }}
              value={value}
            />
          )}
          name="deskripsi"
        />
        {errors.deskripsi && <Text style={tw`text-red-500 text-3 mt-1`}>{errors.deskripsi.message}</Text>}
      </View>

      <View>
        <Button
          title="Save"
          buttonStyle={tw`bg-blue-500 mb-4`}
          titleStyle={tw`font-bold`}
          onPress={() => {
            onSave();
          }}
          loading={loading}
        />
        {showDelete && (
          <Button
            title="Delete"
            buttonStyle={tw`bg-red-500`}
            titleStyle={tw`font-bold`}
            onPress={() => {
              onDelete();
            }}
            loading={loadingDelete}
          />
        )}
      </View>
    </View>
  );
}

export default CreateModal;
