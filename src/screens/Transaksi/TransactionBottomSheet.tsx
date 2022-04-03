import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Control, Controller, FieldError, UseFormWatch } from 'react-hook-form';
import { View, TouchableOpacity, Text } from 'react-native';
import { Button } from 'react-native-elements';
import tw from 'twrnc';
import { IFormSchema } from '.';
import CatetinInput from '../../components/molecules/Input';

export interface ICreateModalTransaksi {
  control: Control<IFormSchema, any>;
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
  };
  watch: UseFormWatch<IFormSchema>;
  loading: boolean;
  loadingDelete: boolean;
  onSave: () => void;
  showDelete: boolean;
  onDelete: () => void;
  total: number;
}

function CreateModal({
  control,
  errors,
  watch,
  loading,
  onSave,
  onDelete,
  showDelete = false,
  total,
  loadingDelete,
}: ICreateModalTransaksi) {
  const { navigate } = useNavigation();
  const editingMode = watch('transaksi_id') !== 0;
  const barangFiltered = watch('barang')?.filter((barang) => barang.active === true);
  return (
    <View style={tw`flex-1`}>
      <View style={tw`mb-4`}>
        <Text style={tw`mb-1 text-base`}>Nama Transaksi</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
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

        {errors.tipe && <Text style={tw`text-red-500 text-3 mt-1`}>{errors.tipe?.message as any}</Text>}
      </View>
      {(watch('tipe')?.value === 3 || watch('tipe')?.value === 4) && (
        <View style={tw`mb-4`}>
          <Text style={tw`mb-1 text-base`}>Barang</Text>
          <TouchableOpacity
            onPress={() => {
              requestAnimationFrame(() => navigate('Transaction Barang'));
            }}
          >
            <CatetinInput
              placeholder="Barang"
              pointerEvents="none"
              value={barangFiltered?.map((barang) => barang.nama_barang).join(', ')}
            />
          </TouchableOpacity>

          {errors.barang && <Text style={tw`text-red-500 text-3 mt-1`}>{errors.barang.message}</Text>}
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
      {(watch('tipe')?.value === 3 || watch('tipe')?.value === 4) && (
        <View style={tw`flex flex-row justify-between items-center px-3 mb-4`}>
          <View>
            <Text style={tw`text-lg`}>Total</Text>
          </View>
          <View>
            <Text style={tw`text-lg`}>IDR {total.toLocaleString()}</Text>
          </View>
        </View>
      )}
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
