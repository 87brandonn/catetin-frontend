import { PortalProvider } from '@gorhom/portal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ImageBackground, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { ToastConfig } from 'react-native-toast-message';
import tw from 'twrnc';
import { axiosCatetin } from '../api';
import CatetinToast from '../components/molecules/Toast';
import { useAppDispatch, useAppSelector } from '../hooks';
import Barang from '../screens/Barang';
import HomeScreen from '../screens/Home';
import Login from '../screens/Login';
import ProfileScreen from '../screens/Profile';
import Register from '../screens/Register';
import TokoLanding from '../screens/TokoLanding';
import Transaksi from '../screens/Transaksi';
import VerifyEmail from '../screens/VerifyEmail';
import { RootState } from '../store';
import { setAccessToken, setLoggedIn, setProfile, setStore } from '../store/features/authSlice';
import { setActiveStore } from '../store/features/storeSlice';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  TokoLanding: undefined;
  Barang: undefined;
  Transaksi: undefined;
  VerifyEmail: undefined;
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
  const [loading, setLoading] = useState(true);

  const { accessToken, store, profile, loggedIn } = useAppSelector((state: RootState) => state.auth);

  const dispatch = useAppDispatch();

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      if (accessToken) {
        const promises = [];
        promises.push(
          axiosCatetin.get(`/store`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
          axiosCatetin.get(`/auth/profile`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
        );
        const [
          {
            data: { data: dataStore },
          },
          {
            data: { data: dataProfile },
          },
        ] = await Promise.all(promises);
        dispatch(setActiveStore(dataStore?.[0]?.id || null));
        dispatch(setProfile(dataProfile));
        dispatch(setStore(dataStore));
        dispatch(setLoggedIn(true));
      }
    } catch (err) {
      CatetinToast('error', 'Failed to authenticate user.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, dispatch]);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        dispatch(setAccessToken(token));
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (loading) {
    return <ImageBackground source={require('../assets/splash.png')} style={tw`w-full h-full`} />;
  }
  return (
    <SafeAreaProvider>
      <PortalProvider>
        <NavigationContainer>
          <Stack.Navigator>
            {!loggedIn ? (
              <>
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
              </>
            ) : !profile?.verified ? (
              <Stack.Screen
                name="VerifyEmail"
                component={VerifyEmail}
                options={{
                  headerShown: false,
                }}
              />
            ) : !store || store.length === 0 ? (
              <Stack.Screen
                name="TokoLanding"
                component={TokoLanding}
                options={{
                  headerShown: false,
                }}
              />
            ) : (
              store &&
              profile && (
                <>
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
                </>
              )
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PortalProvider>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

export { RootStackParamList };
