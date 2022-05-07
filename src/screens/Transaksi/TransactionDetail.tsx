import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/id';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinToast from '../../components/molecules/Toast';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { optionsTransaksi } from '../../static/optionsTransaksi';
import { RootState } from '../../store';
import { setEditedTransaction } from '../../store/features/transactionSlice';
import { ICatetinTransaksiWithDetail } from '../../types/transaksi';
moment.locale('id');

function TransactionDetail({ refreshing, onRefresh }: { refreshing: boolean; onRefresh: (refresh: boolean) => void }) {
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [dataDetail, setDataDetail] = useState<ICatetinTransaksiWithDetail | null>(null);

  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);
  const dispatch = useAppDispatch();

  const fetchTransaksiDetail = async (id: number, refreshing = false) => {
    console.log(id);
    if (refreshing) {
      onRefresh(true);
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
        onRefresh(false);
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

  const handleDeleteTransactionDetail = async (itemId: number, transactionId: number) => {
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

  return loadingDetail ? (
    <ActivityIndicator />
  ) : (
    <>
      <Text style={tw`text-base text-lg font-medium`}>Nama:</Text>
      <Text style={tw`text-base`}>{dataDetail?.title}</Text>
      <Text style={tw`text-base text-lg font-medium`}>Tanggal:</Text>
      <Text style={tw`text-base`}>{moment(dataDetail?.transaction_date).format('dddd, DD MMMM YYYY')}</Text>
      <Text style={tw`text-base text-lg font-medium`}>Waktu:</Text>
      <Text style={tw`text-base`}>{moment(dataDetail?.transaction_date).format('HH:mm')}</Text>
      <Text style={tw`text-base text-lg font-medium `}>Tipe:</Text>
      <Text style={tw`text-base`}>
        {optionsTransaksi.find((opt) => opt.value === parseInt(dataDetail?.type || '0', 10))?.label}
      </Text>
      <Text style={tw`text-base text-lg font-medium`}>Nominal:</Text>
      <Text style={tw`text-base`}>IDR {dataDetail?.nominal.toLocaleString('id-ID')}</Text>
      <Text style={tw`text-base text-lg font-medium`}>Deskripsi:</Text>
      <Text style={tw`text-base mb-2`}>{dataDetail?.notes || '-'}</Text>
      <CatetinButton
        title="Update Transaksi"
        onPress={() => {
          dispatch(setEditedTransaction(dataDetail));
        }}
        customStyle={'mb-3'}
      />
      {(dataDetail?.type === '3' || dataDetail?.type === '4') && (
        <View>
          <CatetinButton
            title="Tambah Barang"
            onPress={() => {
              navigate('Transaction Detail Edit', {
                id: dataDetail.id,
                type: dataDetail.type,
              });
            }}
            customStyle={'mb-2'}
          />
          {dataDetail.Items.length > 0 && <Text style={tw`text-base text-lg font-medium`}>List Barang:</Text>}
          {dataDetail.Items.map((item) => (
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
              <Text style={tw`text-base text-lg`}>{item.name}</Text>
              <Text style={tw`text-base`}>Jumlah: {item.ItemTransaction.amount}</Text>
              <Text style={tw`text-base`}>Harga: {item.ItemTransaction.price?.toLocaleString('id-ID')}</Text>
              <Text style={tw`text-base`}>Total: IDR {item.ItemTransaction.total.toLocaleString('id-ID')}</Text>
              <Text style={tw`text-base mb-1`}>Notes: {item.ItemTransaction.notes || '-'}</Text>
              <CatetinButton
                title="Edit"
                onPress={() => {
                  navigate('Transaction Edit Quantity', {
                    data: item,
                    id: selectedTransaction,
                    type: dataDetail.type,
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
                          handleDeleteTransactionDetail(
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
  );
}

export default TransactionDetail;
