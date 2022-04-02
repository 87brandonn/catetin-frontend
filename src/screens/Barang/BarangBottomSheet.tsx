import React from 'react';
import { Control, Controller, FieldError, UseFormWatch } from 'react-hook-form';
import { Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import tw from 'twrnc';
import { IFormSchema } from '.';
import CatetinInput from '../../components/molecules/Input';

export interface ICreateModalBarang {
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
  title: string;
}

function CreateModal({ control, errors, watch, loading, onSave, title }: ICreateModalBarang) {
  return (
    <View style={tw`flex-1 px-3`}>
      <View style={tw`mb-4`}>
        <Text style={tw`font-bold text-lg text-center`}>{title}</Text>
      </View>
      <View style={tw`mb-2`}>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <CatetinInput
              placeholder="Nama Barang"
              style={tw`border-b border-gray-100 px-4 py-3 rounded`}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
            />
          )}
          name="name"
        />
        {errors.name && <Text style={tw`text-red-500 mt-1`}>{errors.name.message}</Text>}
      </View>
      <View style={tw`mb-2`}>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <CatetinInput
              placeholder="Jumlah Stok"
              style={tw`border-b border-gray-100 px-4 py-3 rounded`}
              onBlur={onBlur}
              onChangeText={(value) => {
                onChange(value.replace(/[^0-9]/g, ''));
              }}
              value={value.toString()}
              keyboardType="numeric"
              autoCapitalize="none"
            />
          )}
          name="stok"
        />
        {errors.stok && <Text style={tw`text-red-500 mt-1`}>{errors.stok.message}</Text>}
      </View>
      <View style={tw`mb-2`}>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <CatetinInput
              placeholder="Harga"
              style={tw`border-b border-gray-100 px-4 py-3 rounded`}
              onBlur={onBlur}
              onChangeText={(value) => {
                onChange(value.replace(/[^0-9]/g, ''));
              }}
              value={value.toString()}
              autoCapitalize="none"
            />
          )}
          name="harga"
        />
        {errors.harga && <Text style={tw`text-red-500 mt-1`}>{errors.harga.message}</Text>}
      </View>
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
