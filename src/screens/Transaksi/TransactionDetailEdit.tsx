import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParamListBase, RouteProp, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Avatar, Button, Icon } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import { RootState } from '../../store';
import { ICatetinBarang } from '../../types/barang';

function TransactionDetailEdit(props: { route: RouteProp<ParamListBase, 'Transaction Detail Edit'>; navigation: any }) {
  const [loadingFetch, setLoadingFetch] = useState(true);

  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);
  const [loadingAdd, setLoadingAdd] = useState<{
    [key: string]: boolean;
  } | null>(null);

  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const [errorAdd, setErrorAdd] = useState<{
    [key: string]: boolean;
  } | null>(null);

  const [barang, setBarang] = useState<
    (ICatetinBarang & {
      amount: number;
    })[]
  >([]);

  const navigation = useNavigation();

  const fetchBarang = useCallback(
    async (isMounted = true, search = '') => {
      setLoadingFetch(true);
      try {
        const {
          data: { data },
        }: { data: { data: ICatetinBarang[] } } = await axiosCatetin.get(`/barang/${activeStore}/list`, {
          params: {
            transactionId: selectedTransaction,
            nama_barang: search,
          },
        });
        if (isMounted) {
          setBarang(data?.map((eachBarang) => ({ ...eachBarang, amount: 0 })));
          setLoadingFetch(false);
        }
      } catch (err: any) {
        CatetinToast(err?.response?.status, 'error', 'Terjadi kesalahan pada server. Gagal mengambil data barang.');
      }
    },
    [activeStore, selectedTransaction],
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
      await axiosCatetin.post(`/transaksi/detail`, {
        transaksi_id: transactionId,
        barang_id: barang.id,
        amount: barang.amount,
      });
      fetchBarang();
    } catch (err: any) {
      CatetinToast(err?.response?.status, 'error', 'Terjadi kesalahan pada server. Gagal melakukan update barang.');
    } finally {
      setLoadingAdd((prevState) => ({
        ...prevState,
        [barang.id]: false,
      }));
    }
  };

  const handleInputBarang = () => {
    navigation.navigate('Transaction Detail Add Barang', {
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
    <View style={tw`flex-1`}>
      <View style={tw`flex-row flex items-center mb-4`}>
        <View style={tw`flex-grow-1 mr-3`}>
          <CatetinInput
            bottomSheet
            style={tw`bg-gray-100 px-3 py-3 rounded-[12px] border-0`}
            placeholder="Search"
            onChangeText={(value) => {
              fetchBarang(true, value);
            }}
          />
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
            <CatetinInput
              bottomSheet
              style={tw`bg-gray-100 px-3 py-2 rounded-lg mb-2 border-0`}
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
    </View>
  );
}

export default TransactionDetailEdit;
