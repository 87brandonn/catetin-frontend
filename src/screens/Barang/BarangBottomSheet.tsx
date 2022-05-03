import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Control, Controller, FieldError, UseFormWatch } from 'react-hook-form';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-elements';
import tw from 'twrnc';
import { IFormSchema } from '.';
import CatetinButton from '../../components/molecules/Button';
import CatetinImagePicker from '../../components/molecules/ImagePicker';
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

function CreateModal({
  control,
  errors,
  loading,
  onSave,
  title,
  onDelete,
  loadingDelete,
  watch,
  ...props
}: ICreateModalBarang) {
  const { navigate } = useNavigation();
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
        <Text style={tw`text-base mb-1`}>Stok</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <CatetinInput
              bottomSheet={true}
              placeholder="Stok"
              style={tw`border-b border-gray-100 px-4 py-3 rounded mb-1`}
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
        <Text style={tw`mb-1 text-gray-500`}>
          Note: Jumlah stok tidak dapat dirubah apabila sudah ada minimal 1 transaksi dengan barang ini.
        </Text>
        {errors.stok && <Text style={tw`text-red-500 mt-1`}>{errors.stok.message}</Text>}
      </View>
      <View style={tw`mb-4`}>
        <Text style={tw`mb-1 text-base`}>Kategori</Text>
        <TouchableOpacity
          onPress={() => {
            navigate('Kategori Barang');
          }}
        >
          <CatetinInput
            bottomSheet={true}
            placeholder="Kategori"
            style={tw`border-b border-gray-100 px-4 py-3 rounded`}
            pointerEvents="none"
            keyboardType="numeric"
            value={watch('category')
              .map((data) => data.name)
              .join(', ')}
          />
        </TouchableOpacity>
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
          <CatetinButton
            title="Save"
            style={tw`mb-3`}
            onPress={() => {
              onSave();
            }}
            loading={loading}
          />
        </View>
        {watch('id') !== 0 && (
          <View>
            <CatetinButton
              title="Delete"
              theme="danger"
              onPress={() => {
                Alert.alert('Confirm Deletion', 'Are you sure want to delete this item?', [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  { text: 'OK', onPress: () => onDelete() },
                ]);
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
