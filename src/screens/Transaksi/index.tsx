import { yupResolver } from '@hookform/resolvers/yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import PlusButton from '../../components/atoms/PlusButton';
import CatetinInput from '../../components/molecules/Input';
import CatetinModal from '../../components/molecules/Modal';
import CatetinSelect from '../../components/molecules/Select';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import { RootState } from '../../store';
import { ICatetinBarang } from '../../types/barang';

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
    is: (tipe: any) => tipe?.value === 3 || tipe?.value === 4,
    then: (rule) => rule.required('Barang is required'),
  }),
  deskripsi: yup.string(),
});

function Transaksi() {
  const [showModal, setShowModal] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);
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
      barang: null,
      deskripsi: '',
    },
  });

  const { accessToken } = useAppSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [barang, setBarang] = useState<ICatetinTransaksi[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(true);

  const [showOptions, setShowOptions] = useState(false);
  const [showOptionsBarang, setShowOptionsBarang] = useState(false);

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

  const [showDateModalContent, setShowDateModalContent] = useState(false);
  const [showTipeTransaksiContent, setShowTipeTransaksiContent] = useState(false);
  const [showBarangContent, setShowBarangContent] = useState(false);

  const [loadingTransaksi, setLoadingTransaksi] = useState(true);

  const [barangAmount, setBarangAmount] = useState<Record<string, number>>({});

  const fetchTransaksi = useCallback(async () => {
    setLoadingTransaksi(true);
    try {
      const { data } = await axiosCatetin.get('/get/transaksi', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(data, 'transaksi');
      setLoadingTransaksi(false);
    } catch (err) {
      console.log(err);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchTransaksi();
  }, [fetchTransaksi]);

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  const [total, setTotal] = useState(0);

  useEffect(() => {
    let newTotal = 0;
    watch('barang')?.forEach((barang: ICatetinBarang) => {
      newTotal += barangAmount[barang.barang_id] * barang.harga;
    });
    setTotal(newTotal);
  }, [barangAmount, watch('barang')]);

  const onSubmit = async (data) => {
    setLoading(true);
    let total = 0;
    data.barang?.forEach((barang: ICatetinBarang) => {
      total += barangAmount[barang.barang_id] * barang.harga;
    });
    const finalData = {
      title: data.name,
      barang: data.barang?.map(({ barang_id }) => ({ barang_id, amount: barangAmount[barang_id] || 1 })) || [],
      tipe_transaksi: data.tipe.value,
      tanggal: new Date(data.tanggal).getTime(),
      notes: data.deskripsi,
      total,
    };
    console.log(finalData);
    try {
      await axiosCatetin.post('/insert/transaksi', finalData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setLoading(false);
      setBarangAmount({});
      onCloseModal();
      fetchTransaksi();
    } catch (err) {
      setLoading(false);
      console.error(err.response?.data?.message || 'Failed to post');
    }
  };

  const modalTitle = showModalContent
    ? 'Tambah Transaksi'
    : showDateModalContent
    ? 'Date and Time'
    : showTipeTransaksiContent
    ? 'Tipe Transaksi'
    : showBarangContent
    ? 'Barang'
    : undefined;

  const onSaveModal = () => {
    if (showModalContent) {
      handleSubmit(onSubmit)();
    } else if (showDateModalContent) {
      setShowModalContent(true);
      setShowDateModalContent(false);
    } else if (showTipeTransaksiContent) {
      setShowModalContent(true);
      setShowTipeTransaksiContent(false);
    } else if (showBarangContent) {
      setShowModalContent(true);
      setShowBarangContent(false);
    }
  };
  const onCloseModal = () => {
    if (showModalContent) {
      reset({
        id: 0,
        name: '',
        tipe: null,
        tanggal: new Date(),
        barang: null,
        deskripsi: '',
      });
      setShowModal(false);
      setShowModalContent(false);
    } else if (showDateModalContent) {
      setShowModalContent(true);
      setShowDateModalContent(false);
    } else if (showTipeTransaksiContent) {
      setShowModalContent(true);
      setShowTipeTransaksiContent(false);
    } else if (showBarangContent) {
      setShowModalContent(true);
      setShowBarangContent(false);
    }
  };

  const onSelectBarangOption = (option) => {
    setShowOptionsBarang(!showOptionsBarang);
    let cloneBarang: ICatetinBarang[] = [...(watch('barang') || [])];
    if (cloneBarang.some((barang) => barang.barang_id === option.barang_id)) {
      cloneBarang = cloneBarang.filter((barang) => barang.barang_id !== option.barang_id);
    } else {
      cloneBarang.push(option);
    }
    return cloneBarang;
  };
  return (
    <AppLayout headerTitle="Transaksi">
      <View style={tw`flex-1 px-4 py-3 relative`}>
        {showModal && (
          <CatetinModal
            modalVisible={showModal}
            setModalVisible={setShowModal}
            onClose={() => {
              onCloseModal();
            }}
            onSave={() => {
              onSaveModal();
            }}
            showSave={showModalContent}
            loadingSave={loading}
            title={modalTitle}
          >
            <View style={tw`px-3 py-4 flex-1`}>
              {showModalContent && (
                <>
                  <View style={tw`mb-4`}>
                    <Controller
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CatetinInput
                          placeholder="Nama Transaksi"
                          onChangeText={onChange}
                          value={value}
                          autoCapitalize="none"
                        />
                      )}
                      name="name"
                    />
                    {errors.name && <Text style={tw`text-red-400 text-3 mt-1`}>{errors.name.message}</Text>}
                  </View>
                  <View style={tw`mb-4`}>
                    <CatetinInput
                      placeholder="Tanggal Transaksi"
                      autoCapitalize="none"
                      onTouchStart={() => {
                        setShowModalContent(false);
                        setShowDateModalContent(true);
                      }}
                      value={watch('tanggal')?.toISOString().split('T')[0]}
                    />
                  </View>
                  <View style={tw`mb-4`}>
                    <CatetinInput
                      placeholder="Tipe Transaksi"
                      autoCapitalize="none"
                      onTouchStart={() => {
                        setShowModalContent(false);
                        setShowTipeTransaksiContent(true);
                      }}
                      value={watch('tipe')?.label}
                    />

                    {errors.tipe && <Text style={tw`text-red-500 mt-1`}>{errors.tipe.message}</Text>}
                  </View>
                  {(watch('tipe')?.value === 3 || watch('tipe')?.value === 4) && (
                    <View style={tw`mb-4`}>
                      <CatetinInput
                        placeholder="Barang"
                        autoCapitalize="none"
                        onTouchStart={() => {
                          setShowModalContent(false);
                          setShowBarangContent(true);
                        }}
                        value={watch('barang')
                          ?.map((barang) => barang.nama_barang)
                          .join(', ')}
                      />
                      {errors.barang && <Text style={tw`text-red-500 mt-1`}>{errors.barang.message}</Text>}
                    </View>
                  )}
                  <View style={tw`mb-2`}>
                    <Controller
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CatetinInput
                          placeholder="Deskripsi"
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
                      <Text style={tw`text-lg`}>Total</Text>
                    </View>
                    <View>
                      <Text style={tw`text-lg`}>{total}</Text>
                    </View>
                  </View>
                </>
              )}

              {showDateModalContent && (
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <DateTimePicker
                      display="spinner"
                      mode="datetime"
                      value={value}
                      onChange={(event: any, date) => onChange(date)}
                    />
                  )}
                  name="tanggal"
                />
              )}
              {showTipeTransaksiContent && (
                <>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CatetinSelect
                        onCollapse={() => {
                          setShowOptions(!showOptions);
                        }}
                        showOptions={showOptions}
                        onSelectOption={(option) => {
                          setShowOptions(!showOptions);
                          onChange(option);
                        }}
                        options={optionsTransaksi}
                        selected={value}
                      ></CatetinSelect>
                    )}
                    name="tipe"
                  />
                </>
              )}
              {showBarangContent && (
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CatetinSelect
                      onCollapse={() => {
                        setShowOptionsBarang(!showOptionsBarang);
                      }}
                      showOptions={showOptionsBarang}
                      onSelectOption={(option) => {
                        const filteredBarang = onSelectBarangOption(option);
                        onChange(filteredBarang);
                      }}
                      options={barang}
                      selected={value}
                      labelKey="nama_barang"
                      valueKey="barang_id"
                      placeholder="Barang"
                      multiple
                      count
                      onChangeAmount={(value, id) => {
                        setBarangAmount((prevBarangAmt) => ({
                          ...prevBarangAmt,
                          [id]: parseInt(value, 10),
                        }));
                      }}
                      amountData={barangAmount}
                    ></CatetinSelect>
                  )}
                  name="barang"
                />
              )}
            </View>
          </CatetinModal>
        )}
        <PlusButton
          onPress={() => {
            setShowModal(true);
            setShowModalContent(true);
          }}
        />
      </View>
    </AppLayout>
  );
}

export default Transaksi;
