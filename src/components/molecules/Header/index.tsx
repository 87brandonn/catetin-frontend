import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import tw from 'twrnc';

function Header({ title = '' }: { title?: string }) {
  const { navigate } = useNavigation();

  return (
    <View style={tw`bg-gray-100 pt-4 pb-4 px-2 flex flex-row justify-between items-center`}>
      <View>
        <Text style={tw`text-2xl font-bold`}>{title}</Text>
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
