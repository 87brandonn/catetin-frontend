import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React from 'react';
import { Control, Controller, FieldError, UseFormWatch } from 'react-hook-form';
import { Text, View } from 'react-native';
import { Avatar, Button, Icon } from 'react-native-elements';
import tw from 'twrnc';
import { IFormSchema } from '.';
import CatetinImagePicker from '../../components/molecules/ImagePicker';
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
    barang?: FieldError | undefined;
    stok?: FieldError | undefined;
    harga?: FieldError | undefined;
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
    <>
      <View style={tw`mb-4`}>
        <Text style={tw`mb-1 text-base`}>Nama Barang</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <CatetinInput
              bottomSheet={true}
              placeholder="Nama Barang"
              style={tw`border-b border-gray-100 px-4 py-3 rounded`}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="name"
        />
        {errors.name && <Text style={tw`text-red-500 mt-1`}>{errors.name.message}</Text>}
      </View>
      <View style={tw`mb-4`}>
        <Text style={tw`mb-1 text-base`}>Stok</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <CatetinInput
              bottomSheet={true}
              placeholder="Stok"
              style={tw`border-b border-gray-100 px-4 py-3 rounded`}
              onChangeText={(value) => {
                if (Number(value)) {
                  onChange(parseInt(value, 10));
                } else {
                  onChange(parseInt('0', 10));
                }
              }}
              keyboardType="numeric"
              value={(value !== 0 && value.toString()) || ''}
              disabled={watch('id') !== 0}
            />
          )}
          name="stok"
        />
        {errors.stok && <Text style={tw`text-red-500 mt-1`}>{errors.stok.message}</Text>}
      </View>
      <View style={tw`mb-4`}>
        <Text style={tw`mb-1 text-base`}>Harga Barang</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <CatetinInput
              bottomSheet={true}
              placeholder="Harga"
              style={tw`border-b border-gray-100 px-4 py-3 rounded`}
              onChangeText={(value) => {
                onChange(parseInt(value || '0', 10));
              }}
              keyboardType="numeric"
              value={(value !== 0 && value.toString()) || ''}
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
            <CatetinImagePicker
              data={value || undefined}
              onUploadImage={(url) => {
                onChange(url);
              }}
              size={188}
              rounded={false}
              containerStyle={tw`bg-gray-300 rounded-[12px]`}
              avatarStyle={tw`rounded-[12px]`}
            ></CatetinImagePicker>
          )}
          name="barang_picture"
        />
      </View>
      <View style={tw`pb-[48px]`}>
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
    </>
  );
}

export default CreateModal;
