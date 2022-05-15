import { PortalProvider } from '@gorhom/portal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { axiosCatetin } from '../api';
import { useAppDispatch, useAppSelector } from '../hooks';
import Barang from '../screens/Barang';
import HomeScreen from '../screens/Home';
import Login from '../screens/Login';
import ProfileScreen from '../screens/Profile';
import Register from '../screens/Register';
import ResetPassword from '../screens/ResetPassword';
import EmailInputResetPassword from '../screens/ResetPassword/EmailInput';
import VerifyResetPassword from '../screens/ResetPassword/Verification';
import TokoLanding from '../screens/TokoLanding';
import Transaksi from '../screens/Transaksi';
import VerifyEmail from '../screens/VerifyEmail';
import { RootState } from '../store';
import TabBar from './TabBar';
import { toastConfig } from './ToastConfig';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  TokoLanding: undefined;
  Barang: undefined;
  Transaksi: undefined;
  VerifyEmail: undefined;
  ResetPassword: undefined;
  VerifyResetPassword: undefined;
  EmailInputResetPassword: undefined;
};

const ProfileScreenWrapperStack = createStackNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function ProfileScreenNavigator() {
  return (
    <ProfileScreenWrapperStack.Navigator>
      <ProfileScreenWrapperStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="VerifyResetPassword"
        component={VerifyResetPassword}
        options={{
          headerShown: false,
        }}
      />
    </ProfileScreenWrapperStack.Navigator>
  );
}

export default function RootNavigation() {
  const [loading, setLoading] = useState(true);

  const { accessToken, store, profile, loggedIn } = useAppSelector((state: RootState) => state.auth);

  const dispatch = useAppDispatch();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const [notification, setNotification] = useState<Notifications.Notification | boolean>(false);

  useEffect(() => {
    registerForPushNotificationsAsync().then(async (token) => {
      try {
        const {
          data: {
            data: { id },
          },
        } = await axiosCatetin.post(`/push-notification/register`, {
          token,
        });
        await AsyncStorage.setItem('deviceId', id.toString());
      } catch (err) {
        console.error(err);
      }
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [dispatch]);

  return (
    <>
      <PortalProvider>
        <NavigationContainer>
          {!loggedIn ? (
            <Stack.Navigator>
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
                name="EmailInputResetPassword"
                component={EmailInputResetPassword}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ResetPassword"
                component={ResetPassword}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="VerifyResetPassword"
                component={VerifyResetPassword}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          ) : !profile?.verified ? (
            <Stack.Navigator>
              <Stack.Screen
                name="VerifyEmail"
                component={VerifyEmail}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          ) : !store || store.length === 0 ? (
            <Stack.Navigator>
              <Stack.Screen
                name="TokoLanding"
                component={TokoLanding}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          ) : (
            store &&
            profile && (
              <Tab.Navigator tabBar={TabBar}>
                <Tab.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{
                    headerShown: false,
                  }}
                />
                <Tab.Screen
                  name="Transaksi"
                  component={Transaksi}
                  options={{
                    headerShown: false,
                  }}
                />
                <Tab.Screen
                  name="Barang"
                  component={Barang}
                  options={{
                    headerShown: false,
                  }}
                />
                <Tab.Screen
                  name="Profile"
                  component={ProfileScreenNavigator}
                  options={{
                    headerShown: false,
                  }}
                />
              </Tab.Navigator>
            )
          )}
        </NavigationContainer>
      </PortalProvider>
      <Toast config={toastConfig} />
    </>
  );
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        experienceId: '@87brandonn/catetin',
      })
    ).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export { RootStackParamList };
