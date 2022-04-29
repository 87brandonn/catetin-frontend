import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import React, { useState } from 'react';
import CatetinBottomSheet from '../../components/molecules/BottomSheet';
import CatetinBottomSheetWrapper from '../../components/molecules/BottomSheet/BottomSheetWrapper';
import { useAppSelector } from '../../hooks';
import { RootState } from '../../store';
import { screenOptions } from '../../utils';
import TransactionDetail from './TransactionDetail';
import TransactionDetailAddBarang from './TransactionDetailAddBarang';
import TransactionDetailEdit from './TransactionDetailEdit';
import TransactionEditQuantity from './TransactionEditQuantity';

interface ITransactionDetailBottomSheet {
  bottomSheetRefDetail: React.RefObject<BottomSheetMethods>;
}

const Stack = createStackNavigator();

function TransactionDetailBottomSheet({ bottomSheetRefDetail }: ITransactionDetailBottomSheet) {
  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);
  const [refreshingDetail, setRefreshingDetail] = useState(false);
  return (
    <CatetinBottomSheet bottomSheetRef={bottomSheetRefDetail}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={screenOptions as StackNavigationOptions} initialRouteName="Transaction Detail">
          <Stack.Screen name="Transaction Detail">
            {(props) => (
              <CatetinBottomSheetWrapper
                refreshing={refreshingDetail}
                onRefresh={() => setRefreshingDetail(true)}
                {...props}
                title="Transaksi"
              >
                <TransactionDetail refreshing={refreshingDetail} onRefresh={(val) => setRefreshingDetail(val)} />
              </CatetinBottomSheetWrapper>
            )}
          </Stack.Screen>
          <Stack.Screen name="Transaction Detail Edit">
            {(props) => (
              <CatetinBottomSheetWrapper {...props} title="Detail Barang" showBack to="Transaction Detail">
                <TransactionDetailEdit {...props} />
              </CatetinBottomSheetWrapper>
            )}
          </Stack.Screen>
          <Stack.Screen name="Transaction Edit Quantity">
            {(props) => (
              <CatetinBottomSheetWrapper {...props} title="Jumlah Barang" showBack to="Transaction Detail">
                <TransactionEditQuantity {...props} />
              </CatetinBottomSheetWrapper>
            )}
          </Stack.Screen>
          <Stack.Screen name="Transaction Detail Add Barang">
            {(props) => (
              <CatetinBottomSheetWrapper
                {...props}
                title="Tambah Barang"
                showBack
                to="Transaction Detail Edit"
                params={{ id: selectedTransaction }}
              >
                <TransactionDetailAddBarang {...props} />
              </CatetinBottomSheetWrapper>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </CatetinBottomSheet>
  );
}

export default TransactionDetailBottomSheet;
