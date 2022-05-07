import { BottomSheetScrollView, TouchableOpacity } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { RefreshControl, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';

interface ICatetinBottomSheetWrapper {
  children: React.ReactNode;
  showBack?: boolean;
  showRight?: boolean;
  onPressRight?: () => void;
  rightTitle?: string;
  title?: string;
  params?: any;
  to?: any;
  single?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  refreshable?: boolean;
}

function CatetinBottomSheetWrapper({
  showBack = false,
  showRight = false,
  rightTitle = '',
  title = '',
  params = {},
  onPressRight = () => ({}),
  to = '',
  single = false,
  children,
  refreshing = false,
  refreshable = true,
  onRefresh = () => ({}),
}: ICatetinBottomSheetWrapper) {
  let navigation: any;
  if (!single) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const navigationHooks = useNavigation();
    navigation = navigationHooks;
  }

  return (
    <BottomSheetScrollView
      style={tw`px-4`}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      refreshControl={
        refreshable ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              onRefresh();
            }}
          />
        ) : undefined
      }
    >
      <View style={tw`relative mb-3`}>
        {showBack && (
          <View style={tw`absolute left-0 z-10`}>
            <TouchableOpacity
              onPress={() => requestAnimationFrame(() => navigation?.navigate(to as never, params as never))}
            >
              <Icon name="chevron-left" type="feather" tvParallaxProperties="" />
            </TouchableOpacity>
          </View>
        )}
        <Text style={tw`font-bold text-xl text-center`}>{title}</Text>
        {showRight && (
          <View style={tw`absolute right-0 z-10`}>
            <TouchableOpacity onPress={() => requestAnimationFrame(() => onPressRight())}>
              <Text style={tw`font-bold text-lg text-right text-blue-500`}>{rightTitle}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View />
      </View>
      <View style={tw`flex-1`}>{children}</View>
    </BottomSheetScrollView>
  );
}

export default CatetinBottomSheetWrapper;
