import BottomSheet from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, AsyncStorage, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Icon } from 'react-native-elements';
import tw from 'twrnc';
import Toast from 'react-native-toast-message';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { ICatetinBarang, ICatetinBarangWithTransaksi } from '../../types/barang';
import TransactionAction from '../Transaksi/TransactionAction';
import CreateModal from './BarangBottomSheet';
import BarangDetailBottomSheet from './BarangDetailBottomSheet';
import BarangFilterBottomSheet from './BarangFilterBottomSheet';

export interface IFormSchema {
  id: number;
  name: string;
  harga: number | string;
  barang_picture: string | null;
}

const schema = yup.object().shape({
  id: yup.number(),
  name: yup.string().required('Nama barang is required'),
  harga: yup.number().typeError('Please input number').required('Harga is required'),
  barang_picture: yup.mixed(),
});

function Barang() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<IFormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      id: 0,
      name: '',
      harga: '',
      barang_picture: null,
    },
  });

  const [loading, setLoading] = useState(false);
  const [barang, setBarang] = useState<ICatetinBarang[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(true);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetRefFilter = useRef<BottomSheet>(null);
  const bottomSheetRefDetail = useRef<BottomSheet>(null);

  const [preview, setPreview] = useState<ICatetinBarang | null>(null);

  const fetchBarang = useCallback(async (params = {}) => {
    setLoadingFetch(true);
    try {
      const {
        data: { data },
      } = await axiosCatetin.get('/barang', {
        params,
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      console.log(data);
      setBarang(data);
      setLoadingFetch(false);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    fetchBarang();
  }, [fetchBarang]);

  const [loadDetail, setLoadDetail] = useState(true);
  const [barangTransaksi, setBarangTransaksi] = useState<ICatetinBarangWithTransaksi | null>(null);

  const handleEdit = (barang: ICatetinBarang) => {
    setValue('name', barang.name);
    setValue('harga', barang.price);
    setValue('id', barang.id);
    setValue('barang_picture', barang.picture);
    bottomSheetRef.current?.expand();
  };

  const onPost = async (data: IFormSchema) => {
    await axiosCatetin.post(
      '/barang',
      {
        name: data.name,
        price: data.harga,
        picture: data.barang_picture,
      },
      {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      },
    );
  };

  const onPatch = async (data: IFormSchema) => {
    await axiosCatetin.put(
      '/barang',
      {
        id: data.id,
        name: data.name,
        price: data.harga,
        picture: data.barang_picture,
      },
      {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      },
    );
  };

  const snapPoints = useMemo(() => ['50%', '75%'], []);

  const handleViewDetail = async (singleBarang: ICatetinBarang) => {
    try {
      setLoadDetail(true);
      bottomSheetRefDetail.current?.expand();
      const {
        data: { data: barangTransaksiData },
      } = await axiosCatetin.get(`/barang/${singleBarang.id}`, {
        params: {
          transaksi: true,
        },
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      console.log(barangTransaksiData);
      setBarangTransaksi(barangTransaksiData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadDetail(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (data.id !== 0) {
        await onPatch(data);
      } else {
        await onPost(data);
      }
      reset({
        id: 0,
        name: '',
        harga: '',
        barang_picture: null,
      });
      Toast.show({
        type: 'customToast',
        text2: `Berhasil ${data.id !== 0 ? 'memperbarui' : 'menambah'} barang`,
        position: 'bottom',
      });
      fetchBarang();
      bottomSheetRef?.current?.close();
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
    <AppLayout headerTitle="Barang">
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
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
        </BottomSheet>
      </Portal>
      <BarangFilterBottomSheet
        onResetSort={(query) => {
          bottomSheetRefFilter.current?.close();
          fetchBarang(query);
        }}
        onApplySort={(query) => {
          bottomSheetRefFilter.current?.close();
          console.log(query);
          fetchBarang(query);
        }}
        bottomSheetRefFilter={bottomSheetRefFilter}
      />
      <BarangDetailBottomSheet
        bottomSheetRefDetail={bottomSheetRefDetail}
        data={barangTransaksi}
        loading={loadDetail}
      />
      <TransactionAction
        onClickPlus={() => {
          reset({
            id: 0,
            name: '',
            harga: '',
            barang_picture: null,
          });
          bottomSheetRef.current?.expand();
        }}
        onClickFilter={() => {
          bottomSheetRefFilter.current?.expand();
        }}
      />

      <CatetinScrollView style={tw`flex-1`}>
        <View style={tw`px-4 py-5`}>
          {loadingFetch ? (
            <ActivityIndicator />
          ) : (
            barang.map((singleBarang: ICatetinBarang) => (
              <Fragment key={singleBarang.id}>
                <TouchableOpacity
                  style={tw`px-3 py-2 mb-2 flex flex-row`}
                  onPress={() => {
                    handleViewDetail(singleBarang);
                  }}
                >
                  <View style={tw`self-center mr-3`}>
                    <Avatar
                      size={64}
                      source={{
                        uri: singleBarang?.picture || undefined,
                      }}
                      avatarStyle={tw`rounded-[12px]`}
                      containerStyle={tw`bg-gray-300 rounded-[12px]`}
                      titleStyle={tw`text-gray-200`}
                    ></Avatar>
                  </View>
                  <View style={tw`flex-grow-1 flex flex-row justify-between`}>
                    <View>
                      <View>
                        <Text style={tw`text-lg font-bold`}>{singleBarang.name}</Text>
                      </View>
                      <View>
                        <Text style={tw`text-base`}>Stok: {singleBarang.stock}</Text>
                      </View>
                      <View>
                        <Text style={tw`text-base`}>IDR {singleBarang.price.toLocaleString()}</Text>
                      </View>
                    </View>
                    <View style={tw`self-center`}>
                      <TouchableOpacity
                        onPress={() => {
                          handleEdit(singleBarang);
                        }}
                      >
                        <Icon name="edit" type="font-awesome-5" size={18} tvParallaxProperties=""></Icon>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Fragment>
            ))
          )}
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default Barang;
