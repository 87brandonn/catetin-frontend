import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';

function Bottom() {
  const { navigate } = useNavigation();
  return (
    <View style={tw`bg-gray-300 flex flex-row py-3`}>
      <View style={tw`flex-1 items-center`}>
        <TouchableOpacity
          onPress={() => {
            navigate('Home');
          }}
        >
          <Icon name="home" iconStyle={tw`text-gray-100`} />
          <Text style={tw`text-gray-500`}>Home</Text>
        </TouchableOpacity>
      </View>
      <View style={tw`flex-1 items-center`}>
        <TouchableOpacity>
          <Icon name="user" type="font-awesome" iconStyle={tw`text-gray-100`} />
          <Text style={tw`text-gray-500`}>Transaksi</Text>
        </TouchableOpacity>
      </View>
      <View style={tw`flex-1 items-center`}>
        <TouchableOpacity
          onPress={() => {
            navigate('Barang');
          }}
        >
          <Icon name="inventory" iconStyle={tw`text-gray-100`} />
          <Text style={tw`text-gray-500`}>Barang</Text>
        </TouchableOpacity>
      </View>
      <View style={tw`flex-1 items-center`}>
        <TouchableOpacity>
          <Icon name="user" type="font-awesome" iconStyle={tw`text-gray-100`} />
          <Text style={tw`text-gray-500`}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Bottom;
