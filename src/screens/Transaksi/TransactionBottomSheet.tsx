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
  onSave: () => void;
  total: number;
}

function CreateModal({ control, errors, watch, loading, onSave, total }: ICreateModalTransaksi) {
  const { navigate } = useNavigation();
  return (
    <View style={tw`flex-1`}>
      <View style={tw`mb-4`}>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <CatetinInput placeholder="Nama Transaksi" onChangeText={onChange} value={value} autoCapitalize="none" />
          )}
          name="name"
        />
        {errors.name && <Text style={tw`text-red-400 text-3 mt-1`}>{errors.name.message}</Text>}
      </View>
      <View style={tw`mb-4`}>
        <TouchableOpacity
          onPress={() => {
            requestAnimationFrame(() => navigate('Transaction Date'));
          }}
        >
          <CatetinInput
            placeholder="Tanggal Transaksi"
            autoCapitalize="none"
            pointerEvents="none"
            value={watch('tanggal')?.toISOString().split('T')[0]}
          />
        </TouchableOpacity>
      </View>
      <View style={tw`mb-4`}>
        <TouchableOpacity
          onPress={() => {
            requestAnimationFrame(() => navigate('Transaction Type'));
          }}
        >
          <CatetinInput
            pointerEvents="none"
            placeholder="Tipe Transaksi"
            autoCapitalize="none"
            value={watch('tipe')?.label}
          />
        </TouchableOpacity>

        {errors.tipe && <Text style={tw`text-red-500 text-3 mt-1`}>{errors.tipe?.message as any}</Text>}
      </View>
      {(watch('tipe')?.value === 3 || watch('tipe')?.value === 4) && (
        <View style={tw`mb-4`}>
          <TouchableOpacity
            onPress={() => {
              requestAnimationFrame(() => navigate('Transaction Barang'));
            }}
          >
            <CatetinInput
              placeholder="Barang"
              autoCapitalize="none"
              pointerEvents="none"
              value={watch('barang')
                ?.map((barang) => barang.nama_barang)
                .join(', ')}
            />
          </TouchableOpacity>

          {errors.barang && <Text style={tw`text-red-500 text-3 mt-1`}>{errors.barang.message}</Text>}
        </View>
      )}
      <View style={tw`mb-2`}>
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
              autoCapitalize="none"
            />
          )}
          name="deskripsi"
        />
        {errors.deskripsi && <Text style={tw`text-red-500 text-3 mt-1`}>{errors.deskripsi.message}</Text>}
      </View>
      {(watch('tipe')?.value === 3 || watch('tipe')?.value === 4) && (
        <View style={tw`my-4 flex flex-row justify-between items-center px-3`}>
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
          buttonStyle={tw`bg-blue-500`}
          titleStyle={tw`font-bold`}
          onPress={() => {
            onSave();
          }}
          loading={loading}
        />
      </View>
    </View>
  );
}

export default CreateModal;
