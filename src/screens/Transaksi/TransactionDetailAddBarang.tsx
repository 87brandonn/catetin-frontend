import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParamListBase, RouteProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, Text, View } from 'react-native';
import { Avatar, Button } from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import { useAppSelector } from '../../hooks';
import { RootState } from '../../store';
import { IFormSchema } from '../Barang';

const schema = yup.object().shape({
  id: yup.number(),
  name: yup.string().required('Nama barang is required'),
  stok: yup.number().required('Stok is requried'),
  harga: yup.number().typeError('Please input number').required('Harga is required'),
  barang_picture: yup.mixed(),
});

function TransactionDetailAddBarang(props: {
  route: RouteProp<ParamListBase, 'Transaction Detail Add Barang'>;
  navigation: any;
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IFormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      id: 0,
      stok: 0,
      name: '',
      harga: 0,
      barang_picture: null,
    },
  });

  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);

  const { navigate } = useNavigation();
  const { activeStore } = useAppSelector((state: RootState) => state.store);

  useEffect(() => {
    if (selectedTransaction !== props.route.params?.id) {
      props.navigation.navigate('Transaction Detail');
    }
  }, [props.navigation, props.route.params?.id, selectedTransaction]);

  const [loading, setLoading] = useState(false);

  const handleOpenProfileImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        mediaType: 'photo',
        cropperCircleOverlay: true,
      });
      const formData = new FormData();
      formData.append(
        'image',
        JSON.parse(
          JSON.stringify({
            uri: Platform.OS === 'android' ? image.sourceURL : image.sourceURL?.replace('file://', ''),
            type: image.mime,
            name: image.filename,
          }),
        ),
      );
      const response = await fetch('https://catetin-be.herokuapp.com/media', {
        method: 'POST',
        body: formData,
      });
      const { url } = await response.json();
      return url;
    } catch (err: any) {
      // ignore error
    }
  };

  const onPost = async (data: IFormSchema) => {
    await axiosCatetin.post(
      `/barang/${activeStore}`,
      {
        name: data.name,
        price: data.harga,
        picture: data.barang_picture,
        stock: data.stok,
      },
      {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      },
    );
  };

  const onSubmit = async (data: IFormSchema) => {
    setLoading(true);
    try {
      await onPost(data);
      reset({
        id: 0,
        name: '',
        stok: 0,
        harga: 0,
        barang_picture: null,
      });
      Toast.show({
        type: 'customToast',
        text2: `Berhasil menambah barang`,
        position: 'bottom',
      });
      navigate('Transaction Detail Edit', {
        from: 'add-barang',
        id: selectedTransaction,
      });
    } catch (err: any) {
      Toast.show({
        type: 'customToast',
        text2: err.response?.data?.message,
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1`}>
      <View style={tw`flex items-center`}>
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <Avatar
              size={300}
              source={{
                uri: value || undefined,
              }}
              onPress={async () => {
                const url = await handleOpenProfileImage();
                onChange(url);
              }}
              avatarStyle={tw`rounded-[8px]`}
              containerStyle={tw`bg-gray-300 rounded-[12px] mb-4`}
            ></Avatar>
          )}
          name="barang_picture"
        />
      </View>
      <View style={tw`mb-3`}>
        <Text style={tw`text-base mb-1`}>Nama Barang</Text>
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <CatetinInput
              placeholder="Nama Barang"
              onChangeText={onChange}
              value={value}
              bottomSheet
              isError={errors.name ? true : false}
            />
          )}
          name="name"
        />
      </View>
      <View style={tw`mb-3`}>
        <Text style={tw`text-base mb-1`}>Stok</Text>
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <CatetinInput
              placeholder="Stok"
              onChangeText={(value) => onChange(parseInt(Number(value) ? value : '0' || '0', 10))}
              value={(value !== 0 && value.toString()) || ''}
              keyboardType="numeric"
              bottomSheet
              isError={errors.stok ? true : false}
            />
          )}
          name="stok"
        />
      </View>
      <View style={tw`mb-4`}>
        <Text style={tw`text-base mb-1`}>Harga</Text>
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <CatetinInput
              placeholder="Harga"
              onChangeText={(value) => onChange(parseInt(value || '0', 10))}
              value={(value !== 0 && value.toString()) || ''}
              keyboardType="numeric"
              bottomSheet
              isError={errors.harga ? true : false}
            />
          )}
          name="harga"
        />
      </View>
      <View>
        <CatetinButton title="Save" onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>
    </View>
  );
}

export default TransactionDetailAddBarang;
