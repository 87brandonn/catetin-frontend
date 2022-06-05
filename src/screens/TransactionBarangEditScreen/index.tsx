import { ParamListBase, RouteProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import tw from 'twrnc';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import { useAppSelector } from '../../hooks';
import useUpdateTransactionItem from '../../hooks/useUpdateTransactionItem';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';
import { ICatetinBarangWithTransaksiDetail } from '../../types/barang';

function TransactionBarangEditScreen(props: {
  route: RouteProp<ParamListBase, 'Transaction Edit Quantity'>;
  navigation: any;
}) {
  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);
  const [itemData, setItemData] = useState<ICatetinBarangWithTransaksiDetail | null>(null);
  const [originalItemData, setOriginalItemData] = useState<ICatetinBarangWithTransaksiDetail | null>(null);

  const [error, setError] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    setItemData(props.route.params?.data);
    setOriginalItemData(props.route.params?.data);
  }, [props.route.params?.data]);

  const { mutate: editBarang, isLoading: loadingSave } = useUpdateTransactionItem();

  const handleEditBarang = async () => {
    editBarang(
      {
        transaksi_id: selectedTransaction,
        barang_id: itemData?.id,
        amount: itemData?.ItemTransaction.amount,
        price: itemData?.ItemTransaction.price,
        notes: itemData?.ItemTransaction.notes,
      },
      {
        onSuccess: () => {
          navigation.navigate('TransactionDetailScreen');
        },
      },
    );
  };

  return (
    <AppLayout header isBackEnabled>
      <CatetinScrollView style={tw`px-3`}>
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
            style={tw`${props.route.params?.type === 'income' ? 'text-gray-500' : ''} mb-1`}
            keyboardType={'numeric'}
            pointerEvents={props.route.params?.type === 'income' ? 'none' : 'auto'}
            placeholder="Jumlah"
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
                props.route.params?.type === 'income'
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
      </CatetinScrollView>
    </AppLayout>
  );
}

export default TransactionBarangEditScreen;
