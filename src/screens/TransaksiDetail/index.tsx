import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/id';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, Text, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import { StackActions } from '@react-navigation/native';
import CatetinButton from '../../components/molecules/Button';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { optionsTransaksi } from '../../static/optionsTransaksi';
import { RootState } from '../../store';
import { ICatetinTransaksiWithDetail } from '../../types/transaksi';
moment.locale('id');

function TransactionDetailScreen(props: any) {
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [dataDetail, setDataDetail] = useState<ICatetinTransaksiWithDetail | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);

  useEffect(() => {
    if (props.route.params?.from === 'transaction-barang-edit') {
      fetchTransaksiDetail(selectedTransaction);
    }
  }, [props.route.params?.from, selectedTransaction]);

  const fetchTransaksiDetail = async (id: number, refreshing = false) => {
    if (refreshing) {
      setRefreshing(true);
    } else {
      setLoadingDetail(true);
    }
    try {
      const {
        data: { data },
      } = await axiosCatetin.get(`/transaksi/${id}`);
      setDataDetail(data);
    } catch (err: any) {
      console.log(err);
    } finally {
      if (refreshing) {
        setRefreshing(false);
      } else {
        setLoadingDetail(false);
      }
    }
  };

  const { navigate }: any = useNavigation();

  useEffect(() => {
    if (refreshing) {
      fetchTransaksiDetail(selectedTransaction as number, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshing]);

  useEffect(() => {
    if (selectedTransaction) {
      fetchTransaksiDetail(selectedTransaction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTransaction]);

  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDeleteTransactionDetailScreen = async (itemId: number, transactionId: number) => {
    setLoadingDelete(true);
    try {
      await axiosCatetin.delete(`/transaksi/detail`, {
        data: {
          transaksi_id: transactionId,
          barang_id: itemId,
        },
      });
      CatetinToast(200, 'default', 'Berhasil menghapus detail transaksi');
      fetchTransaksiDetail(selectedTransaction as number);
    } catch (err: any) {
      CatetinToast(err?.response?.status, 'error', 'Failed to delete transaction detail');
    } finally {
      setLoadingDelete(false);
    }
  };

  const navigation = useNavigation();

  return (
    <AppLayout
      header
      isBackEnabled
      headerTitle={dataDetail?.title}
      onPressBack={() => {
        const popAction = StackActions.popToTop();
        navigation.dispatch(popAction);
      }}
    >
      <CatetinScrollView
        style={tw`px-3`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
            }}
          />
        }
      >
        {loadingDetail ? (
          <ActivityIndicator color="#2461FF" />
        ) : (
          <>
            {[19, 20].includes(dataDetail?.TransactionTransactionTypes[0]?.TransactionType.id || 0) && (
              <Text
                style={tw`text-blue-500 text-base text-right`}
                onPress={() => {
                  navigate('TransactionBarangScreen', {
                    id: dataDetail?.id,
                    type: dataDetail?.TransactionTransactionTypes[0]?.TransactionType.rootType,
                  });
                }}
              >
                Tambah Barang
              </Text>
            )}
            <Text style={tw`text-xl font-medium`}>Nama:</Text>
            <Text style={tw`text-base mb-2`}>{dataDetail?.title}</Text>
            <Text style={tw`text-xl font-medium`}>Tanggal:</Text>
            <Text style={tw`text-base mb-2`}>{moment(dataDetail?.transaction_date).format('dddd, DD MMMM YYYY')}</Text>
            <Text style={tw`text-xl font-medium`}>Waktu:</Text>
            <Text style={tw`text-base mb-2`}>{moment(dataDetail?.transaction_date).format('HH:mm')}</Text>
            <Text style={tw`text-xl font-medium `}>Tipe:</Text>
            <Text style={tw`text-base mb-2`}>
              {
                optionsTransaksi.find(
                  (opt) => opt.value === dataDetail?.TransactionTransactionTypes[0]?.TransactionType.rootType,
                )?.label
              }
            </Text>
            <Text style={tw`text-xl font-medium `}>Kategori:</Text>
            <Text
              style={tw`text-base mb-2 ${
                dataDetail?.TransactionTransactionTypes[0]?.TransactionType.deleted ? 'text-red-500' : ''
              }`}
            >
              {`${dataDetail?.TransactionTransactionTypes[0]?.TransactionType.name} ${
                dataDetail?.TransactionTransactionTypes[0]?.TransactionType.deleted ? '(tidak tersedia)' : ''
              }`}
            </Text>
            <Text style={tw`text-xl font-medium`}>Nominal:</Text>
            <Text style={tw`text-base mb-2`}>IDR {dataDetail?.nominal.toLocaleString('id-ID')}</Text>
            <Text style={tw`text-xl font-medium`}>Deskripsi:</Text>
            <Text style={tw`text-base mb-2 mb-2`}>{dataDetail?.notes || '-'}</Text>

            {[19, 20].includes(dataDetail?.TransactionTransactionTypes[0]?.TransactionType.id || 0) && (
              <View>
                {(dataDetail?.Items.length || 0) > 0 && <Text style={tw`text-xl font-medium`}>List Barang:</Text>}
                {dataDetail?.Items.map((item) => (
                  <View
                    style={tw`bg-white ${item.deleted ? '' : ''} shadow-lg rounded-[12px] relative px-4 py-2 mb-3`}
                    key={item.id}
                  >
                    {item.deleted && <Text style={tw`mb-2 font-bold text-sm text-red-500`}>Barang tidak tersedia</Text>}
                    <Avatar
                      size={72}
                      source={{
                        uri: item.picture || undefined,
                      }}
                      avatarStyle={tw`rounded-[8px]`}
                      containerStyle={tw`bg-gray-300 rounded-[12px] mb-1`}
                    ></Avatar>
                    <Text style={tw`text-xl`}>{item.name}</Text>
                    <Text style={tw`text-base mb-2`}>Jumlah: {item.ItemTransaction.amount}</Text>
                    <Text style={tw`text-base mb-2`}>Harga: {item.ItemTransaction.price?.toLocaleString('id-ID')}</Text>
                    <Text style={tw`text-base mb-2`}>
                      Total: IDR {item.ItemTransaction.total.toLocaleString('id-ID')}
                    </Text>
                    <Text style={tw`text-base mb-2`}>Notes: {item.ItemTransaction.notes || '-'}</Text>
                    <CatetinButton
                      title="Edit"
                      onPress={() => {
                        navigate('TransactionBarangEditScreen', {
                          data: item,
                          type: dataDetail?.TransactionTransactionTypes[0]?.TransactionType.rootType,
                        });
                      }}
                      style={tw`mb-2`}
                      disabled={item.deleted}
                    ></CatetinButton>
                    <CatetinButton
                      title="Delete"
                      theme="danger"
                      onPress={() => {
                        Alert.alert(
                          'Confirm Delete',
                          'Are you sure want to delete this item correlated with this transaction? This action can not be restored',
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel',
                            },
                            {
                              text: 'OK',
                              onPress: async () => {
                                handleDeleteTransactionDetailScreen(
                                  item.ItemTransaction.ItemId,
                                  item.ItemTransaction.TransactionId,
                                );
                              },
                            },
                          ],
                        );
                      }}
                      disabled={loadingDelete}
                    ></CatetinButton>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </CatetinScrollView>
    </AppLayout>
  );
}

export default TransactionDetailScreen;
