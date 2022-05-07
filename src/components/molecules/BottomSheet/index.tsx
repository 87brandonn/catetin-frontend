import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import React, { useCallback } from 'react';
import tw from 'twrnc';

interface ICatetinBottomSheet {
  children: React.ReactNode;
  bottomSheetRef: React.RefObject<BottomSheet>;
  snapPoints?: string[];
}
function CatetinBottomSheet({ children, bottomSheetRef, snapPoints = ['50%', '75%'] }: ICatetinBottomSheet) {
  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pres />,
    [],
  );

  return (
    <Portal>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backgroundStyle={tw`bg-white`}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBlurBehavior="restore"
      >
        {children}
      </BottomSheet>
    </Portal>
  );
}

export default CatetinBottomSheet;
