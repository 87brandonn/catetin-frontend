import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';

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

function TabBar({ state, descriptors, navigation }: BottomTabBarProps): React.ReactNode {
  return (
    <View style={{ ...tw`bg-neutral-50 flex-row py-4 border-t border-slate-100` }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const show = options.tabBarStyle?.display !== 'none';
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const getType = () => {
          return bottomNavs.find((nav) => nav.name === route.name);
        };

        return (
          show && (
            <TouchableOpacity
              style={tw`flex-1 items-center`}
              key={index}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
            >
              <Icon
                name={getType()?.icon}
                type={getType()?.type}
                size={18}
                iconStyle={tw`${isFocused ? 'text-blue-500' : 'text-black'} mb-1`}
              />
              <Text style={tw`${isFocused ? 'text-blue-500' : 'text-gray-500'} text-3`}>{label}</Text>
            </TouchableOpacity>
          )
        );
      })}
    </View>
  );
}

export default TabBar;
