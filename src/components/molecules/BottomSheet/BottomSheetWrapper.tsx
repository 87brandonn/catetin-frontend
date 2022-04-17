import { BottomSheetScrollView, TouchableOpacity } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { RefreshControl, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import CatetinScrollView from '../../../layouts/ScrollView';

interface ICatetinBottomSheetWrapper {
  children: React.ReactNode;
  showBack?: boolean;
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
  title = '',
  params = {},
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
    <CatetinScrollView
      style={tw`bg-white px-3`}
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
        <View>
          <Text style={tw`font-bold text-xl text-center`}>{title}</Text>
        </View>
        <View />
      </View>
      <View style={tw`flex-1`}>{children}</View>
      <View style={tw`mb-[72px]`} />
    </CatetinScrollView>
  );
}

export default CatetinBottomSheetWrapper;
