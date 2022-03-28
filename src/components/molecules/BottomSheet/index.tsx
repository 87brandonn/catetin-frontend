import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import tw from 'twrnc';

interface ICatetinBottomSheet {
  children: React.ReactNode;
  bottomSheetRef: React.RefObject<BottomSheetModalMethods>;
}
function CatetinBottomSheet({ children, bottomSheetRef }: ICatetinBottomSheet) {
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      backgroundStyle={tw`bg-white shadow-lg`}
      enablePanDownToClose
    >
      <View style={tw`flex-1 px-3 pt-4`}>{children}</View>
    </BottomSheetModal>
  );
}

export default CatetinBottomSheet;
