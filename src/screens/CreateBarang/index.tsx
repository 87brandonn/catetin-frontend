import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinImagePicker from '../../components/molecules/ImagePicker';
import CatetinInput from '../../components/molecules/Input';
import { useAppSelector } from '../../hooks';
import useCreateBarang from '../../hooks/useCreateBarang';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';
import { ICatetinItemCategory } from '../../types/itemCategory';
import { ICatetinTransaksi } from '../../types/transaksi';

export interface ICreateBarangScreen {
  title: string;
}

export interface IFormSchema {
  id: number;
  name: string;
  harga: number;
  stok: number;
  barang_picture: string | null;
  category: ICatetinItemCategory[];
  transactions: ICatetinTransaksi[];
}

const schema = yup.object().shape({
  id: yup.number(),
  name: yup.string().required('Nama barang is required'),
  harga: yup.number().typeError('Please input number').required('Harga is required'),
  stok: yup.number().required('Stok is required'),
  barang_picture: yup.mixed(),
  category: yup.mixed(),
  transactions: yup.mixed(),
});

function CreateBarangScreen(props: any) {
  const { navigate } = useNavigation();

  const [loadingDelete, setLoadingDelete] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<IFormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      id: 0,
      stok: 0,
      name: '',
      harga: 0,
      barang_picture: null,
      category: [],
      transactions: [],
    },
  });

  useEffect(() => {
    if (props.route.params?.from === 'kategori-barang') {
      setValue('category', props.route.params?.data);
    } else {
      setValue('name', props.route.params?.data?.name || '');
      setValue('harga', props.route.params?.data?.price || 0);
      setValue('id', props.route.params?.data?.id || 0);
      setValue('barang_picture', props.route.params?.data?.picture || null);
      setValue('stok', props.route.params?.data?.stock || 0);
      setValue('category', props.route.params?.data?.ItemCategories || []);
      setValue('transactions', props.route.params?.data?.Transactions || []);
    }
  }, [props.route.params?.data, props.route.params?.from, setValue]);

  const navigation = useNavigation();

  const { mutate: createBarang, isLoading: loading } = useCreateBarang();

  const onSubmit = async (data: any) => {
    createBarang(
      {
        id: data.id,
        name: data.name,
        price: data.harga,
        picture: data.barang_picture,
        stock: data.stok,
        category: data.category.length ? data.category.map((cat) => cat.id) : undefined,
      },
      {
        onSuccess: () => {
          if (props.route.params?.from === 'transaction-barang') {
            navigate('TransactionBarangScreen');
          } else {
            navigate('Barang');
          }
        },
      },
    );
  };
  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await axiosCatetin.delete(`/barang/${watch('id')}`);
      Toast.show({
        type: 'customToast',
        text2: 'Berhasil menghapus barang',
        position: 'bottom',
      });
      navigation.goBack();
    } catch (err: any) {
      Toast.show({
        type: 'customToast',
        text2: err.response?.data?.message,
        position: 'bottom',
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <AppLayout
      header
      isBackEnabled
      headerTitle={`${watch('id') !== 0 ? `Edit ${props.route.params?.data?.name}` : ``}`}
    >
      <CatetinScrollView style={tw`px-3`}>
        <View style={tw`mb-4`}>
          <Text style={tw`mb-1 text-base`}>Nama Barang</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <CatetinInput
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
                disabled={watch('id') !== 0 && watch('transactions')?.length > 0}
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
              navigate('KategoriBarangScreen', {
                data: watch('category'),
              });
            }}
          >
            <CatetinInput
              placeholder="Kategori"
              style={tw`border-b border-gray-100 px-4 py-3 rounded`}
              pointerEvents="none"
              keyboardType="numeric"
              value={watch('category')
                ?.map((data) => data.name)
                .join(', ')}
              editable={false}
            />
          </TouchableOpacity>
        </View>
        <View style={tw`mb-4`}>
          <Text style={tw`mb-1 text-base`}>Harga Barang</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <CatetinInput
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
                handleSubmit(onSubmit)();
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
                    { text: 'OK', onPress: () => handleDelete() },
                  ]);
                }}
                loading={loadingDelete}
              />
            </View>
          )}
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default CreateBarangScreen;
