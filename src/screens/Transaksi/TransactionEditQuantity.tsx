import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParamListBase, RouteProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Avatar, Button } from 'react-native-elements';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import { RootState } from '../../store';
import { ICatetinBarangWithTransaksiDetail } from '../../types/barang';

function TransactionEditQuantity(props: {
  route: RouteProp<ParamListBase, 'Transaction Edit Quantity'>;
  navigation: any;
}) {
  const [loadingSave, setLoadingSave] = useState(false);

  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);
  const [itemData, setItemData] = useState<ICatetinBarangWithTransaksiDetail | null>(null);
  const [originalItemData, setOriginalItemData] = useState<ICatetinBarangWithTransaksiDetail | null>(null);

  const [error, setError] = useState(false);

  const navigation = useNavigation();

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
      await axiosCatetin.put('/transaksi/detail', {
        transaksi_id: selectedTransaction,
        barang_id: itemData?.id,
        amount: itemData?.ItemTransaction.amount,
        price: itemData?.ItemTransaction.price,
        notes: itemData?.ItemTransaction.notes,
      });
      CatetinToast(200, 'default', 'Berhasil melakukan update detail');
      navigation.navigate('Transaction Detail');
    } catch (err: any) {
      CatetinToast(err?.response?.status, 'error', 'Gagal melakukan update detail');
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <View style={tw`flex-1`}>
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
      <View style={tw`mb-2`}>
        <Text style={tw`text-base font-medium`}>Harga</Text>
        <CatetinInput
          value={(itemData?.ItemTransaction.price !== 0 && itemData?.ItemTransaction.price?.toString()) || ''}
          onChangeText={(text) => {
            setItemData(
              (prevState) =>
                ({
                  ...prevState,
                  ItemTransaction: {
                    ...(prevState?.ItemTransaction || {}),
                    price: parseInt(text || '0', 10),
                  },
                } as ICatetinBarangWithTransaksiDetail),
            );
          }}
          style={tw`${props.route.params.type === '3' ? 'text-gray-500' : ''} mb-1`}
          keyboardType={'numeric'}
          pointerEvents={props.route.params.type === '3' ? 'none' : 'auto'}
          placeholder="Jumlah"
          bottomSheet={true}
        ></CatetinInput>
        <Text style={tw`text-gray-500`}>
          Note: Harga tidak dapat diubah apabila jenis transaksi adalah penjualan barang.
        </Text>
        <Text style={tw`text-base font-medium mt-2`}>Jumlah</Text>
        <CatetinInput
          value={(itemData?.ItemTransaction.amount !== 0 && itemData?.ItemTransaction.amount.toString()) || ''}
          onChangeText={(text) => {
            if (
              (originalItemData?.stock || 0) +
                (originalItemData?.ItemTransaction.amount || 0) -
                parseInt(text || '0', 10) <
                0 &&
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
          placeholder="Jumlah"
          bottomSheet={true}
        ></CatetinInput>
        {error && (
          <View style={tw`mt-2`}>
            <Text style={tw`text-red-500`}>Jumlah barang pada transaksi ini melebihi stok yang tersedia</Text>
          </View>
        )}
        <Text style={tw`text-base font-medium mt-2`}>Notes</Text>
        <CatetinInput
          value={itemData?.ItemTransaction.notes}
          onChangeText={(text) => {
            setItemData(
              (prevState) =>
                ({
                  ...prevState,
                  ItemTransaction: {
                    ...(prevState?.ItemTransaction || {}),
                    notes: text,
                  },
                } as ICatetinBarangWithTransaksiDetail),
            );
          }}
          placeholder="Notes"
          bottomSheet={true}
        ></CatetinInput>
      </View>

      <View>
        <CatetinButton
          title="Save"
          onPress={() => {
            handleEditBarang();
          }}
          disabled={error || itemData?.ItemTransaction.amount === 0}
          loading={loadingSave}
        />
      </View>
    </View>
  );
}

export default TransactionEditQuantity;
