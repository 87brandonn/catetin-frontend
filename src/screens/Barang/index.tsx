import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, AsyncStorage, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { ICatetinBarang } from '../../types/barang';
import { titleCase } from '../../utils';
import CreateModal from './BarangBottomSheet';

export interface IFormSchema {
  id: number;
  name: string;
  stok: number;
  harga: number;
}

const schema = yup.object().shape({
  id: yup.number(),
  name: yup.string().required('Nama barang is required'),
  stok: yup.number().typeError('Please input number').required('Stok is required'),
  harga: yup.number().typeError('Please input number').required('Harga is required'),
});

function Barang() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<IFormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      id: 0,
      name: '',
      stok: 0,
      harga: 0,
    },
  });

  const [loading, setLoading] = useState(false);
  const [barang, setBarang] = useState<ICatetinBarang[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(true);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const bottomSheetRefFilter = useRef<BottomSheetModal>(null);

  const fetchBarang = useCallback(async () => {
    setLoadingFetch(true);
    try {
      const {
        data: { barang },
      } = await axiosCatetin.get('/barang', {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setBarang(barang);
      setLoadingFetch(false);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    fetchBarang();
  }, [fetchBarang]);

  const handleEdit = (barang: any) => {
    reset({
      name: barang.nama_barang,
      stok: barang.stok,
      harga: barang.harga,
      id: barang.barang_id,
    });
    bottomSheetRef.current?.present();
  };

  const onPost = async (data: any) => {
    await axiosCatetin.post(
      '/barang',
      {
        nama_barang: data.name,
        stok: data.stok,
        harga: data.harga,
      },
      {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      },
    );
  };

  const onPatch = async (data: any) => {
    await axiosCatetin.put(
      '/barang',
      {
        barang_id: data.id,
        nama_barang: data.name,
        stok: data.stok,
        harga: data.harga,
      },
      {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      },
    );
  };

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  const snapPoints = useMemo(() => ['50%', '75%'], []);

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
        stok: 0,
        harga: 0,
      });
      fetchBarang();
      bottomSheetRef?.current?.close();
    } catch (err: any) {
      console.log(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AppLayout headerTitle="Barang">
      <BottomSheetModal
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={tw`bg-white shadow-lg`}
        enablePanDownToClose
      >
        <CreateModal
          control={control}
          errors={errors}
          watch={watch}
          loading={loading}
          onSave={() => handleSubmit(onSubmit)()}
          title="Create Barang"
        />
      </BottomSheetModal>
      <BottomSheetModal
        ref={bottomSheetRefFilter}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={tw`bg-white shadow-lg`}
        enablePanDownToClose
      >
        <View style={tw`flex-1 px-3`}>
          <Text style={tw`text-xl text-center font-bold mb-3`}>Sort</Text>
          {Object.keys(barang?.[0] || {}).map((field) => (
            <TouchableOpacity key={field}>
              <View style={tw`flex flex-row justify-between px-4`}>
                <View style={tw`py-3 mb-2 rounded-[12px]`}>
                  <Text>{titleCase(field)}</Text>
                </View>
                <View>
                  <Icon name="sort-desc" type="font-awesome" iconStyle={tw`text-gray-200`} tvParallaxProperties="" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetModal>
      <View style={tw`pb-2 px-3 flex flex-row justify-between items-center`}>
        <View style={tw`flex-grow-1 mr-3`}>
          <TextInput style={tw`bg-gray-100 px-3 py-2 rounded-[12px]`} placeholder="Search" />
        </View>
        <View style={tw`mr-3`}>
          <TouchableOpacity
            onPress={() => {
              reset({
                id: 0,
                name: '',
                stok: 0,
                harga: 0,
              });
              bottomSheetRef.current?.present();
            }}
          >
            <Icon name="plus" type="ant-design" tvParallaxProperties="" />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              bottomSheetRefFilter.current?.present();
            }}
          >
            <Icon name="sort" type="material-icon" tvParallaxProperties="" />
          </TouchableOpacity>
        </View>
      </View>
      <CatetinScrollView style={tw`flex-1`}>
        <View style={tw`px-4 py-5`}>
          {loadingFetch ? (
            <ActivityIndicator />
          ) : (
            barang.map((singleBarang: ICatetinBarang) => (
              <View
                style={tw`shadow-lg bg-white rounded-[12px] px-3 py-2 mb-2 flex flex-row justify-between`}
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
                    <Icon name="edit" type="feather" iconStyle={tw`text-gray-300`} tvParallaxProperties="" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default Barang;
