import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { Avatar, Icon } from 'react-native-elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation';
import { useNavigation } from '@react-navigation/native';

function Header() {
  const { navigate } = useNavigation();

  return (
    <View style={tw`bg-gray-100 py-4 px-2 flex flex-row justify-between items-center`}>
      <View>
        <Icon name="menu" iconStyle={tw`text-gray-400`} size={28}></Icon>
      </View>
      <View>
        <TouchableOpacity
          onPress={() => {
            navigate('Profile');
          }}
        >
          <Avatar
            size={36}
            rounded
            source={{
              uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1180&q=80',
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Header;
