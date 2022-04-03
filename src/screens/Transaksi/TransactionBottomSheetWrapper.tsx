import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import CatetinScrollView from '../../layouts/ScrollView';

function TransactionBottomSheetWrapper({
  title,
  children,
  showBack,
}: {
  title: string;
  children: React.ReactNode;
  showBack?: boolean;
}) {
  const { navigate } = useNavigation();
  return (
    <CatetinScrollView style={tw`flex-1 px-4`}>
      <View style={tw`relative`}>
        {showBack && (
          <View style={tw`absolute left-0 z-10`}>
            <TouchableOpacity onPress={() => requestAnimationFrame(() => navigate('Transaction Default'))}>
              <Icon name="chevron-left" type="feather" tvParallaxProperties="" />
            </TouchableOpacity>
          </View>
        )}
        <View>
          <Text style={tw`font-bold text-lg text-center`}>{title}</Text>
        </View>
        <View />
      </View>
      <View style={tw`flex-1 pt-4 mb-[48px]`}>{children}</View>
    </CatetinScrollView>
  );
}

export default TransactionBottomSheetWrapper;
