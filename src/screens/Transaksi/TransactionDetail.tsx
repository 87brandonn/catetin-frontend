import { ParamListBase, RouteProp } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AsyncStorage, Text, View } from 'react-native';
import { Avatar, Button } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import { useAppSelector } from '../../hooks';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';
import { ICatetinTransaksiWithDetail } from '../../types/transaksi';

function TransactionDetail(props: { route: RouteProp<ParamListBase, 'Transaction Detail'>; navigation: any }) {
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [dataDetail, setDataDetail] = useState<ICatetinTransaksiWithDetail | null>(null);

  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);

  const fetchTransaksiDetail = async (id: number) => {
    setLoadingDetail(true);
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
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedTransaction) {
      fetchTransaksiDetail(selectedTransaction);
    }
  }, [selectedTransaction]);
  return (
    <CatetinScrollView style={tw`flex-1 px-3`} {...props}>
      <Text style={tw`text-xl text-center font-bold mb-3`}>Transaksi</Text>
      {loadingDetail ? (
        <ActivityIndicator />
      ) : (
        <>
          <View style={tw`mb-4`}>
            <Text style={tw` text-xl font-bold`}>Informasi Transaksi:</Text>
            <Text style={tw`text-base text-lg`}>Nama:</Text>
            <Text style={tw`text-base`}>{dataDetail?.title}</Text>
            <Text style={tw`text-base text-lg`}>Tanggal:</Text>
            <Text style={tw`text-base`}>{moment(dataDetail?.transaction_date).toISOString()}</Text>
            <Text style={tw`text-base text-lg `}>Tipe:</Text>
            <Text style={tw`text-base`}>Penjualan</Text>
            <Text style={tw`text-base text-lg`}>Nominal:</Text>
            <Text style={tw`text-base`}>{dataDetail?.nominal}</Text>
            <Text style={tw`text-base text-lg`}>Deskripsi:</Text>
            <Text style={tw`text-base`}>{dataDetail?.notes}</Text>
          </View>
          {(dataDetail?.type === '3' || dataDetail?.type === '4') && (
            <View style={tw`mb-[72px]`}>
              <Text style={tw` text-xl font-bold mb-2`}>Detail:</Text>
              <Button
                title="Tambah Barang"
                buttonStyle={tw`bg-blue-500 mb-3`}
                titleStyle={tw`font-bold`}
                onPress={() => {
                  props.navigation.navigate('Transaction Detail Edit');
                }}
              ></Button>
              {dataDetail.Items.map((item) => (
                <View style={tw`bg-white shadow-lg rounded-[12px] px-4 py-2 mb-3`} key={item.id}>
                  <Avatar
                    size={72}
                    source={{
                      uri: item.picture || undefined,
                    }}
                    avatarStyle={tw`rounded-[8px]`}
                    containerStyle={tw`bg-gray-300 rounded-[12px] mb-1`}
                  ></Avatar>
                  <Text style={tw`text-base text-lg`}>{item.name}</Text>
                  <Text style={tw`text-base mb-1`}>Jumlah : {item.ItemTransaction.amount}</Text>
                  <View>
                    <Button title="Edit" buttonStyle={tw`bg-blue-500`} titleStyle={tw`font-bold`}></Button>
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
