import React from 'react';
import { Control, Controller, FieldError, UseFormWatch, useWatch } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button } from 'react-native-elements';
import tw from 'twrnc';
import { IFormSchema } from '.';
import CatetinInput from '../../components/molecules/Input';
import { handleUploadImage } from '../../utils';

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
  loadingDelete: boolean;
  onSave: () => void;
  onDelete: () => void;
  title: string;
}

function CreateModal({ control, errors, loading, onSave, title, onDelete, loadingDelete, watch }: ICreateModalBarang) {
  return (
    <View style={tw`flex-1 px-3`}>
      <View style={tw`mb-4`}>
        <Text style={tw`font-bold text-lg text-center`}>{title}</Text>
      </View>
      <View style={tw`mb-4`}>
        <Text style={tw`mb-1 text-base`}>Nama Barang</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <CatetinInput
              placeholder="Nama Barang"
              style={tw`border-b border-gray-100 px-4 py-3 rounded`}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="name"
        />
        {errors.name && <Text style={tw`text-red-500 mt-1`}>{errors.name.message}</Text>}
      </View>
      <View style={tw`mb-4`}>
        <Text style={tw`mb-1 text-base`}>Harga Barang</Text>
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
            />
          )}
          name="harga"
        />
        {errors.harga && <Text style={tw`text-red-500 mt-1`}>{errors.harga.message}</Text>}
      </View>
      <View style={tw`mb-4`}>
        <Text style={tw`mb-1 text-base`}>Gambar Barang</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Avatar
              size={188}
              source={{
                uri: value || undefined,
              }}
              avatarStyle={tw`rounded-[12px]`}
              containerStyle={tw`bg-gray-300 rounded-[12px]`}
              onPress={async () => {
                const imageUrl = await handleUploadImage(false);
                onChange(imageUrl);
              }}
              key={value}
            ></Avatar>
          )}
          name="barang_picture"
        />
      </View>
      <View>
        <Button
          title="Save"
          buttonStyle={tw`bg-blue-500 mb-3`}
          titleStyle={tw`font-bold`}
          onPress={() => {
            onSave();
          }}
          loading={loading}
        />
      </View>
      {watch('id') !== 0 && (
        <View>
          <Button
            title="Delete"
            buttonStyle={tw`bg-red-500`}
            titleStyle={tw`font-bold`}
            onPress={() => {
              onDelete();
            }}
            loading={loadingDelete}
          />
        </View>
      )}
    </View>
  );
}

export default CreateModal;
