import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';

interface ICatetinBottomSheet {
  children: React.ReactNode;
  bottomSheetRef: React.RefObject<BottomSheet>;
  showBack?: boolean;
  title?: string;
  params?: any;
  to?: any;
}
function CatetinBottomSheet({
  children,
  bottomSheetRef,
  showBack = false,
  title = '',
  params = {},
  to = '',
}: ICatetinBottomSheet) {
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  const { navigate } = useNavigation();

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
      >
        {/* <BottomSheetScrollView style={tw`flex-1 flex`}> */}
        {/* <View style={tw`relative`}>
            {showBack && (
              <View style={tw`absolute left-0 z-10`}>
                <TouchableOpacity onPress={() => requestAnimationFrame(() => navigate(to as never, params as never))}>
                  <Icon name="chevron-left" type="feather" tvParallaxProperties="" />
                </TouchableOpacity>
              </View>
            )}
            <View>
              <Text style={tw`font-bold text-xl text-center`}>{title}</Text>
            </View>
            <View />
          </View> */}
        {children}
        {/* <BottomSheetScrollView contentContainerStyle={tw`flex-1 px-3 pt-4 bg-white`}>{children}</BottomSheetScrollView> */}
        {/* </BottomSheetScrollView> */}
      </BottomSheet>
    </Portal>
  );
}

export default CatetinBottomSheet;
