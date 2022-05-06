import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Dimensions, Platform, Text, TouchableOpacity, View } from 'react-native';
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

const IPHONE12_H = 844;
const IPHONE12_Max = 926;
const IPHONE12_Mini = 780;
const { height: D_HEIGHT, width: D_WIDTH } = Dimensions.get('window');

function TabBar({ state, descriptors, navigation }: BottomTabBarProps): React.ReactNode {
  return (
    <View
      style={{
        ...tw`bg-neutral-50 flex-row border-t border-slate-100 pt-4 ${
          Platform.OS === 'ios' && (D_HEIGHT === IPHONE12_H || D_HEIGHT === IPHONE12_Max || D_HEIGHT === IPHONE12_Mini)
            ? 'pb-[28]'
            : 'pb-4'
        }`,
      }}
    >
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
