import BottomSheet from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Portal } from '@gorhom/portal';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import React, { useMemo } from 'react';
import tw from 'twrnc';
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
  const snapPoints = useMemo(() => ['75%'], []);

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
          <Stack.Navigator
            screenOptions={screenOptions as StackNavigationOptions}
            initialRouteName="Transaction Detail"
          >
            <Stack.Screen name="Transaction Detail">{(props) => <TransactionDetail {...props} />}</Stack.Screen>
            <Stack.Screen name="Transaction Detail Edit">
              {(props) => <TransactionDetailEdit {...props} />}
            </Stack.Screen>
            <Stack.Screen name="Transaction Edit Quantity">
              {(props) => <TransactionEditQuantity {...props} />}
            </Stack.Screen>
            <Stack.Screen name="Transaction Detail Add Barang">
              {(props) => <TransactionDetailAddBarang {...props} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </BottomSheet>
    </Portal>
  );
}

export default TransactionDetailBottomSheet;
