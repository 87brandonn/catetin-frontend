import { ParamListBase, RouteProp } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AsyncStorage, RefreshControl, Text, View } from 'react-native';
import { Avatar, Button } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import { useAppDispatch, useAppSelector } from '../../hooks';
import CatetinScrollView from '../../layouts/ScrollView';
import { optionsTransaksi } from '../../static/optionsTransaksi';
import { RootState } from '../../store';
import { setEditedTransaction } from '../../store/features/transactionSlice';
import { ICatetinTransaksiWithDetail } from '../../types/transaksi';

function TransactionDetail(props: { route: RouteProp<ParamListBase, 'Transaction Detail'>; navigation: any }) {
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [dataDetail, setDataDetail] = useState<ICatetinTransaksiWithDetail | null>(null);

  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);
  const dispatch = useAppDispatch();

  const [refreshing, setRefreshing] = useState(false);

  const fetchTransaksiDetail = async (id: number, refreshing = false) => {
    if (refreshing) {
      setRefreshing(true);
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
        setRefreshing(false);
      } else {
        setLoadingDetail(false);
      }
    }
  };

  useEffect(() => {
    if (selectedTransaction) {
      fetchTransaksiDetail(selectedTransaction);
    }
  }, [selectedTransaction]);
  return (
    <CatetinScrollView
      style={tw`flex-1 px-3`}
      {...props}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            fetchTransaksiDetail(selectedTransaction as number, true);
          }}
        />
      }
    >
      <Text style={tw`text-xl text-center font-bold mb-3`}>Transaksi</Text>
      {loadingDetail ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={tw` text-xl font-bold`}>Informasi Transaksi:</Text>
          <Text style={tw`text-base text-lg`}>Nama:</Text>
          <Text style={tw`text-base`}>{dataDetail?.title}</Text>
          <Text style={tw`text-base text-lg`}>Tanggal:</Text>
          <Text style={tw`text-base`}>{moment(dataDetail?.transaction_date).toISOString()}</Text>
          <Text style={tw`text-base text-lg `}>Tipe:</Text>
          <Text style={tw`text-base`}>
            {optionsTransaksi.find((opt) => opt.value === parseInt(dataDetail?.type || '0', 10))?.label}
          </Text>
          <Text style={tw`text-base text-lg`}>Nominal:</Text>
          <Text style={tw`text-base`}>IDR {dataDetail?.nominal.toLocaleString()}</Text>
          <Text style={tw`text-base text-lg`}>Deskripsi:</Text>
          <Text style={tw`text-base mb-2`}>{dataDetail?.notes || '-'}</Text>
          <Button
            title="Update Transaksi"
            buttonStyle={tw`bg-blue-500 mb-3`}
            titleStyle={tw`font-bold`}
            onPress={() => {
              dispatch(setEditedTransaction(dataDetail));
            }}
          ></Button>
          {(dataDetail?.type === '3' || dataDetail?.type === '4') && (
            <View style={tw`mb-[72px]`}>
              <Button
                title="Update Detail Transaksi"
                buttonStyle={tw`bg-blue-500 mb-3`}
                titleStyle={tw`font-bold`}
                onPress={() => {
                  props.navigation.navigate('Transaction Detail Edit', {
                    id: dataDetail.id,
                    type: dataDetail.type,
                  });
                }}
              ></Button>
              <Text style={tw` text-xl font-bold mb-2`}>Detail:</Text>
              {dataDetail.Items.map((item) => (
                <View
                  style={tw`bg-white ${
                    item.deleted ? 'opacity-50' : ''
                  } shadow-lg rounded-[12px] relative px-4 py-2 mb-3`}
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
                    <Button
                      title="Edit"
                      buttonStyle={tw`bg-blue-500`}
                      titleStyle={tw`font-bold`}
                      onPress={() => {
                        props.navigation.navigate('Transaction Edit Quantity', { data: item });
                      }}
                      disabled={item.deleted}
                    ></Button>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </CatetinScrollView>
  );
}

export default TransactionDetail;
