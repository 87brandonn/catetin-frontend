import BottomSheet, { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, AsyncStorage, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Icon } from 'react-native-elements';
import ImageView from 'react-native-image-viewing';
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { ICatetinBarang, ICatetinBarangWithTransaksi } from '../../types/barang';
import { titleCase } from '../../utils';
import CreateModal from './BarangBottomSheet';

export interface IFormSchema {
  id: number;
  name: string;
  harga: number | string;
  barang_picture: string | null;
}

const CustomBackdrop = ({ animatedIndex, style }: BottomSheetBackdropProps) => {
  // animated variables
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [0, 1], [0, 1], Extrapolate.CLAMP),
  }));

  // styles
  const containerStyle = useMemo(
    () => [
      style,
      {
        backgroundColor: '#a8b5eb',
      },
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle],
  );

  return <Animated.View style={containerStyle} />;
};
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

  const optionsFilter = [
    {
      label: 'Stok',
      value: 'stok',
    },
    {
      label: 'Harga',
      value: 'harga',
    },
    {
      label: 'Nama Barang',
      value: 'nama_barang',
    },
  ];

  const [queryFilter, setQueryFilter] = useState<{
    sort: Array<string> | undefined;
    nama_barang: string | undefined;
  }>({
    sort: undefined,
    nama_barang: undefined,
  });

  const fetchBarang = useCallback(async (params = {}) => {
    setLoadingFetch(true);
    try {
      const {
        data: { barang },
      } = await axiosCatetin.get('/barang', {
        params,
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

  const [viewBarangMode, setViewBarangMode] = useState(false);

  const [loadDetail, setLoadDetail] = useState(true);
  const [barangTransaksi, setBarangTransaksi] = useState<ICatetinBarangWithTransaksi[] | null>(null);

  const handleEdit = (barang: ICatetinBarang) => {
    console.log(barang);
    setValue('name', barang.nama_barang);
    setValue('harga', barang.harga);
    setValue('id', barang.barang_id);
    setValue('barang_picture', barang.barang_picture);
    bottomSheetRef.current?.expand();
  };

  const onPost = async (data: IFormSchema) => {
    await axiosCatetin.post(
      '/barang',
      {
        nama_barang: data.name,
        harga: data.harga,
        barang_picture: data.barang_picture,
      },
      {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      },
    );
  };

  const onPatch = async (data: IFormSchema) => {
    console.log({
      barang_id: data.id,
      nama_barang: data.name,
      harga: data.harga,
      barang_picture: data.barang_picture,
    });
    await axiosCatetin.put(
      '/barang',
      {
        barang_id: data.id,
        nama_barang: data.name,
        harga: data.harga,
        barang_picture: data.barang_picture,
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

  const handleViewDetail = async (singleBarang: ICatetinBarang) => {
    try {
      setLoadDetail(true);
      setPreview(singleBarang);
      bottomSheetRefDetail.current?.expand();
      const {
        data: { data: barangTransaksiData },
      } = await axiosCatetin.get(`/barang/${singleBarang.barang_id}`, {
        params: {
          transaksi: true,
        },
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setBarangTransaksi(barangTransaksiData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadDetail(false);
    }
  };

  const handleSort = (value: string) => {
    let serializeQuery: {
      sort: Array<string> | undefined;
      nama_barang: string | undefined;
    } = { ...queryFilter };
    const indexQuery = serializeQuery.sort?.findIndex((key) => value === key.replace('-', '')) as number;
    if (indexQuery === undefined || indexQuery === -1) {
      if (!serializeQuery.sort) {
        serializeQuery = {
          ...serializeQuery,
          sort: [`-${value}`],
        };
      } else {
        serializeQuery.sort?.push(`-${value}`);
      }
    } else if (serializeQuery.sort) {
      serializeQuery.sort[indexQuery] = serializeQuery.sort[indexQuery].includes('-') ? value : `-${value}`;
    }
    setQueryFilter(serializeQuery);
  };

  const handleResetSort = () => {
    setQueryFilter({
      sort: undefined,
      nama_barang: undefined,
    });
    bottomSheetRefFilter.current?.close();
    fetchBarang({});
  };

  const handleFetchSort = () => {
    bottomSheetRefFilter.current?.close();
    const filter = JSON.parse(JSON.stringify(queryFilter));
    filter.sort = filter.sort.join(',');
    console.log(filter);
    fetchBarang(filter);
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
      <ImageView
        images={[{ uri: preview?.barang_picture }]}
        imageIndex={0}
        visible={viewBarangMode}
        onRequestClose={() => setViewBarangMode(false)}
      />
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
      <Portal>
        <BottomSheet
          ref={bottomSheetRefFilter}
          index={-1}
          snapPoints={snapPoints}
          backgroundStyle={tw`bg-white shadow-lg`}
          enablePanDownToClose
        >
          <View style={tw`flex-1 px-3`}>
            <Text style={tw`text-xl text-center font-bold mb-3`}>Sort</Text>
            {optionsFilter.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                onPress={() => {
                  handleSort(value);
                }}
              >
                <View style={tw`flex flex-row justify-between px-4`}>
                  <View style={tw`py-3 mb-2 rounded-[12px]`}>
                    <Text>{titleCase(label)}</Text>
                  </View>
                  <View>
                    <Icon
                      name={`sort-${
                        queryFilter.sort?.find((key) => key.includes(value))?.includes('-') ? 'desc' : 'asc'
                      }`}
                      type="font-awesome"
                      iconStyle={tw`text-gray-200`}
                      tvParallaxProperties=""
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <Button
              title="Reset"
              buttonStyle={tw`bg-red-400 mb-3`}
              titleStyle={tw`font-bold`}
              onPress={() => {
                handleResetSort();
              }}
            />
            <Button
              title="Apply"
              buttonStyle={tw`bg-blue-500`}
              titleStyle={tw`font-bold`}
              onPress={() => {
                handleFetchSort();
              }}
            />
          </View>
        </BottomSheet>
      </Portal>

      <Portal>
        <BottomSheet
          ref={bottomSheetRefDetail}
          index={-1}
          snapPoints={snapPoints}
          backgroundStyle={tw`bg-white shadow-lg`}
          enablePanDownToClose
        >
          <CatetinScrollView style={tw`flex-1 px-4`}>
            <View style={tw`mb-4`}>
              <Text style={tw`font-bold text-lg text-center`}>Detail Barang</Text>
            </View>
            <View style={tw`self-center mb-4`}>
              <Avatar
                size={340}
                source={{
                  uri: preview?.barang_picture,
                }}
                avatarStyle={tw`rounded-[12px]`}
                containerStyle={tw`bg-gray-300 rounded-[12px]`}
                titleStyle={tw`text-gray-200`}
                key={preview?.barang_picture}
                onPress={() => {
                  if (preview?.barang_picture) {
                    setViewBarangMode(true);
                  }
                }}
              ></Avatar>
            </View>
            <View style={tw`mb-4`}>
              <Text style={tw`text-xl font-bold`}>Informasi Barang: </Text>
              <Text style={tw`text-base`}>Nama Barang : {preview?.nama_barang}</Text>
              <Text style={tw`text-base`}>Harga : IDR {preview?.harga.toLocaleString()}</Text>
              <Text style={tw`text-base`}>Stok : {preview?.stok}</Text>
            </View>
            <View style={tw`mb-[40px]`}>
              {loadDetail ? (
                <ActivityIndicator style={tw`text-center`} />
              ) : (
                (barangTransaksi?.[0]?.transaksi_data || []).length > 0 && (
                  <>
                    <Text style={tw`text-xl font-bold mb-2`}>Histori transaksi: </Text>
                    {barangTransaksi?.[0].transaksi_data.map((transaksi) => (
                      <Fragment key={transaksi.transaksi_id}>
                        <View style={tw`bg-white shadow-lg px-4 py-2 rounded-[12px] mb-4`}>
                          <Text style={tw`text-base`}>{transaksi.title}</Text>
                          <Text style={tw`text-base`}>Notes: {transaksi.notes || '-'}</Text>
                          <Text style={tw`text-base`}>IDR {transaksi.nominal_transaksi.toLocaleString()}</Text>
                          <Text style={tw`text-3`}>{moment(transaksi.tanggal).fromNow()}</Text>
                        </View>
                      </Fragment>
                    ))}
                  </>
                )
              )}
            </View>
            <View />
          </CatetinScrollView>
        </BottomSheet>
      </Portal>

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
                harga: '',
                barang_picture: null,
              });
              bottomSheetRef.current?.expand();
            }}
          >
            <Icon name="plus" type="ant-design" tvParallaxProperties="" />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              bottomSheetRefFilter.current?.expand();
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
              <Fragment key={singleBarang.barang_id}>
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
                        uri: singleBarang?.barang_picture || undefined,
                      }}
                      avatarStyle={tw`rounded-[12px]`}
                      containerStyle={tw`bg-gray-300 rounded-[12px]`}
                      titleStyle={tw`text-gray-200`}
                    ></Avatar>
                  </View>
                  <View style={tw`flex-grow-1 flex flex-row justify-between`}>
                    <View>
                      <View>
                        <Text style={tw`text-lg font-bold`}>{singleBarang.nama_barang}</Text>
                      </View>
                      <View>
                        <Text style={tw`text-base`}>Stok: {singleBarang.stok}</Text>
                      </View>
                      <View>
                        <Text style={tw`text-base`}>IDR {singleBarang.harga.toLocaleString()}</Text>
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
