import BottomSheet, { BottomSheetScrollView, TouchableOpacity } from '@gorhom/bottom-sheet';
import tw from 'twrnc';
import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

interface ICatetinBottomSheetWrapper {
  children: React.ReactNode;
  showBack?: boolean;
  title?: string;
  params?: any;
  to?: any;
}

function CatetinBottomSheetWrapper({
  showBack = false,
  title = '',
  params = {},
  to = '',
  children,
}: ICatetinBottomSheetWrapper) {
  const { navigate } = useNavigation();
  return (
    <BottomSheetScrollView style={tw`bg-white px-3`}>
      <View style={tw`relative mb-3`}>
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
      </View>
      <View style={tw`flex-1`}>{children}</View>
    </BottomSheetScrollView>
  );
}

export default CatetinBottomSheetWrapper;
