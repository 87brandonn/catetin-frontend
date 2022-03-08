import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';

function PlusButton({ onPress = () => ({}) }: { onPress?: () => void }) {
  return (
    <View style={tw`absolute bottom-[30px] right-[20px]`}>
      <TouchableOpacity
        style={tw`w-12 h-12 bg-red-400 rounded-full flex items-center justify-center`}
        onPress={onPress}
      >
        <View>
          <Icon name="plus" type="antdesign" iconStyle={tw`text-white`} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default PlusButton;
