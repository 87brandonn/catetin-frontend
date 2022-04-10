import { ParamListBase, RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { Avatar, Button } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinInput from '../../components/molecules/Input';
import { useAppSelector } from '../../hooks';
import { RootState } from '../../store';
import { ICatetinBarangWithTransaksiDetail } from '../../types/barang';
import TransactionBottomSheetWrapper from './TransactionBottomSheetWrapper';

function TransactionEditQuantity(props: {
  route: RouteProp<ParamListBase, 'Transaction Edit Quantity'>;
  navigation: any;
}) {
  const [loadingSave, setLoadingSave] = useState(false);

  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);
  const [itemData, setItemData] = useState<ICatetinBarangWithTransaksiDetail | null>(null);
  const [originalItemData, setOriginalItemData] = useState<ICatetinBarangWithTransaksiDetail | null>(null);

  const [error, setError] = useState(false);

  useEffect(() => {
    if (selectedTransaction !== props.route.params?.id) {
      props.navigation.navigate('Transaction Detail');
    }
  }, [props.navigation, props.route.params?.id, selectedTransaction]);

  useEffect(() => {
    setItemData(props.route.params?.data);
    setOriginalItemData(props.route.params?.data);
  }, [props.route.params?.data]);

  const handleEditBarang = async () => {
    setLoadingSave(true);
    try {
      await axiosCatetin.put(
        '/transaksi/detail',
        {
          transaksi_id: selectedTransaction,
          barang_id: itemData?.id,
          amount: itemData?.ItemTransaction.amount,
        },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          },
        },
      );
      Toast.show({
        type: 'customToast',
        text2: `Berhasil melakukan update jumlah`,
        position: 'bottom',
      });
      props.navigation.navigate('Transaction Detail');
    } catch (err) {
      console.log(err);
      Toast.show({
        type: 'customToast',
        text2: `Gagal melakukan update jumlah barang`,
        position: 'bottom',
      });
    } finally {
      setLoadingSave(false);
    }
    console.log(itemData);
  };

  return (
    <TransactionBottomSheetWrapper showBack title="Edit Barang" to="Transaction Detail">
      <View style={tw`flex items-center`}>
        <Avatar
          size={300}
          source={{
            uri: itemData?.picture || undefined,
          }}
          avatarStyle={tw`rounded-[8px]`}
          containerStyle={tw`bg-gray-300 rounded-[12px] mb-4`}
          key={itemData?.picture}
        ></Avatar>
      </View>
      <View style={tw`mb-4`}>
        <CatetinInput
          value={(itemData?.ItemTransaction.amount !== 0 && itemData?.ItemTransaction.amount.toString()) || ''}
          onChangeText={(text) => {
            if (
              originalItemData?.stock + originalItemData?.ItemTransaction.amount - parseInt(text || '0', 10) < 0 &&
              props.route.params.type === '3'
            ) {
              setError(true);
            } else {
              setError(false);
            }
            setItemData(
              (prevState) =>
                ({
                  ...prevState,
                  ItemTransaction: {
                    ...(prevState?.ItemTransaction || {}),
                    amount: parseInt(text || '0', 10),
                  },
                } as ICatetinBarangWithTransaksiDetail),
            );
          }}
          keyboardType="numeric"
          style={tw`border-0 border-b`}
          placeholder="Jumlah"
          bottomSheet={true}
        ></CatetinInput>
      </View>
      {error && (
        <View style={tw`mb-4`}>
          <Text style={tw`text-red-500`}>Jumlah barang pada transaksi ini melebihi stok yang tersedia</Text>
        </View>
      )}
      <View>
        <Button
          title="Save"
          buttonStyle={tw`bg-blue-500`}
          titleStyle={tw`font-bold`}
          onPress={() => {
            handleEditBarang();
          }}
          disabled={error || itemData?.ItemTransaction.amount === 0}
          loading={loadingSave}
        />
      </View>
    </TransactionBottomSheetWrapper>
  );
}

export default TransactionEditQuantity;
