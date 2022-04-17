import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, View, Text, ActivityIndicator } from 'react-native';
import { Button, Icon } from 'react-native-elements';
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
  const [loadingAdd, setLoadingAdd] = useState<{
    [key: string]: boolean;
  } | null>(null);

  const [errorAdd, setErrorAdd] = useState<{
    [key: string]: boolean;
  } | null>(null);

  const [barang, setBarang] = useState<
    (ICatetinBarang & {
      amount: number;
    })[]
  >([]);

  const fetchBarang = useCallback(
    async (isMounted = true) => {
      setLoadingFetch(true);
      try {
        const {
          data: { data },
        }: { data: { data: ICatetinBarang[] } } = await axiosCatetin.get('/barang', {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          },
          params: {
            transactionId: selectedTransaction,
          },
        });
        if (isMounted) {
          setBarang(data?.map((eachBarang) => ({ ...eachBarang, amount: 0 })));
          setLoadingFetch(false);
        }
      } catch (err) {
        // do nothing
      }
    },
    [selectedTransaction],
  );

  useEffect(() => {
    if (selectedTransaction !== props.route.params?.id) {
      props.navigation.navigate('Transaction Detail');
    }
  }, [props.navigation, props.route.params?.id, selectedTransaction]);

  const handleAddBarang = async (
    barang: ICatetinBarang & {
      amount: number;
    },
    transactionId: number | null,
  ) => {
    setLoadingAdd((prevState) => ({
      ...prevState,
      [barang.id]: true,
    }));
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
      fetchBarang();
    } catch (err) {
      // do nothing
    } finally {
      setLoadingAdd((prevState) => ({
        ...prevState,
        [barang.id]: false,
      }));
    }
  };

  const handleInputBarang = () => {
    props.navigation.navigate('Transaction Detail Add Barang', {
      id: selectedTransaction,
    });
  };

  useEffect(() => {
    if ((props.route.params as { from: string })?.from === 'add-barang') {
      fetchBarang();
    }
  }, [props.route.params, fetchBarang]);

  useEffect(() => {
    fetchBarang();
  }, [fetchBarang]);
  return (
    <TransactionBottomSheetWrapper showBack title="Barang" to="Transaction Detail">
      <View style={tw`flex-row flex items-center mb-4`}>
        <View style={tw`flex-grow-1 mr-3`}>
          <TextInput style={tw`bg-gray-100 px-3 py-3 rounded-[12px]`} placeholder="Search" />
        </View>
        <View>
          <Icon name="pluscircleo" type="ant-design" onPress={() => handleInputBarang()} tvParallaxProperties="" />
        </View>
      </View>

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
                if (parseInt(value || '0', 10) > eachBarang.stock && props.route.params?.type === '3') {
                  setErrorAdd((prevState) => ({
                    ...prevState,
                    [index]: true,
                  }));
                } else {
                  setErrorAdd((prevState) => ({
                    ...prevState,
                    [index]: false,
                  }));
                }
                const updatedBarang = Array.from(barang);
                updatedBarang[index].amount = parseInt(value || '0', 10);
                setBarang(updatedBarang);
              }}
            />
            {errorAdd?.[index] && <Text style={tw`text-red-500 mb-2`}>Jumlah melebihi stok yang tersedia</Text>}
            <Button
              title="Add"
              buttonStyle={tw`bg-blue-500`}
              titleStyle={tw`font-bold`}
              disabled={eachBarang.amount === 0 || errorAdd?.[index]}
              onPress={() => {
                handleAddBarang(barang[index], selectedTransaction);
              }}
              loading={loadingAdd?.[barang[index].id]}
            ></Button>
          </View>
        ))
      )}
    </TransactionBottomSheetWrapper>
  );
}

export default TransactionDetailEdit;
