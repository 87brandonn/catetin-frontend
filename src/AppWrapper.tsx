import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigation from './navigation';
import { axiosCatetin } from './api';
import CatetinToast from './components/molecules/Toast';
import { useAppSelector, useAppDispatch } from './hooks';
import { RootState } from './store';
import { setProfile, setStore, setLoggedIn, setAccessToken } from './store/features/authSlice';
import { setActiveStore } from './store/features/storeSlice';

function AppWrapper() {
  const [appReady, setAppReady] = useState(false);
  const { accessToken } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  const getVerifyCode = useCallback(async (accessToken) => {
    try {
      await axiosCatetin.get(`/auth/verify`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      if (accessToken) {
        const promises = [];
        promises.push(axiosCatetin.get(`/store`), axiosCatetin.get(`/auth/profile`));
        const [
          {
            data: { data: dataStore },
          },
          {
            data: { data: dataProfile },
          },
        ] = await Promise.all(promises);
        if (!dataProfile?.verified) {
          await getVerifyCode(accessToken);
        }
        dispatch(setActiveStore(dataStore?.[0]?.id || null));
        dispatch(setProfile(dataProfile));
        dispatch(setStore(dataStore));
        dispatch(setLoggedIn(true));
        setAppReady(true);
      }
    } catch (err: any) {
      console.error(err);
      setAppReady(true);
      CatetinToast(err?.response?.status, 'error', 'Failed to authenticate user.');
    }
  }, [accessToken, dispatch, getVerifyCode]);

  useEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        dispatch(setAccessToken(token));
      } else {
        setAppReady(true);
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={tw`flex-1`}>
        <View style={tw`flex-1`} onLayout={onLayoutRootView}>
          <RootNavigation />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default AppWrapper;
