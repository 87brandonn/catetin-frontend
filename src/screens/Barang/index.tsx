import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import PlusButton from '../../components/atoms/PlusButton';
import CatetinModal from '../../components/molecules/Modal';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';
import { ICatetinBarang } from '../../types/barang';

const schema = yup.object().shape({
  id: yup.number(),
  name: yup.string().required('Nama barang is required'),
  stok: yup.number().typeError('Please input number').required('Stok is required'),
  harga: yup.number().typeError('Please input number').required('Harga is required'),
});

function Barang() {
  const [showModal, setShowModal] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: 0,
      name: '',
      stok: '',
      harga: '',
    },
  });

  const { accessToken } = useAppSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [barang, setBarang] = useState<ICatetinBarang[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(true);

  const fetchBarang = useCallback(async () => {
    setLoadingFetch(true);
    try {
      const {
        data: { barang },
      } = await axiosCatetin.get('/get/barang', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setBarang(barang);
      setLoadingFetch(false);
    } catch (err) {
      console.log(err);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchBarang();
  }, [fetchBarang]);

  const handleEdit = (barang: any) => {
    console.log(barang);
    reset({
      name: barang.nama_barang,
      stok: barang.stok,
      harga: barang.harga,
      id: barang.barang_id,
    });
    setShowModal(true);
  };

  const onPost = async (data: any) => {
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
  };

  const onPatch = async (data: any) => {
    await axiosCatetin.post(
      '/update/barang',
      {
        barang_id: data.id,
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
  };

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      console.log(data);
      if (data.id !== 0) {
        await onPatch(data);
      } else {
        await onPost(data);
      }
      reset({
        id: 0,
        name: '',
        stok: '',
        harga: '',
      });
      setShowModal(false);
      fetchBarang();
    } catch (err: any) {
      console.log(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AppLayout headerTitle="Barang">
      <CatetinScrollView style={tw`flex-1`}>
        {showModal && (
          <CatetinModal
            modalVisible={showModal}
            setModalVisible={setShowModal}
            onClose={() => {
              reset({
                id: 0,
                name: '',
                stok: '',
                harga: '',
              });
              setShowModal(false);
            }}
            onSave={handleSubmit(onSubmit)}
            loadingSave={loading}
            title="Tambah Barang"
          >
            <View style={tw`px-3 py-4`}>
              <View style={tw`mb-2`}>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
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
                    <TextInput
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
                    <TextInput
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
            </View>
          </CatetinModal>
        )}

        {loadingFetch ? (
          <View></View>
        ) : (
          <View style={tw`px-4 py-3`}>
            {barang.map((singleBarang: ICatetinBarang) => (
              <View
                style={tw`px-4 py-2 rounded-lg shadow bg-white flex flex-row justify-between mb-3`}
                key={singleBarang.barang_id}
              >
                <View>
                  <View>
                    <Text style={tw`text-lg font-bold`}>{singleBarang.nama_barang}</Text>
                  </View>
                  <View>
                    <Text style={tw`text-gray-500`}>{singleBarang.stok}</Text>
                  </View>
                  <View>
                    <Text style={tw`text-gray-500`}>{singleBarang.harga}</Text>
                  </View>
                </View>
                <View style={tw`self-center`}>
                  <TouchableOpacity
                    onPress={() => {
                      handleEdit(singleBarang);
                    }}
                  >
                    <Icon name="edit" type="feather" iconStyle={tw`text-gray-300`} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </CatetinScrollView>

      <PlusButton
        onPress={() => {
          setShowModal(!showModal);
        }}
      />
    </AppLayout>
  );
}

export default Barang;
