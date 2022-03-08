import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import PlusButton from '../../components/atoms/PlusButton';
import CatetinModal from '../../components/molecules/Modal';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import { RootState } from '../../store';

interface FormData {
  name: string;
  stok: number;
  harga: number;
}

const schema = yup
  .object({
    name: yup.string().required('Nama barang is required'),
    stok: yup.number().typeError('Please input number').required('Stok is required'),
    harga: yup.number().typeError('Please input number').required('Harga is required'),
  })
  .required();

function Barang() {
  const [showModal, setShowModal] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      stok: '',
      harga: '',
    },
  });

  const { accessToken } = useAppSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);

  const barang = [
    {
      name: 'Vitamin A',
      stock: 25,
      price: 50000,
    },
    {
      name: 'Vitamin B',
      stock: 25,
      price: 50000,
    },
    {
      name: 'Vitamin C',
      stock: 25,
      price: 50000,
    },
  ];

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await axiosCatetin.post(
        '/insert/barang',
        {
          nama_barang: data.name,
          stok: data.stok,
          harga: data.harga,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setShowModal(false);
      reset();
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AppLayout headerTitle="Barang">
      <View style={tw`flex-1 px-4 py-3 relative`}>
        {showModal && (
          <CatetinModal
            modalVisible={showModal}
            setModalVisible={setShowModal}
            onClose={() => {
              setShowModal(false);
            }}
            onSave={handleSubmit(onSubmit)}
            loadingSave={loading}
          >
            <View style={tw`px-3 py-4`}>
              <View style={tw`mb-[20px]`}>
                <Text style={tw`text-center text-2xl font-bold`}>Tambah Barang</Text>
              </View>
              <View style={tw`mb-2`}>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Masukkan nama barang"
                      style={tw`border border-gray-300 px-4 py-3 rounded`}
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
                    <TextInput
                      placeholder="Masukkan jumlah stok"
                      style={tw`border border-gray-300 px-4 py-3 rounded`}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
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
                    <TextInput
                      placeholder="Masukkan harga"
                      style={tw`border border-gray-300 px-4 py-3 rounded`}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                    />
                  )}
                  name="harga"
                />
                {errors.harga && <Text style={tw`text-red-500 mt-1`}>{errors.harga.message}</Text>}
              </View>
            </View>
          </CatetinModal>
        )}

        <View style={tw`px-4 py-2 rounded-lg shadow-lg bg-white flex flex-row justify-between`}>
          <View>
            <View>
              <Text style={tw`text-lg font-bold`}>Vitamin C</Text>
            </View>
            <View>
              <Text style={tw`text-gray-500`}>25</Text>
            </View>
            <View>
              <Text style={tw`text-gray-500`}>Rp 50.000</Text>
            </View>
          </View>
          <View style={tw`self-center`}>
            <Icon name="edit" type="feather" iconStyle={tw`text-gray-300`} />
          </View>
        </View>
        <PlusButton onPress={() => setShowModal(!showModal)} />
      </View>
    </AppLayout>
  );
}

export default Barang;
