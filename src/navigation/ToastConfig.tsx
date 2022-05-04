import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { ToastConfig } from 'react-native-toast-message';
import { Icon } from 'react-native-elements';

export const toastConfig: ToastConfig = {
  customToast: ({ text2 }) => (
    <View style={tw`bg-zinc-700 flex-1 flex-row items-center w-[90%] rounded-lg px-4 py-3`}>
      <View>
        <Icon name="alert-circle" type="feather" tvParallaxProperties="" iconStyle={tw`text-zinc-600`}></Icon>
      </View>
      <View>
        <Text style={tw`text-white ml-3`}>{text2}</Text>
      </View>
    </View>
  ),
  customErrorToast: ({ text2 }) => (
    <View style={tw`bg-red-500 flex-1 flex-row items-center w-[90%] rounded-lg px-4 py-3`}>
      <View>
        <Icon name="alert-circle" type="feather" tvParallaxProperties="" iconStyle={tw`text-white`}></Icon>
      </View>
      <View>
        <Text style={tw`text-white ml-3`}>{text2}</Text>
      </View>
    </View>
  ),
};
