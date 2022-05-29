import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';

function Bottom() {
  const { navigate } = useNavigation();
  const route = useRoute();

  const bottomNavs = [
    {
      name: 'Home',
      icon: 'home',
      type: 'feather',
    },
    {
      name: 'Transaksi',
      icon: 'history',
      type: 'feather',
    },
    {
      name: 'Barang',
      icon: 'box',
      type: 'feather',
    },
    {
      name: 'Profile',
      icon: 'user-circle',
      type: 'feather',
    },
  ];

  useEffect(() => {
    console.log(route.name);
  }, [route]);
  return (
    <View style={{ ...tw`bg-neutral-50 flex flex-row pt-3 pb-3 border-t border-slate-100` }}>
      {bottomNavs.map((nav, index) => (
        <TouchableOpacity
          style={tw`flex-1 items-center`}
          key={index}
          onPress={() => {
            navigate(nav.name);
          }}
        >
          <Icon
            name={nav.icon}
            type={nav.type}
            size={18}
            iconStyle={tw`${nav.name === route.name ? 'text-blue-500' : 'text-black'} mb-1`}
          />
          <Text style={tw`${nav.name === route.name ? 'text-blue-500' : 'text-gray-500'} text-3`}>{nav.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default Bottom;
