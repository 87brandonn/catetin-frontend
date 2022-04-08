import BottomSheet from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Portal } from '@gorhom/portal';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import React, { useEffect, useMemo, useState } from 'react';
import { AsyncStorage, Text, View } from 'react-native';
import { Avatar, Button } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import { useAppSelector } from '../../hooks';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';
import { ICatetinTransaksi } from '../../types/transaksi';
import { screenOptions } from '../../utils';
import TransactionDetail from './TransactionDetail';
import TransactionDetailEdit from './TransactionDetailEdit';

interface ITransactionDetailBottomSheet {
  bottomSheetRefDetail: React.RefObject<BottomSheetMethods>;
}

const Stack = createStackNavigator();

function TransactionDetailBottomSheet({ bottomSheetRefDetail }: ITransactionDetailBottomSheet) {
  const snapPoints = useMemo(() => ['90%'], []);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [dataDetail, setDataDetail] = useState<ICatetinTransaksi | null>(null);

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
      console.log(data);
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
    <Portal>
      <BottomSheet
        ref={bottomSheetRefDetail}
        index={-1}
        snapPoints={snapPoints}
        backgroundStyle={tw`bg-white shadow-lg`}
        enablePanDownToClose
      >
        <NavigationContainer>
          <Stack.Navigator screenOptions={screenOptions as StackNavigationOptions}>
            <Stack.Screen name="Transaction Detail">{(props) => <TransactionDetail {...props} />}</Stack.Screen>
            <Stack.Screen name="Transaction Detail Edit">
              {(props) => <TransactionDetailEdit {...props} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </BottomSheet>
    </Portal>
  );
}

export default TransactionDetailBottomSheet;
