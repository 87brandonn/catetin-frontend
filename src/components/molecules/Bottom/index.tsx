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
      type: 'font-awesome-5',
    },
    {
      name: 'Transaksi',
      icon: 'history',
      type: 'font-awesome-5',
    },
    {
      name: 'Barang',
      icon: 'box',
      type: 'font-awesome-5',
    },
    {
      name: 'Profile',
      icon: 'user-circle',
      type: 'font-awesome-5',
    },
  ];

  useEffect(() => {
    console.log(route.name);
  }, [route]);
  return (
    <View style={{ ...tw`bg-neutral-50 flex flex-row pt-3 pb-[40px] border-t border-slate-100` }}>
      {bottomNavs.map((nav, index) => (
        <View style={tw`flex-1 items-center`} key={index}>
          <TouchableOpacity
            onPress={() => {
              navigate(nav.name);
            }}
            style={tw`mb-1`}
          >
            <Icon
              name={nav.icon}
              type={nav.type}
              size={18}
              iconStyle={tw`${nav.name === route.name ? 'text-blue-500' : 'text-black'}`}
            />
          </TouchableOpacity>
          <Text style={tw`${nav.name === route.name ? 'text-blue-500' : 'text-gray-500'} text-3`}>{nav.name}</Text>
        </View>
      ))}
    </View>
  );
}

export default Bottom;
