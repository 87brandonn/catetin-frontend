import { PortalProvider } from '@gorhom/portal';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import Barang from '../screens/Barang';
import HomeScreen from '../screens/Home';
import Login from '../screens/Login';
import ProfileScreen from '../screens/Profile';
import Register from '../screens/Register';
import TokoLanding from '../screens/TokoLanding';
import Transaksi from '../screens/Transaksi';
import { Icon } from 'react-native-elements';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  TokoLanding: undefined;
  Barang: undefined;
  Transaksi: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const toastConfig: ToastConfig = {
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

export default function RootNavigation() {
  return (
    <>
      <PortalProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={Login}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Register"
              component={Register}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="TokoLanding"
              component={TokoLanding}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Barang"
              component={Barang}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Transaksi"
              component={Transaksi}
              options={{
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PortalProvider>
      <Toast config={toastConfig} />
    </>
  );
}

export { RootStackParamList };
