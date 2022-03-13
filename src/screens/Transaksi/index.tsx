import { yupResolver } from '@hookform/resolvers/yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';
import Multiselect from 'react-native-multiple-select';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import PlusButton from '../../components/atoms/PlusButton';
import CatetinModal from '../../components/molecules/Modal';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import { RootState } from '../../store';

interface ICatetinTransaksi {
  barang_id: number;
  created_at: Date;
  harga: number;
  nama_barang: string;
  stok: number;
  updated_at: Date;
  user_id: number;
}

const schema = yup.object().shape({
  id: yup.number(),
  name: yup.string().required('Nama transaksi is required'),
  tipe: yup.mixed().required('Tipe transaksi is required'),
  tanggal: yup.date().required('Tanggal transaksi is required'),
  barang: yup.mixed().when('tipe', {
    is: (value: any) => value === 3 || value === 4,
    then: (rule) => rule.required('Barang is required'),
  }),
  deskripsi: yup.string(),
});

function Transaksi() {
  const [showModal, setShowModal] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: 0,
      name: '',
      tipe: null,
      tanggal: new Date(),
      barang: undefined,
      deskripsi: '',
    },
  });

  const { accessToken } = useAppSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [barang, setBarang] = useState<ICatetinTransaksi[]>([]);
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
      console.log(barang);
      setBarang(barang);
      setLoadingFetch(false);
    } catch (err) {
      console.log(err);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchBarang();
  }, [fetchBarang]);

  const optionsTransaksi = [
    {
      label: 'Pengeluaran',
      value: 1,
    },
    {
      label: 'Pemasukan',
      value: 2,
    },
    {
      label: 'Penjualan',
      value: 3,
    },
    {
      label: 'Pembelian barang',
      value: 4,
    },
  ];

  const multiSelectRef = useRef<any>();

  const pickerRef = useRef<any>();

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    console.log(data);
    setLoading(false);
  };
  return (
    <AppLayout headerTitle="Transaksi">
      <View style={tw`flex-1 px-4 py-3 relative`}>
        {showModal && (
          <CatetinModal
            modalVisible={showModal}
            setModalVisible={setShowModal}
            onClose={() => {
              reset({
                id: 0,
                name: '',
                tipe: null,
                tanggal: new Date(),
                barang: undefined,
                deskripsi: '',
              });
              setShowModal(false);
            }}
            onSave={handleSubmit(onSubmit)}
            loadingSave={loading}
          >
            <View style={tw`px-3 py-4`}>
              <View style={tw`mb-[20px]`}>
                <Text style={tw`text-center text-2xl font-bold`}>Tambah Transaksi</Text>
              </View>
              <View style={tw`mb-4`}>
                <Text style={tw`mb-1`}>Nama Transaksi</Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Nama transaksi"
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
              <View style={tw`mb-4`}>
                <View style={tw`mb-2`}>
                  <Text>Waktu transaksi</Text>
                </View>
                <View>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <DateTimePicker mode="datetime" value={value} onChange={(event: any, date) => onChange(date)} />
                    )}
                    name="tanggal"
                  />

                  {errors.tanggal && <Text style={tw`text-red-500 mt-1`}>{errors.tanggal.message}</Text>}
                </View>
              </View>
              <View style={tw`mb-4`}>
                <Text style={tw`mb-1`}>Tipe transaksi</Text>
                <TextInput
                  placeholder="Tipe transaksi"
                  style={tw`border border-gray-300 px-4 py-3 rounded`}
                  value={optionsTransaksi.find((option) => option.value === watch('tipe'))?.label}
                  autoCapitalize="none"
                  editable={false}
                  selectTextOnFocus={false}
                />
                {errors.tipe && <Text style={tw`text-red-500 mt-1`}>{errors.tipe.message}</Text>}

                <View>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Picker
                        ref={pickerRef}
                        selectedValue={value}
                        mode="dropdown"
                        onValueChange={(itemValue, itemIndex) => {
                          onChange(itemValue);
                        }}
                      >
                        {optionsTransaksi.map((option) => (
                          <Picker.Item label={option.label} value={option.value} key={option.value} />
                        ))}
                      </Picker>
                    )}
                    name="tipe"
                  />
                </View>
              </View>
              <View style={tw`mb-4`}>
                {(watch('tipe') === 3 || watch('tipe') === 4) && (
                  <View>
                    <Controller
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Multiselect
                          items={barang}
                          uniqueKey="barang_id"
                          ref={multiSelectRef}
                          onSelectedItemsChange={onChange}
                          selectedItems={value}
                          selectText="Pilih barang"
                          searchInputPlaceholderText="Cari Barang..."
                          tagRemoveIconColor="#CCC"
                          styleRowList={tw`px-2 py-3`}
                          styleListContainer={tw`rounded-xl bg-gray-100`}
                          tagBorderColor="#CCC"
                          selectedItemTextColor="#CCC"
                          selectedItemIconColor="#CCC"
                          tagTextColor="#CCC"
                          itemTextColor="#000"
                          displayKey="nama_barang"
                          searchInputStyle={tw`py-3`}
                          submitButtonColor="#CCC"
                          submitButtonText="Submit"
                        />
                      )}
                      name="barang"
                    />
                    {errors.barang && <Text style={tw`text-red-500 mt-1`}>{errors.barang.message}</Text>}
                  </View>
                )}
              </View>

              <View style={tw`mb-2`}>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Deskripsi"
                      style={tw`border border-gray-300 px-4 py-3 rounded`}
                      onBlur={onBlur}
                      onChangeText={(value) => {
                        onChange(value);
                      }}
                      value={value}
                      autoCapitalize="none"
                    />
                  )}
                  name="deskripsi"
                />
                {errors.deskripsi && <Text style={tw`text-red-500 mt-1`}>{errors.deskripsi.message}</Text>}
              </View>
              <View style={tw`mt-5 flex flex-row justify-between items-center px-3`}>
                <View>
                  <Text style={tw`text-xl`}>Total</Text>
                </View>
                <View>
                  <Text style={tw`text-lg`}>250000</Text>
                </View>
              </View>
            </View>
          </CatetinModal>
        )}

        <PlusButton
          onPress={() => {
            setShowModal(!showModal);
          }}
        />
      </View>
    </AppLayout>
  );
}

export default Transaksi;
