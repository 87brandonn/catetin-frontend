import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Portal } from '@gorhom/portal';
import BottomSheet from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc';

interface ITransactionSortBottomSheet {
  bottomSheetRefFilter: React.RefObject<BottomSheetMethods>;
}
function TransactionSortBottomSheet({ bottomSheetRefFilter }: ITransactionSortBottomSheet) {
  const snapPoints = useMemo(() => ['90%'], []);
  return (
    <Portal>
      <BottomSheet
        ref={bottomSheetRefFilter}
        index={-1}
        snapPoints={snapPoints}
        backgroundStyle={tw`bg-white shadow-lg`}
        enablePanDownToClose
      >
        <View style={tw`flex-1 px-3`}>
          <Text style={tw`text-xl text-center font-bold mb-3`}>Sort</Text>
          {/* {Object.keys(transaksi?.[0] || {}).map((field) => (
            <TouchableOpacity key={field}>
              <View style={tw`flex flex-row justify-between px-4`}>
                <View style={tw`py-3 mb-2 rounded-[12px]`}>
                  <Text>{titleCase(field)}</Text>
                </View>
                <View>
                  <Icon name="sort-desc" type="font-awesome" iconStyle={tw`text-gray-200`} tvParallaxProperties="" />
                </View>
              </View>
            </TouchableOpacity>
          ))} */}
        </View>
      </BottomSheet>
    </Portal>
  );
}

export default TransactionSortBottomSheet;
