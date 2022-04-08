import React, { useCallback, useEffect, useState } from 'react';
import { TextInput, View, Text, AsyncStorage, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';
import tw from 'twrnc';
import { Avatar } from 'react-native-elements';
import TransactionBottomSheetWrapper from './TransactionBottomSheetWrapper';
import { ICatetinBarang } from '../../types/barang';
import { axiosCatetin } from '../../api';
import { RouteProp, ParamListBase } from '@react-navigation/native';
import { useAppSelector } from '../../hooks';
import { RootState } from '../../store';

function TransactionDetailEdit(props: { route: RouteProp<ParamListBase, 'Transaction Detail Edit'>; navigation: any }) {
  const [loadingFetch, setLoadingFetch] = useState(true);

  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);

  const [barang, setBarang] = useState<
    (ICatetinBarang & {
      amount: number;
    })[]
  >([]);

  const fetchBarang = useCallback(async (isMounted = true) => {
    setLoadingFetch(true);
    try {
      const {
        data: { data },
      }: { data: { data: ICatetinBarang[] } } = await axiosCatetin.get('/barang', {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      if (isMounted) {
        setBarang(data?.map((eachBarang) => ({ ...eachBarang, amount: 0 })));
        setLoadingFetch(false);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const handleAddBarang = async (
    barang: ICatetinBarang & {
      amount: number;
    },
    transactionId: number | null,
  ) => {
    try {
      await axiosCatetin.post(
        `/transaksi/detail`,
        {
          transaksi_id: transactionId,
          barang_id: barang.id,
          amount: barang.amount,
        },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          },
        },
      );
      props.navigation.navigate('Transaction Detail');
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchBarang();
  }, [fetchBarang]);
  return (
    <TransactionBottomSheetWrapper showBack title="Barang" to="Transaction Detail">
      <TextInput style={tw`bg-gray-100 px-3 py-3 rounded-[12px] mb-4`} placeholder="Search" />
      {loadingFetch ? (
        <ActivityIndicator />
      ) : (
        barang?.map((eachBarang, index) => (
          <View style={tw`px-4 py-2 shadow-lg bg-white rounded-[8px] mb-3`} key={eachBarang.id}>
            <Avatar
              size={72}
              source={{
                uri: eachBarang.picture || undefined,
              }}
              avatarStyle={tw`rounded-[8px]`}
              containerStyle={tw`bg-gray-300 rounded-[12px] mb-1`}
              key={eachBarang.picture}
            ></Avatar>
            <Text style={tw`text-base`}>{eachBarang.name}</Text>
            <Text style={tw`text-base`}>IDR {eachBarang.price.toLocaleString()}</Text>
            <Text style={tw`text-base mb-1`}>Stok: {eachBarang.stock.toLocaleString()}</Text>
            <TextInput
              style={tw`bg-gray-100 px-3 py-2 rounded-lg mb-2`}
              placeholder="Jumlah"
              value={(eachBarang.amount !== 0 && eachBarang?.amount?.toString()) || ''}
              keyboardType="numeric"
              onChangeText={(value) => {
                const updatedBarang = Array.from(barang);
                updatedBarang[index].amount = parseInt(value || '0', 10);
                setBarang(updatedBarang);
              }}
            />
            <Button
              title="Add"
              buttonStyle={tw`bg-blue-500`}
              titleStyle={tw`font-bold`}
              disabled={eachBarang.amount === 0}
              onPress={() => {
                handleAddBarang(barang[index], selectedTransaction);
                console.log(barang[index], selectedTransaction);
              }}
            ></Button>
          </View>
        ))
      )}
    </TransactionBottomSheetWrapper>
  );
}

export default TransactionDetailEdit;
