import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import 'moment/min/locales';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Avatar, Button } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { optionsTransaksi } from '../../static/optionsTransaksi';
import { RootState } from '../../store';
import { setEditedTransaction } from '../../store/features/transactionSlice';
import { ICatetinTransaksiWithDetail } from '../../types/transaksi';

function TransactionDetail({ refreshing, onRefresh }: { refreshing: boolean; onRefresh: (refresh: boolean) => void }) {
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [dataDetail, setDataDetail] = useState<ICatetinTransaksiWithDetail | null>(null);

  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);
  const dispatch = useAppDispatch();

  const fetchTransaksiDetail = async (id: number, refreshing = false) => {
    if (refreshing) {
      onRefresh(true);
    } else {
      setLoadingDetail(true);
    }
    try {
      const {
        data: { data },
      } = await axiosCatetin.get(`/transaksi/${id}`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setDataDetail(data);
    } catch (err) {
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

  return loadingDetail ? (
    <ActivityIndicator />
  ) : (
    <>
      <Text style={tw` text-xl font-bold`}>Informasi Transaksi:</Text>
      <Text style={tw`text-base text-lg`}>Nama:</Text>
      <Text style={tw`text-base`}>{dataDetail?.title}</Text>
      <Text style={tw`text-base text-lg`}>Tanggal:</Text>
      <Text style={tw`text-base`}>
        {moment(dataDetail?.transaction_date).locale('id').format('dddd, DD MMMM YYYY')}
      </Text>
      <Text style={tw`text-base text-lg`}>Waktu:</Text>
      <Text style={tw`text-base`}>{moment(dataDetail?.transaction_date).format('HH:mm')}</Text>
      <Text style={tw`text-base text-lg `}>Tipe:</Text>
      <Text style={tw`text-base`}>
        {optionsTransaksi.find((opt) => opt.value === parseInt(dataDetail?.type || '0', 10))?.label}
      </Text>
      <Text style={tw`text-base text-lg`}>Nominal:</Text>
      <Text style={tw`text-base`}>IDR {dataDetail?.nominal.toLocaleString()}</Text>
      <Text style={tw`text-base text-lg`}>Deskripsi:</Text>
      <Text style={tw`text-base mb-2`}>{dataDetail?.notes || '-'}</Text>
      <CatetinButton
        title="Update Transaksi"
        onPress={() => {
          dispatch(setEditedTransaction(dataDetail));
        }}
        customStyle={'mb-3'}
      />
      {(dataDetail?.type === '3' || dataDetail?.type === '4') && (
        <View style={tw`mb-[72px]`}>
          <CatetinButton
            title="Update Detail Transaksi"
            onPress={() => {
              navigate('Transaction Detail Edit', {
                id: dataDetail.id,
                type: dataDetail.type,
              });
            }}
            customStyle={'mb-1'}
          />
          <Text style={tw` text-xl font-bold mb-2`}>Detail:</Text>
          {dataDetail.Items.map((item) => (
            <View
              style={tw`bg-white ${item.deleted ? 'opacity-50' : ''} shadow-lg rounded-[12px] relative px-4 py-2 mb-3`}
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
              <Text style={tw`text-base`}>Jumlah : {item.ItemTransaction.amount}</Text>
              <Text style={tw`text-base mb-1`}>IDR {item.ItemTransaction.total.toLocaleString()}</Text>
              <View>
                <CatetinButton
                  title="Edit"
                  onPress={() => {
                    navigate('Transaction Edit Quantity', {
                      data: item,
                      id: selectedTransaction,
                      type: dataDetail.type,
                    });
                  }}
                  disabled={item.deleted}
                ></CatetinButton>
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

export default TransactionDetail;
