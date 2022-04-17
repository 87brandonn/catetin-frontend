import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import React, { useCallback, useMemo } from 'react';
import tw from 'twrnc';

interface ICatetinBottomSheet {
  children: React.ReactNode;
  bottomSheetRef: React.RefObject<BottomSheet>;
  showBack?: boolean;
  title?: string;
  params?: any;
  to?: any;
}
function CatetinBottomSheet({ children, bottomSheetRef }: ICatetinBottomSheet) {
  const snapPoints = useMemo(() => ['50%', '75%'], []);

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
        backgroundStyle={tw`bg-white shadow-lg`}
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
