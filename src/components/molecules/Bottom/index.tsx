import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';

function Bottom() {
  const { navigate } = useNavigation();
  const route = useRoute();

  const bottomNavs = [
    {
      name: 'Home',
      icon: 'home',
      type: 'antdesign',
    },
    {
      name: 'Transaksi',
      icon: 'history',
      type: undefined,
    },
    {
      name: 'Barang',
      icon: 'box',
      type: 'feather',
    },
    {
      name: 'Profile',
      icon: 'user',
      type: 'simple-line-icon',
    },
  ];

  useEffect(() => {
    console.log(route.name);
  }, [route]);
  return (
    <View style={{ ...tw`bg-white shadow flex flex-row pt-3 pb-[48px] border-t border-slate-100` }}>
      {bottomNavs.map((nav, index) => (
        <View style={tw`flex-1 items-center`} key={index}>
          <TouchableOpacity
            onPress={() => {
              navigate(nav.name);
            }}
          >
            <Icon
              name={nav.icon}
              type={nav.type}
              iconStyle={tw`${nav.name === route.name ? 'text-blue-500' : 'text-gray-800'}`}
            />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

export default Bottom;
